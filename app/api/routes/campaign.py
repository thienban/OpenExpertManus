import asyncio
import uuid
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.api.schemas.campaign import CampaignCreateRequest, CampaignResponse
from app.api.logger_hook import campaign_queues, current_campaign_id
from app.agent.marketing import AgentMarketing
from app.agent.manus import Manus
from app.agent.data_analysis import DataAnalysis
from app.agent.linkedin import AgentLinkedIn
from app.flow.flow_factory import FlowFactory, FlowType
from app.logger import logger

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])

async def run_campaign_task(cid: str, prompt: str, selected_agent: str):
    """Background task to run the flow for a campaign."""
    current_campaign_id.set(cid)
    try:
        # Determine the agent based on selection
        agents = {"manus": Manus()}
        if selected_agent.lower() == "marketing":
            agents["marketing"] = AgentMarketing()
        elif selected_agent.lower() == "data_analysis":
            agents["data_analysis"] = DataAnalysis()
        elif selected_agent.lower() == "linkedin":
            agents["linkedin"] = AgentLinkedIn()

        flow = FlowFactory.create_flow(
            flow_type=FlowType.PLANNING,
            agents=agents,
        )

        logger.info(f"Starting execution of campaign {cid} for prompt: {prompt}")
        result = await flow.execute(prompt)
        logger.info(f"Execution completed for campaign {cid}")

        # Send terminal message
        if cid in campaign_queues:
            campaign_queues[cid].put_nowait({"event": "text", "data": f"Execution completed:\n\n{result}"})

    except Exception as e:
        logger.error(f"Error executing campaign {cid}: {str(e)}")
        if cid in campaign_queues:
            campaign_queues[cid].put_nowait({"event": "text", "data": f"Error: {str(e)}"})
    finally:
        # Give stream a moment to flush, then close out queue
        await asyncio.sleep(2.0)
        if cid in campaign_queues:
            campaign_queues[cid].put_nowait(None) # Sentinel to stop stream


@router.post("", response_model=CampaignResponse)
async def create_campaign(request: CampaignCreateRequest):
    cid = str(uuid.uuid4())

    # Create the logging queue
    campaign_queues[cid] = asyncio.Queue()

    # Start the task in background
    asyncio.create_task(run_campaign_task(cid, request.prompt, request.selected_agent))

    return CampaignResponse(
        campaign_id=cid,
        status="initialized",
        stream_url=f"/api/v1/campaigns/{cid}/stream"
    )

@router.get("/{campaign_id}/stream")
async def stream_campaign(campaign_id: str):
    """Streams Server-Sent Events from the log queue of the campaign."""
    if campaign_id not in campaign_queues:
        return {"error": "Campaign not found"}, 404

    queue = campaign_queues[campaign_id]

    async def event_generator():
        while True:
            msg = await queue.get()
            if msg is None:  # Sentinel value
                queue.task_done()
                # Clean up memory
                del campaign_queues[campaign_id]
                break

            # Serialize SSE data
            event = msg.get("event", "text")
            data = msg.get("data", "")

            # Formatting for SSE
            if isinstance(data, dict):
                data_str = json.dumps(data)
            else:
                data_str = str(data).replace('\n', ' ')

            yield f"event: {event}\ndata: {data_str}\n\n"

            queue.task_done()

    return StreamingResponse(event_generator(), media_type="text/event-stream")
