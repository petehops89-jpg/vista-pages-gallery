# Agent Team Architecture

## Overview
Your Docker Compose setup creates **three colored globes** (agent teams) coordinating through a centralized MCP Hub.

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Desktop                            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MCP Toolkit (default_profile)                       │   │
│  │  - GitHub MCP Server                                 │   │
│  │  - Docker Hub MCP Server                             │   │
│  │  - Filesystem MCP Server                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↑                                    │
│                          │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MCP Gateway (docker/mcp-gateway)                    │   │
│  │  Port: 8080 (Streaming Transport)                    │   │
│  │  Network: mcp-hub                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                    ↗       ↑        ↖                         │
│                   /        │         \                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   🔴 RED   │  │   🔵 BLUE  │  │  🟢 GREEN  │             │
│  │  Research  │  │    Dev     │  │  Deploy    │             │
│  │   Lead     │  │    Lead    │  │    Lead    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│   agents-net     agents-net       agents-net                 │
│       │                │                │                     │
│       └────────────────┴────────────────┘                     │
│                       │                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Shared Services Network                             │   │
│  │  - File Monitor (watches /workspace)                 │   │
│  │  - Volumes: projects/, shared/, cache/               │   │
│  │  - Mounts: local filesystem, Docker socket           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↑                                          ↑
         │                                          │
    GitHub Repos                        Docker Hub / VS Code
```

## Networks

| Network | Purpose | Members |
|---------|---------|---------|
| `mcp-hub` | MCP Gateway hub for tool orchestration | mcp-gateway |
| `agents-network` | Inter-agent communication | agent-research, agent-dev, agent-deploy |
| `shared-services` | Shared volumes and file monitoring | file-monitor, all agents |

## Volumes & Filesystem Sync

All agents mount the same volumes:
- **`/workspace/projects`** → `./projects` (local)
- **`/workspace/shared`** → `./shared` (local)
- **`/workspace/cache`** → `./cache` (local)

This enables:
1. **GitHub Integration**: Clone repos into `projects/`, agents detect changes
2. **VS Code Sync**: Edit files locally, agents see real-time updates
3. **Inter-Agent Communication**: Write JSON/YAML to `shared/`, other agents read and respond
4. **File Monitoring**: The `file-monitor` container watches for changes and triggers agent actions

## Agent Roles

### 🔴 Research Lead (Red Globe)
- **Role**: Analysis, research, strategic insights
- **MCP Tools**: GitHub (search projects), Docker Hub (library research), Filesystem
- **Output**: Research findings in `/workspace/shared/research/`
- **Example**: Analyze trending GitHub projects, document library recommendations

### 🔵 Development Lead (Blue Globe)
- **Role**: Code development, testing, VS Code integration
- **MCP Tools**: GitHub (push/pull), Docker Hub (build images), Filesystem, VS Code sync
- **Output**: Code in `/workspace/projects/`, test results, build logs
- **Example**: Write backend API, run tests, push to GitHub

### 🟢 Deployment Lead (Green Globe)
- **Role**: Container orchestration, infrastructure, monitoring
- **MCP Tools**: GitHub (pull deployment specs), Docker Hub (pull images), Filesystem, Container Management
- **Output**: Deployment configs in `/workspace/shared/deployments/`, container logs
- **Example**: Deploy multi-container apps, monitor health, rollback if needed

## Configuration Baseline

All agents inherit:
```yaml
# agents/[role]/config.yaml
agent:
  mcp:
    gateway:
      url: http://mcp-gateway:8080
      transport: streaming
  tools:
    github: enabled
    docker_hub: enabled
    filesystem: enabled
```

Then override via **environment variables** per role:
```bash
# agent-dev gets VS Code sync enabled
VS_CODE_SYNC=enabled

# agent-deploy gets container management
CONTAINER_MANAGEMENT=enabled
```

## Startup Flow

1. **Gateway Init** (health check) → Validates MCP profile
2. **MCP Gateway** (port 8080) → Starts and loads 314 MCP servers
3. **File Monitor** → Watches workspace for changes
4. **Agents** → Start in parallel, wait for gateway health check
   - Each calls `http://mcp-gateway:8080/health`
   - Loads config.yaml with role-specific instructions
   - Enters monitoring loop

## In/Out Protocol

### Inbound (to agents)
- **Local filesystem changes** → Detected by file-monitor → Agents react
- **GitHub webhooks** (optional) → Trigger research/dev agent updates
- **Claude Desktop MCP requests** → Routed through mcp-gateway

### Outbound (from agents)
- **Git push/pull** → Via GitHub MCP tool
- **Docker image push/pull** → Via Docker Hub MCP tool
- **File writes** → To `/workspace/shared/` for inter-agent communication
- **Container lifecycle** → Managed via Docker socket (`/var/run/docker.sock`)

## Running the Stack

```bash
# Make start script executable
chmod +x start.sh

# Start everything
./start.sh

# Or manually:
docker-compose up -d

# Monitor
docker-compose logs -f agent-research
docker-compose logs -f agent-dev
docker-compose logs -f agent-deploy

# Inspect network
docker network inspect agents-network

# Stop
docker-compose down
```

## Adding More Agents

To add a 4th agent (e.g., "yellow" for QA):

1. Create `agents/qa/` directory (copy from `agents/research/`)
2. Update `docker-compose.yml` with new service:
```yaml
  agent-qa:
    build: ./agents/qa
    container_name: agent-qa-lead
    environment:
      - AGENT_ROLE=qa-lead
      - AGENT_NAME=QABot
      - AGENT_COLOR=yellow
      - QA_TOOLS=enabled  # Role-specific
    networks:
      - agents
      - mcp-hub
      - shared-services
```
3. Run: `docker-compose up -d agent-qa`

## Extending MCP Tools

To enable more MCP servers in `default_profile`:

1. **Docker Desktop → MCP Toolkit → Catalog**
2. Search for server (e.g., "Stripe", "Gmail")
3. Click **Add to default_profile**
4. Configure secrets/API keys
5. Agents automatically see new tools on next restart

---

**Your setup is now: Docker Hub (source) ↔ MCP Hub (orchestrator) ↔ GitHub (versioning) ↔ Local FS (sync) ↔ Agent Teams (execution)**
