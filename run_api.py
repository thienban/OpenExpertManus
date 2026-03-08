import asyncio
import sys
import uvicorn

from app.logger import logger

def main():
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    logger.info("Starting OpenExpertManus API Server on port 8000...")
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        loop="asyncio",
    )

if __name__ == "__main__":
    main()
