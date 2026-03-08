from pydantic import BaseModel
from typing import List

class ReportItem(BaseModel):
    id: str
    filename: str
    created_at: str

class ReportsResponse(BaseModel):
    reports: List[ReportItem]
