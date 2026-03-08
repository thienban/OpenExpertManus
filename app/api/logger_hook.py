import contextvars
from loguru import logger
import asyncio
import json

# Context variable to hold the current campaign ID for log routing
current_campaign_id = contextvars.ContextVar("current_campaign_id", default=None)

# Store event queues for active campaigns: {campaign_id: asyncio.Queue}
campaign_queues = {}

def sse_sink(message):
    """
    Loguru sink that routes log messages to the appropriate asyncio.Queue
    based on the current_campaign_id context.
    """
    cid = current_campaign_id.get()
    if cid and cid in campaign_queues:
        record = message.record

        # We try to infer if it's a thought, a tool call, or a general message based on log format
        # OpenExpertManus logs don't have strict metadata for this, so we parse the formatted message.
        text = record["message"]

        # Default event type
        event_type = "text"
        data = text

        if "✨" in text and "thoughts:" in text:
            event_type = "thought"
            # Extract the thought content after the agent name
            parts = text.split("thoughts:", 1)
            thought_text = parts[1].strip() if len(parts) > 1 else text
            data = {"message": thought_text}
        elif "🧰 Tools being prepared:" in text:
            event_type = "tool_call"
            # Extract the tool names list from the log
            try:
                tools_part = text.split("Tools being prepared:")[-1].strip()
                import ast
                tool_names = ast.literal_eval(tools_part)
            except Exception:
                tool_names = [tools_part]
            data = {"tools": tool_names}
        elif "🔧 Tool arguments:" in text:
            event_type = "tool_args"
            try:
                args_part = text.split("🔧 Tool arguments:")[-1].strip()
                data = {"args": json.loads(args_part)}
            except Exception:
                data = {"args": text}
        elif "🔧 Activating tool:" in text:
            # Skip, covered by '🧰 Tools being prepared'
            return
        elif "🎯 Tool" in text and "completed its mission!" in text:
            event_type = "tool_result"
            tool_name = text.split("Tool '")[1].split("'")[0] if "Tool '" in text else "unknown"
            # Extract the result part after "Result:"
            result_text = text.split("Result:", 1)[-1].strip() if "Result:" in text else text
            data = {"tool": tool_name, "status": "success", "result": result_text}
        elif "Observed output of cmd" in text:
            # Secondary tool result format — skip since already captured above
            return
        elif "[PROGRESS]" in text:
            event_type = "progress"
            try:
                json_str = text.split("[PROGRESS]")[-1].strip()
                data = json.loads(json_str)
            except Exception:
                data = {"message": text}

        # Put the formatted event into the queue
        try:
            queue = campaign_queues[cid]
            queue.put_nowait({"event": event_type, "data": data})
        except Exception:
            pass

# Add this sink to loguru globally
logger.add(sse_sink, level="INFO")
