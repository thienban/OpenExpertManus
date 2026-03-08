"""
Crawl4AI Web Crawler Tool for OpenManus

This tool integrates Crawl4AI, a high-performance web crawler designed for LLMs and AI agents,
providing fast, precise, and AI-ready data extraction with clean Markdown generation.
"""

import asyncio
import sys
import threading
from concurrent.futures import Future
from typing import List, Union
from urllib.parse import urlparse

from app.logger import logger
from app.tool.base import BaseTool, ToolResult


class Crawl4aiTool(BaseTool):
    """
    Web crawler tool powered by Crawl4AI.

    Provides clean markdown extraction optimized for AI processing.
    """

    name: str = "crawl4ai"
    description: str = """Web crawler that extracts clean, AI-ready content from web pages.

    Features:
    - Extracts clean markdown content optimized for LLMs
    - Handles JavaScript-heavy sites and dynamic content
    - Supports multiple URLs in a single request
    - Fast and reliable with built-in error handling

    Perfect for content analysis, research, and feeding web content to AI models."""

    parameters: dict = {
        "type": "object",
        "properties": {
            "urls": {
                "type": "array",
                "items": {"type": "string"},
                "description": "(required) List of URLs to crawl. Can be a single URL or multiple URLs.",
                "minItems": 1,
            },
            "timeout": {
                "type": "integer",
                "description": "(optional) Timeout in seconds for each URL. Default is 30.",
                "default": 30,
                "minimum": 5,
                "maximum": 120,
            },
            "bypass_cache": {
                "type": "boolean",
                "description": "(optional) Whether to bypass cache and fetch fresh content. Default is false.",
                "default": False,
            },
            "word_count_threshold": {
                "type": "integer",
                "description": "(optional) Minimum word count for content blocks. Default is 10.",
                "default": 10,
                "minimum": 1,
            },
        },
        "required": ["urls"],
    }

    async def execute(
        self,
        urls: Union[str, List[str]],
        timeout: int = 30,
        bypass_cache: bool = False,
        word_count_threshold: int = 10,
    ) -> ToolResult:
        """
        Execute web crawling for the specified URLs.

        On Windows, Crawl4AI's AsyncWebCrawler uses create_subprocess_exec internally
        which requires a ProactorEventLoop. Since uvicorn runs a SelectorEventLoop, we
        run crawl4ai in a dedicated thread with its own ProactorEventLoop to avoid
        NotImplementedError.

        Args:
            urls: Single URL string or list of URLs to crawl
            timeout: Timeout in seconds for each URL
            bypass_cache: Whether to bypass cache
            word_count_threshold: Minimum word count for content blocks

        Returns:
            ToolResult with crawl results
        """
        if isinstance(urls, str):
            url_list = [urls]
        else:
            url_list = list(urls)

        valid_urls = [u for u in url_list if self._is_valid_url(u)]
        if not valid_urls:
            return ToolResult(error="No valid URLs provided")

        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                self._run_crawl_in_thread,
                valid_urls,
                timeout,
                bypass_cache,
                word_count_threshold,
            )
            return result
        except Exception as e:
            error_msg = f"Crawl4AI execution failed: {str(e)}"
            logger.error(error_msg)
            return ToolResult(error=error_msg)

    def _run_crawl_in_thread(
        self,
        valid_urls: List[str],
        timeout: int,
        bypass_cache: bool,
        word_count_threshold: int,
    ) -> ToolResult:
        """
        Run the crawl4ai crawler in a brand-new event loop inside a thread.
        This guarantees a ProactorEventLoop on Windows, avoiding NotImplementedError
        from asyncio.create_subprocess_exec used internally by Playwright/crawl4ai.
        """
        loop = asyncio.new_event_loop()
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
            loop = asyncio.ProactorEventLoop()
        try:
            return loop.run_until_complete(
                self._crawl(valid_urls, timeout, bypass_cache, word_count_threshold)
            )
        finally:
            loop.close()

    async def _crawl(
        self,
        valid_urls: List[str],
        timeout: int,
        bypass_cache: bool,
        word_count_threshold: int,
    ) -> ToolResult:
        """Core crawl logic executed inside a dedicated event loop."""
        try:
            from crawl4ai import (
                AsyncWebCrawler,
                BrowserConfig,
                CacheMode,
                CrawlerRunConfig,
            )
        except ImportError:
            return ToolResult(
                error="Crawl4AI is not installed. Run: pip install crawl4ai"
            )

        browser_config = BrowserConfig(
            headless=True,
            verbose=False,
            browser_type="chromium",
            ignore_https_errors=True,
            java_script_enabled=True,
        )

        run_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS if bypass_cache else CacheMode.ENABLED,
            word_count_threshold=word_count_threshold,
            process_iframes=True,
            remove_overlay_elements=True,
            excluded_tags=["script", "style"],
            page_timeout=timeout * 1000,
            verbose=False,
            wait_until="domcontentloaded",
        )

        results = []
        successful_count = 0
        failed_count = 0

        async with AsyncWebCrawler(config=browser_config) as crawler:
            for url in valid_urls:
                try:
                    logger.info(f"🕷️ Crawling URL: {url}")
                    start_time = asyncio.get_event_loop().time()

                    result = await crawler.arun(url=url, config=run_config)

                    elapsed = asyncio.get_event_loop().time() - start_time

                    if result.success:
                        word_count = len(result.markdown.split()) if getattr(result, "markdown", None) else 0
                        links = result.links or {}
                        links_count = len(links.get("internal", [])) + len(links.get("external", []))
                        images_count = len((result.media or {}).get("images", []))

                        results.append({
                            "url": url,
                            "success": True,
                            "status_code": getattr(result, "status_code", 200),
                            "title": result.metadata.get("title") if result.metadata else None,
                            "markdown": getattr(result, "markdown", None),
                            "word_count": word_count,
                            "links_count": links_count,
                            "images_count": images_count,
                            "execution_time": elapsed,
                        })
                        successful_count += 1
                        logger.info(f"✅ Successfully crawled {url} in {elapsed:.2f}s")
                    else:
                        results.append({
                            "url": url,
                            "success": False,
                            "error_message": getattr(result, "error_message", "Unknown error"),
                        })
                        failed_count += 1
                        logger.warning(f"❌ Failed to crawl {url}")

                except Exception as exc:
                    error_msg = f"Error crawling {url}: {exc}"
                    logger.error(error_msg)
                    results.append({"url": url, "success": False, "error_message": error_msg})
                    failed_count += 1

        output_lines = [
            f"🕷️ Crawl4AI Results: {successful_count}/{len(valid_urls)} successful",
            "",
        ]
        for i, r in enumerate(results, 1):
            output_lines.append(f"{i}. {r['url']}")
            if r["success"]:
                if r.get("title"):
                    output_lines.append(f"   📄 {r['title']}")
                if r.get("markdown"):
                    preview = r["markdown"][:400]
                    if len(r["markdown"]) > 400:
                        preview += "..."
                    output_lines.append(f"   📝 {preview}")
                output_lines.append(
                    f"   📊 {r.get('word_count', 0)} words | {r.get('links_count', 0)} links | ⏱️ {r.get('execution_time', 0):.2f}s"
                )
            else:
                output_lines.append(f"   ❌ {r.get('error_message', 'Failed')}")
            output_lines.append("")

        return ToolResult(output="\n".join(output_lines))

    def _is_valid_url(self, url: str) -> bool:
        """Validate if a URL is properly formatted."""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc]) and result.scheme in [
                "http",
                "https",
            ]
        except Exception:
            return False
