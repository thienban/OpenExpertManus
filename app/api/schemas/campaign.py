from pydantic import BaseModel, Field
from typing import Optional, List

class CampaignCreateRequest(BaseModel):
    selected_agent: str = Field(..., description="The agent to use (e.g. 'marketing', 'manus')")
    prompt: str = Field(..., description="The user prompt")
    tools_override: Optional[List[str]] = Field(default=None, description="Optional tools to force")

class CampaignResponse(BaseModel):
    campaign_id: str
    status: str
    stream_url: str
