# Docker Agent Team Architecture Summary

## What You Now Have

Your containerized agent team is **fully architected and ready to deploy**:

### ✅ Established Artifacts

| Component | File | Purpose |
|-----------|------|---------|
| **Docker Compose** | `docker-compose.yml` | Orchestrates MCP Gateway + 3 agents + file monitor across 3 networks |
| **MCP Gateway Service** | `mcp-hub` container | Centralized proxy for GitHub, Docker Hub, Filesystem MCP tools |
| **Agent Containers** | `agent-research`, `agent-dev`, `agent-deploy` | Three roles with baseline config + role-specific env vars |
| **Base Dockerfile** | `agents/[role]/Dockerfile` | Python 3.11 + MCP client + Docker access |
| **Entrypoint Scripts** | `agents/[role]/entrypoint.sh` | Gateway health check → Config merge → Agent loop start |
| **Config Files** | `agents/[role]/config.yaml` | YAML templates with env var substitution (agent name, MCP tools, workspace paths) |
| **Environment** | `.env` | Shared vars: MCP_GATEWAY_URL, MCP_HUB_NETWORK, etc. |
| **Bootstrap** | `start.sh` | Creates workspace dirs, builds images, validates setup |

---

## Architecture Layers

### Layer 1: MCP Hub (Center)
```
MCP Gateway (docker/mcp-gateway)
  ├─ GitHub MCP Server (search repos, list issues, push/pull)
  ├─ Docker Hub MCP Server (search images, pull manifests)
  └─ Filesystem MCP Server (read/write workspace files)
```
- **Transport**: Streaming (HTTP long-poll, supports multiple clients)
- **Network**: `mcp-hub`
- **Health Check**: `curl http://mcp-gateway:8080/health`

### Layer 2: Agent Roles (Spokes)
```
🔴 Research Lead (Red Globe)       🔵 Dev Lead (Blue Globe)        🟢 Deploy Lead (Green Globe)
├─ AGENT_NAME=ResearchBot         ├─ AGENT_NAME=DevBot           ├─ AGENT_NAME=DeployBot
├─ AGENT_ROLE=research-lead       ├─ AGENT_ROLE=dev-lead         ├─ AGENT_ROLE=deploy-lead
├─ GITHUB_TOOLS=enabled           ├─ VS_CODE_SYNC=enabled        ├─ CONTAINER_MGMT=enabled
├─ DOCKER_HUB_TOOLS=enabled       ├─ GITHUB_TOOLS=enabled        ├─ GITHUB_TOOLS=enabled
└─ FILESYSTEM_TOOLS=enabled       └─ DOCKER_HUB_TOOLS=enabled    └─ DOCKER_HUB_TOOLS=enabled
```
- Each runs in its own container
- All inherit baseline config + merge role-specific overrides
- Connected to all 3 networks: `mcp-hub`, `agents-network`, `shared-services`

### Layer 3: Shared Services (Foundation)
```
File Monitor (alpine)           Volumes                       Networks
├─ Watches /workspace           ├─ /workspace/projects ↔ ./  ├─ mcp-hub (gateway)
├─ Triggers on file change      ├─ /workspace/shared ↔ ./   ├─ agents-network
└─ Communicates via stdin/stdout└─ /workspace/cache ↔ ./    └─ shared-services
```
- Agents detect filesystem changes in real-time
- Inter-agent communication via JSON/YAML in `shared/`
- Docker socket mounted for container management: `/var/run/docker.sock:/var/run/docker.sock`

---

## In/Out Protocol

### Inbound (to agents)
| Source | Trigger | Path |
|--------|---------|------|
| **Local Filesystem** | File added/modified in `projects/` | File-monitor detects → Agent reacts |
| **GitHub Webhooks** (optional) | Webhook POST | Research/Dev agent receives via MCP |
| **Claude Desktop** | MCP request via gateway | Claude → `mcp-gateway:8080` → Agent access MCP tools |
| **Docker Host** | Container lifecycle | Agents execute docker commands via socket |

### Outbound (from agents)
| Destination | Action | Tool |
|-------------|--------|------|
| **GitHub** | Push commit, open PR, comment | GitHub MCP server |
| **Docker Hub** | Push image, pull manifest | Docker Hub MCP server |
| **Local Workspace** | Write results to `shared/` or `projects/` | Filesystem MCP server |
| **Other Agents** | Leave JSON task in `shared/` | File-monitor triggers reader |

---

## Baseline Config (Inheritance)

All agents load `config.yaml` with templated env vars:

```yaml
agent:
  name: ${AGENT_NAME}              # ResearchBot, DevBot, DeployBot
  role: ${AGENT_ROLE}              # research-lead, dev-lead, deploy-lead
  color: ${AGENT_COLOR}            # red, blue, green
  log_level: ${LOG_LEVEL:-info}    # info, debug

mcp:
  gateway:
    url: ${MCP_GATEWAY_URL}        # http://mcp-gateway:8080
    transport: ${MCP_GATEWAY_TRANSPORT:-streaming}

workspace:
  projects: /workspace/projects    # Clone repos here
  shared: /workspace/shared        # Inter-agent communication
  cache: /workspace/cache          # Agent state and results
```

### Role-Specific Overrides (Environment Variables)
| Agent | Override Variables |
|-------|-------------------|
| Research | `GITHUB_TOOLS=enabled`, `DOCKER_HUB_TOOLS=enabled` |
| Dev | `VS_CODE_SYNC=enabled`, `GITHUB_TOOLS=enabled` |
| Deploy | `CONTAINER_MANAGEMENT=enabled`, `GITHUB_TOOLS=enabled` |

**Entrypoint Flow:**
1. Copy `config.baseline.yaml` → `config.yaml`
2. Append role-specific instructions (research findings doc, dev code workflow, deploy checklist)
3. Substitute `${ENV_VAR}` placeholders
4. Pass to agent loop (currently Python placeholder; replace with your agent implementation)

---

## Local Network Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Docker Compose Network Stack                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ mcp-hub (bridge)                               │    │
│  │  - mcp-gateway (port 8080 exposed to host)    │    │
│  └────────────────────────────────────────────────┘    │
│           ↑              ↑              ↑               │
│           │              │              │               │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │ agent-     │  │  agent-dev  │  │ agent-       │    │
│  │research    │  │             │  │ deploy       │    │
│  └────────────┘  └─────────────┘  └──────────────┘    │
│         │              │                │                │
│         └──────────────┴────────────────┘               │
│                        │                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ agents-network (bridge)                        │    │
│  │  - Enables inter-agent communication via names │    │
│  └────────────────────────────────────────────────┘    │
│                        │                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ shared-services (bridge)                       │    │
│  │  - file-monitor (watches /workspace)           │    │
│  │  - Mounts: volumes for projects, shared, cache │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
                          ↓
                 ┌────────────────────────┐
                 │   Host Volumes         │
                 ├────────────────────────┤
                 │ ./projects → sync code │
                 │ ./shared → sync state  │
                 │ ./cache → agent data   │
                 └────────────────────────┘
```

---

## Files & Directories Created

```
.
├── docker-compose.yml              # 174 lines - services, networks, volumes
├── .env                            # Environment variables (shared)
├── start.sh                        # Bootstrap script
├── ARCHITECTURE.md                 # Deep dive documentation
├── QUICKSTART.md                   # Getting started guide
├── .dockerignore                   # Docker build exclusions
│
├── agents/                         # Three agent roles
│   ├── research/
│   │   ├── Dockerfile              # Python 3.11 + MCP client
│   │   ├── entrypoint.sh           # Startup & config merge logic
│   │   └── config.yaml             # Baseline config with env var templates
│   ├── dev/
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── config.yaml
│   └── deploy/
│       ├── Dockerfile
│       ├── entrypoint.sh
│       └── config.yaml
│
├── projects/                       # (created by start.sh) - workspace
│   ├── frontend/
│   ├── backend/
│   ├── infra/
│   └── README.md
├── shared/                         # (created by start.sh) - inter-agent comm
│   ├── research/
│   ├── dev/
│   ├── deployments/
│   └── README.md
└── cache/                          # (created by start.sh) - agent state
```

---

## Startup Sequence

```
1. start.sh
   ├─ mkdir projects/ shared/ cache/
   ├─ Create README files
   ├─ docker-compose build
   └─ docker-compose up -d

2. gateway-init (health check job)
   └─ Validates docker is running

3. mcp-gateway (depends on gateway-init)
   ├─ Load default_profile (GitHub, Docker Hub, Filesystem)
   ├─ Expose http://localhost:8080
   └─ Wait for agents to connect (health check)

4. file-monitor (independent, no dependency)
   └─ Watch /workspace volumes

5. agent-research (depends on mcp-gateway healthy)
   ├─ Wait for http://mcp-gateway:8080/health
   ├─ Load config.yaml
   ├─ Merge env vars + role instructions
   └─ Enter monitoring loop

6. agent-dev (same pattern)
7. agent-deploy (same pattern)
```

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| **3 Networks** (mcp-hub, agents, shared) | Separation of concerns: hub orchestration, agent communication, shared services |
| **Streaming Transport** | Supports multiple clients (Claude Desktop + agents) simultaneously |
| **Docker Socket Mount** | Agents can manage containers without nested Docker |
| **Health Checks** | Agents wait for gateway readiness before assuming tools |
| **Config Merge** (baseline + role-specific) | Reduces duplication, scalable to 10+ agents |
| **Shared Volumes** | Real-time sync with local filesystem, editable in VS Code |
| **File Monitor** | Triggers agent actions on filesystem events |

---

## Next Steps to Production

1. **Implement agent logic**: Replace Python placeholder in `entrypoint.sh` with actual agent code (LLM calls, tool invocation)
2. **Add secrets management**: Store GitHub PAT, Docker Hub token in Docker secrets
3. **Enable persistence**: Add volume for agent state databases
4. **Scale horizontally**: `docker-compose scale agent-research=3` for multiple research instances
5. **Add observability**: Mount prometheus/grafana for metrics
6. **Connect CI/CD**: Trigger agent tasks from GitHub Actions
7. **Deploy to Swarm/K8s**: Use Docker Compose as template

---

## Running It

```bash
chmod +x start.sh
./start.sh

# Then:
docker-compose logs -f agent-research  # Watch Research Lead
docker-compose logs -f agent-dev       # Watch Dev Lead
docker-compose logs -f agent-deploy    # Watch Deploy Lead
docker-compose logs -f mcp-gateway     # Watch MCP Hub
```

**Result**: Three containerized agents, all connected to MCP Hub, synced with your local filesystem and GitHub/Docker Hub. 🟢 Ready to scale.
