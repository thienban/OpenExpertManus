import os
from pathlib import Path
from typing import ClassVar, Optional

from pydantic import Field

from app.agent.toolcall import ToolCallAgent
from app.tool.base import BaseTool, ToolResult
from app.tool.file_operators import LocalFileOperator
from app.tool.web_search import WebSearch
from app.tool.crawl4ai import Crawl4aiTool
from app.tool.terminate import Terminate
from app.tool.tool_collection import ToolCollection
from app.api.logger_hook import current_campaign_id

class FileSaver(BaseTool):
    name: str = "file_saver"
    description: str = "Saves content to a local file (e.g., Markdown reports). It will organize files into campaign-specific folders."
    parameters: dict = {
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "The file name or relative path (e.g. report.md)"},
            "content": {"type": "string", "description": "The content to save"}
        },
        "required": ["path", "content"]
    }

    async def execute(self, path: str, content: str, **kwargs) -> ToolResult:
        try:
            cid = current_campaign_id.get()

            # Base report directory
            base_dir = Path("workspace")

            # If we have a campaign ID, organize by folder
            if cid:
                save_dir = base_dir / cid
            else:
                save_dir = base_dir

            # Create directory if it doesn't exist
            save_dir.mkdir(parents=True, exist_ok=True)

            # Target path
            full_path = save_dir / os.path.basename(path)

            operator = LocalFileOperator()
            await operator.write_file(full_path, content)
            return ToolResult(output=f"Successfully saved to {full_path}")
        except Exception as e:
            return ToolResult(error=str(e))


class AgentMarketing(ToolCallAgent):
    name: str = "marketing"
    description: str = "An expert digital marketing agent capable of SEO research, competitor data collection, and saving reports."

    system_prompt: str = (
        "You are an expert digital marketing agent. Your tasks include SEO analysis, extracting 'People Also Ask' (PAA), "
        "analyzing competitor SERP results, and saving reports.\n"
        "1. Receive a keyword or objective from the user.\n"
        "2. Query search engines (using web_search or crawl4ai) to extract intent and competitors.\n"
        "3. Format the response neatly in Markdown.\n"
        "4. Use file_saver to save the report to the local disk in the specified folder.\n"
        "ALWAYS use Terminate() to indicate completion when your task is done."
    )

    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            WebSearch(),
            Crawl4aiTool(),
            FileSaver(),
            Terminate()
        )
    )
