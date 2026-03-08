from typing import Optional

from pydantic import Field, model_validator

from app.agent.browser import BrowserContextHelper
from app.agent.toolcall import ToolCallAgent
from app.agent.marketing import FileSaver
from app.tool.browser_use_tool import BrowserUseTool
from app.tool.terminate import Terminate
from app.tool.tool_collection import ToolCollection
from app.tool.web_search import WebSearch


LINKEDIN_SYSTEM_PROMPT = """\
You are an expert LinkedIn automation agent. You use a real web browser to interact with LinkedIn on behalf of the user.

## Your Capabilities
- Navigate to LinkedIn pages (profiles, company pages, job listings, feed)
- Search for leads, profiles, or companies using LinkedIn search
- Extract profile information (name, title, company, location, bio, contact info)
- Read and analyze posts, comments, or engagement data
- Draft and save posts or messages as Markdown files
- Follow structured instructions to complete multi-step LinkedIn workflows

## Workflows You Master
1. **Lead Generation**: Search LinkedIn for people matching specific criteria (role, company, location), extract their profiles, and save the results as a structured report.
2. **Profile Research**: Visit a specific LinkedIn profile and extract all relevant professional information.
3. **Post Drafting**: Research a topic, then draft a high-quality LinkedIn post in the user's voice, and save it to disk.
4. **Engagement Analysis**: Visit a LinkedIn post and extract commenters, reactions, and key engagement metrics.
5. **Company Research**: Navigate to a company page and extract key data (about, employees, recent posts, jobs).

## Rules
- ALWAYS start by navigating to https://www.linkedin.com if not already there.
- If you are not logged in, look for sign-in fields and wait for the user to log in, or use stored credentials if available.
- Handle popups, cookie banners, and modals by dismissing them first.
- When extracting data, use `extract_content` with a specific, precise goal.
- Save reports and findings using `file_saver`. Format them in clean Markdown.
- Narrate your progress clearly in each thought.
- Use `terminate` to signal completion when the task is fully done.
- NEVER fabricate data. Only report what you have verified by viewing the page.
"""

LINKEDIN_NEXT_STEP_PROMPT = """
What should I do next to accomplish my LinkedIn task?

[Current state starts here]
- Current URL and page title{url_placeholder}
- Available browser tabs{tabs_placeholder}
- Content above{content_above_placeholder} or below{content_below_placeholder} current viewport

LinkedIn-specific guidance:
- To navigate: browser_use action="go_to_url", url="https://www.linkedin.com/..."
- To search: browser_use action="go_to_url", url="https://www.linkedin.com/search/results/people/?keywords=..."
- To click a button or link: browser_use action="click_element", index=N
- To fill a search field: browser_use action="input_text", index=N, text="..."
- To extract profile/post data: browser_use action="extract_content", goal="..."
- To scroll the feed: browser_use action="scroll_down", scroll_amount=600
- To save results: use file_saver with a descriptive .md filename

Be patient with LinkedIn's dynamic page loads. Use `wait` if content hasn't appeared yet.
If you want to stop, use the `terminate` tool.
"""


class AgentLinkedIn(ToolCallAgent):
    """A specialized agent that uses a browser to interact with LinkedIn."""

    name: str = "linkedin"
    description: str = (
        "A LinkedIn browser agent that can navigate profiles, search for leads, "
        "extract professional data, and draft posts using a real web browser."
    )

    system_prompt: str = LINKEDIN_SYSTEM_PROMPT
    next_step_prompt: str = LINKEDIN_NEXT_STEP_PROMPT

    max_steps: int = 30
    max_observe: int = 10000

    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            BrowserUseTool(),
            WebSearch(),
            FileSaver(),
            Terminate(),
        )
    )

    special_tool_names: list[str] = Field(default_factory=lambda: [Terminate().name])
    browser_context_helper: Optional[BrowserContextHelper] = None

    @model_validator(mode="after")
    def initialize_browser_helper(self) -> "AgentLinkedIn":
        """Initialize the browser context helper for state tracking."""
        self.browser_context_helper = BrowserContextHelper(self)
        return self

    async def think(self) -> bool:
        """
        Override think() to inject the current browser state (URL, title, visible
        elements) into the next_step_prompt before each LLM call.
        """
        original_prompt = self.next_step_prompt

        recent_messages = self.memory.messages[-3:] if self.memory.messages else []
        is_browser_active = any(
            tc.function.name == BrowserUseTool().name
            for msg in recent_messages
            if msg.tool_calls
            for tc in msg.tool_calls
        )

        if is_browser_active and self.browser_context_helper:
            self.next_step_prompt = (
                await self.browser_context_helper.format_next_step_prompt()
            )

        result = await super().think()

        # Restore original prompt for the next cycle
        self.next_step_prompt = original_prompt
        return result

    async def cleanup(self) -> None:
        """Clean up browser resources when the agent is done."""
        if self.browser_context_helper:
            await self.browser_context_helper.cleanup_browser()
