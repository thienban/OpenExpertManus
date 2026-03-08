import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime
from app.api.schemas.report import ReportsResponse, ReportItem
import urllib.parse

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

# The directory where reports are saved by the active agents.
REPORTS_DIR = Path() / "workspace" # Assume saved in workspace for now, or adapt as needed.

@router.get("", response_model=ReportsResponse)
async def list_reports():
    """Lists markdown files commonly created as reports."""
    reports = []

    if not REPORTS_DIR.exists():
        return ReportsResponse(reports=[])

    for file_path in REPORTS_DIR.rglob("*.md"):
        stat = file_path.stat()
        reports.append(ReportItem(
            id=urllib.parse.quote(file_path.name),
            filename=file_path.name,
            created_at=datetime.fromtimestamp(stat.st_mtime).isoformat()
        ))

    # Sort files by newest first
    reports.sort(key=lambda x: x.created_at, reverse=True)

    return ReportsResponse(reports=reports)

@router.get("/{file_id}")
async def get_report(file_id: str):
    """Returns the pure markdown document based on file_id."""
    decoded_file_id = urllib.parse.unquote(file_id)

    if not REPORTS_DIR.exists():
        raise HTTPException(status_code=404, detail="Workspace directory not found")

    target_file = None
    for file_path in REPORTS_DIR.rglob("*.md"):
        if file_path.name == decoded_file_id:
            target_file = file_path
            break

    if not target_file or not target_file.exists():
        raise HTTPException(status_code=404, detail="Report not found")

    return FileResponse(target_file, media_type="text/markdown", filename=decoded_file_id)
