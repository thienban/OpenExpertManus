<p align="center">
  <img src="assets/logo.jpg" width="200"/>
</p>

## 🎯 OpenExpertManus — Specialized Agent Platform

This fork extends OpenManus with a **full-stack platform** for building domain-specific expert agents, each focused on a vertical use case.

### Architecture

```
OpenExpertManus
├── app/
│   ├── agent/          # Specialized agents
│   │   ├── marketing.py      # MarketingAgent — SERP, PAA, keyword research
│   │   ├── linkedin.py       # LinkedInAgent  — lead generation via browser
│   │   └── toolcall.py       # Base ToolCall agent
│   ├── tool/           # Shared tools (browser_use, web_search, crawl4ai…)
│   ├── flow/           # Multi-agent orchestration (PlanningFlow)
│   └── api/            # FastAPI backend (SSE streaming)
├── frontend/           # Next.js 15 dashboard (App Router, TypeScript)
│   ├── src/app/        # Pages (campaigns, reports…)
│   ├── src/components/ # UI components (AgentFeed, chat-ui…)
│   └── src/hooks/      # useCampaignStream — live SSE feed
├── config/config.toml  # LLM, browser, LinkedIn credentials
└── run_api.py          # FastAPI dev server
```

### Specialized Agents

| Agent | File | Capabilities |
|---|---|---|
| **MarketingAgent** | `app/agent/marketing.py` | SERP audit, PAA analysis, keyword research |
| **LinkedInAgent** | `app/agent/linkedin.py` | Lead generation, profile scraping via `browser_use` |
| **Manus** | `app/agent/manus.py` | General-purpose tool-calling agent |

Agents are orchestrated via `PlanningFlow` (see `app/flow/planning.py`) and exposed through a REST + SSE API.

## Project Demo

## Installation

We provide two installation methods. Method 2 (using uv) is recommended for faster installation and better dependency management.

### Method 1: Using conda

1. Create a new conda environment:

```bash
conda create -n open_manus python=3.12
conda activate open_manus
```

2. Clone the repository:

```bash
git clone https://github.com/FoundationAgents/OpenManus.git
cd OpenManus
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

### Method 2: Using uv (Recommended)

1. Install uv (A fast Python package installer and resolver):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Clone the repository:

```bash
git clone https://github.com/FoundationAgents/OpenManus.git
cd OpenManus
```

3. Create a new virtual environment and activate it:

```bash
uv venv --python 3.12
source .venv/bin/activate  # On Unix/macOS
# Or on Windows (Command Prompt/PowerShell):
.venv\Scripts\activate
# Or on Windows (Git Bash):
source .venv/Scripts/activate
```

4. Install dependencies:

```bash
uv pip install -r requirements.txt
```

### Browser Automation Tool (Optional)
```bash
playwright install
```

## Configuration

OpenManus requires configuration for the LLM APIs it uses. Follow these steps to set up your configuration:

1. Create a `config.toml` file in the `config` directory (you can copy from the example):

```bash
cp config/config.example.toml config/config.toml
```

2. Edit `config/config.toml` to add your API keys and customize settings:

```toml
# Global LLM configuration
[llm]
model = "gpt-4o"
base_url = "https://api.openai.com/v1"
api_key = "sk-..."  # Replace with your actual API key
max_tokens = 4096
temperature = 0.0

# Optional configuration for specific LLM models
[llm.vision]
model = "gpt-4o"
base_url = "https://api.openai.com/v1"
api_key = "sk-..."  # Replace with your actual API key
```

## Quick Start

One line for run OpenManus:

```bash
python main.py
```

Then input your idea via terminal!

For MCP tool version, you can run:
```bash
python run_mcp.py
```

For unstable multi-agent version, you also can run:

```bash
python run_flow.py
```

### Run the FastAPI Backend

To start the API server for the front-end (Marketing Agent, etc.):

```bash
python run_api.py
```

The API runs on `http://localhost:8000`. Endpoints:
- `POST /campaigns/run` — start a campaign (streams progress via SSE)
- `GET /campaigns/{id}/stream` — live SSE feed for the frontend
- `GET /health` — health check

### Run the Frontend Dashboard

The frontend is a **Next.js 15** app (App Router, TypeScript, Tailwind CSS, shadcn/ui).

```bash
cd frontend
bun install        # or: npm install
bun run dev        # starts on http://localhost:3000
```

> Requires **Bun** or **Node.js ≥ 18**. The frontend connects to the API at `http://localhost:8000` by default.

**Key pages:**
- `/` — Campaign dashboard
- `/campaigns/[id]` — Live agent feed (thoughts, tool calls, progress)
- `/reports` — Generated markdown reports

### LinkedIn Credentials (for LinkedInAgent)

Add your LinkedIn credentials to `config/config.toml` to enable automated lead generation:

```toml
[linkedin]
email = "your@email.com"
password = "yourpassword"
```

The agent will call `browser_use` with action `linkedin_login` before scraping.

### Custom Adding Multiple Agents

Currently, besides the general OpenManus Agent, we have also integrated the DataAnalysis Agent, which is suitable for data analysis and data visualization tasks. You can add this agent to `run_flow` in `config.toml`.

```toml
# Optional configuration for run-flow
[runflow]
use_data_analysis_agent = true     # Disabled by default, change to true to activate
```
In addition, you need to install the relevant dependencies to ensure the agent runs properly: [Detailed Installation Guide](app/tool/chart_visualization/README.md##Installation)


## Cite
```bibtex
@misc{openmanus2025,
  author = {Xinbin Liang and Jinyu Xiang and Zhaoyang Yu and Jiayi Zhang and Sirui Hong and Sheng Fan and Xiao Tang and Bang Liu and Yuyu Luo and Chenglin Wu},
  title = {OpenManus: An open-source framework for building general AI agents},
  year = {2025},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.15186407},
  url = {https://doi.org/10.5281/zenodo.15186407},
}
```
