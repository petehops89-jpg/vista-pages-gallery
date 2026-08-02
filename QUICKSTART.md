# 🔴🔵🟢 Agent Team with Docker MCP Hub

Your **three-agent team** (Research, Dev, Deploy) in Docker containers with a centralized MCP Gateway orchestrating GitHub, Docker Hub, and local filesystem sync.

## Quick Start

```bash
# 1. Make start script executable
chmod +x start.sh

# 2. Start the agent stack
./start.sh

# 3. Watch the MCP Gateway and agents
docker-compose logs -f
```

## What Just Happened

✓ **MCP Gateway** (docker/mcp-gateway) started on `http://localhost:8080`
✓ **🔴 Research Lead** (ResearchBot) - monitors GitHub, researches libraries
✓ **🔵 Development Lead** (DevBot) - writes code, syncs with VS Code
✓ **🟢 Deployment Lead** (DeployBot) - orchestrates containers

All three agents:
- Share `/workspace` volumes: `projects/`, `shared/`, `cache/`
- Connect to MCP Gateway for GitHub, Docker Hub, filesystem tools
- Monitor each other via `shared/` directory
- Have Docker socket access for container management

## Architecture

**3 Networks:**
- `mcp-hub` → MCP Gateway hub
- `agents-network` → Inter-agent communication
- `shared-services` → Shared volumes, file monitoring

**3 Containers (agents) + Gateway + File Monitor:**
```
docker ps | grep -E "mcp-gateway|agent-research|agent-dev|agent-deploy|file-monitor"
```

## Configuration

Each agent inherits **baseline** (`agents/[role]/config.yaml`):
- MCP Gateway URL: `http://mcp-gateway:8080`
- Tools: GitHub, Docker Hub, Filesystem (all enabled)
- Workspace: `/workspace/projects`, `/workspace/shared`, `/workspace/cache`

Then applies **role-specific** environment variables:
- **Research**: `GITHUB_TOOLS=enabled`, `DOCKER_HUB_TOOLS=enabled`
- **Dev**: + `VS_CODE_SYNC=enabled`
- **Deploy**: + `CONTAINER_MANAGEMENT=enabled`

## File Structure

```
.
├── docker-compose.yml          # Multi-container orchestration
├── .env                         # Shared environment variables
├── start.sh                     # Bootstrap script
├── ARCHITECTURE.md             # Deep dive into design
├── agents/
│   ├── research/
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── config.yaml
│   ├── dev/
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── config.yaml
│   └── deploy/
│       ├── Dockerfile
│       ├── entrypoint.sh
│       └── config.yaml
├── projects/                   # Cloned repos, watched by all agents
├── shared/                     # Inter-agent communication hub
└── cache/                      # Agent cache and state
```

## Commands

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f agent-research
docker-compose logs -f agent-dev
docker-compose logs -f agent-deploy
docker-compose logs -f mcp-gateway

# Stop
docker-compose down

# Clean (remove volumes)
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Status
docker-compose ps
docker network ls | grep agents
```

## Integration Points

### 📚 GitHub
- Agents clone repos into `projects/`
- File changes trigger agent actions
- Agents push commits back via GitHub MCP tool

### 🐳 Docker Hub
- Research agent searches for libraries/images
- Dev agent builds and tags images
- Deploy agent pulls and runs containers

### 💻 Local Filesystem / VS Code
- Edit files locally in `projects/`
- Agents detect changes via file-monitor
- Write to `shared/` for inter-agent coordination

### MCP Toolkit (Docker Desktop)
- Gateway runs `default_profile` with GitHub, Docker Hub, Filesystem MCP servers
- Add more servers: **Docker Desktop → MCP Toolkit → Catalog → Add**
- Agents auto-discover new tools on restart

## Adding a 4th Agent

Copy `agents/research/` to `agents/qa/`, update `docker-compose.yml`:

```yaml
  agent-qa:
    build: ./agents/qa
    environment:
      - AGENT_ROLE=qa-lead
      - AGENT_NAME=QABot
      - AGENT_COLOR=yellow
    networks:
      - agents
      - mcp-hub
      - shared-services
    depends_on:
      mcp-gateway:
        condition: service_healthy
```

Then: `docker-compose up -d agent-qa`

## Troubleshooting

**Agents can't connect to gateway?**
```bash
docker-compose logs mcp-gateway
docker-compose logs gateway-init
# Check: curl http://localhost:8080/health
```

**Files not syncing?**
```bash
docker-compose logs file-monitor
# Check: ls -la projects/ shared/ cache/
```

**Rebuild from scratch:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Next Steps

1. **Add MCP servers** via Docker Desktop UI → MCP Toolkit → Catalog
2. **Implement agent logic** → Replace placeholder Python loop in `agents/[role]/entrypoint.sh`
3. **Connect Claude Desktop** → Already configured in `$env:APPDATA\Claude\claude_desktop_config.json`
4. **Monitor inter-agent communication** → Watch `shared/` directory
5. **Deploy to production** → Same compose file, scale up with Docker Swarm or Kubernetes

See **ARCHITECTURE.md** for deep dive into design decisions.

---

**Status:** ✓ Containers ready | ✓ Networks configured | ✓ MCP Hub running | ✓ Agent team awaiting tasks
