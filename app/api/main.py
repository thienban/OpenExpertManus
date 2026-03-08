import asyncio
import sys

# CRITICAL: Must be set at module level, before FastAPI / uvicorn creates the event loop.
# uvicorn reload=True spawns child processes via multiprocessing.spawn — the child re-imports
# this module, so the policy is applied fresh in every worker before the loop is created.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import campaign, reports

app = FastAPI(
    title="OpenExpertManus API",
    description="API for OpenExpertManus Agents",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For simplicity in local development with Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaign.router)
app.include_router(reports.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
