# Agent Team Quick Reference

## 🎬 Quick Commands

```bash
# Start everything
./start.sh

# View logs
docker-compose logs -f                    # All services
docker-compose logs -f agent-research     # Research agent only
docker-compose logs -f agent-dev          # Dev agent only
docker-compose logs -f agent-deploy       # Deploy agent only
docker-compose logs -f mcp-gateway        # MCP Hub only

# Stop
docker-compose down

# Restart specific agent
docker-compose restart agent-research

# Execute command in agent
docker exec agent-research-lead curl http://mcp-gateway:8080/health
docker exec agent-dev-lead pwd

# Monitor workspace changes
docker exec file-monitor ls -la /workspace/shared
```

## 🌐 Network & Port Mapping

| Service | Container | Network | Port | External |
|---------|-----------|---------|------|----------|
| mcp-gateway | mcp-gateway-hub | mcp-hub | 8080 | ✓ localhost:8080 |
| agent-research | agent-research-lead | agents-network, mcp-hub, shared | - | ✗ |
| agent-dev | agent-dev-lead | agents-network, mcp-hub, shared | - | ✗ |
| agent-deploy | agent-deploy-lead | agents-network, mcp-hub, shared | - | ✗ |
| file-monitor | file-monitor | shared-services | - | ✗ |

## 📁 Volume Mounts

| Host Path | Container Path | Purpose | Permissions |
|-----------|-----------------|---------|-------------|
| `./projects` | `/workspace/projects` | Git repos, code | rw |
| `./shared` | `/workspace/shared` | Inter-agent communication | rw |
| `./cache` | `/workspace/cache` | Agent state, results | rw |
| `/var/run/docker.sock` | `/var/run/docker.sock` | Container management | rw |

## 🤖 Agent Roles at a Glance

```
┌──────────────────────────────────────────┐
│           🔴 Research Lead               │
├──────────────────────────────────────────┤
│ Container: agent-research-lead           │
│ MCP Tools: GitHub, Docker Hub, FS        │
│ Mission: Analyze, research, document     │
│ Output: /workspace/shared/research/      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│             🔵 Dev Lead                  │
├──────────────────────────────────────────┤
│ Container: agent-dev-lead                │
│ MCP Tools: GitHub, Docker Hub, FS, VSCode│
│ Mission: Code, build, test               │
│ Output: /workspace/projects/             │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│            🟢 Deploy Lead                │
├──────────────────────────────────────────┤
│ Container: agent-deploy-lead             │
│ MCP Tools: GitHub, Docker Hub, FS, Containers│
│ Mission: Deploy, orchestrate, monitor    │
│ Output: /workspace/shared/deployments/   │
└──────────────────────────────────────────┘
```

## 📋 Environment Variables

```yaml
# All agents have access to:
MCP_GATEWAY_URL: http://mcp-gateway:8080
MCP_GATEWAY_TRANSPORT: streaming
DOCKER_HOST: unix:///var/run/docker.sock
WORKSPACE_ROOT: /workspace
GITHUB_TOOLS: enabled
DOCKER_HUB_TOOLS: enabled
FILESYSTEM_TOOLS: enabled

# Role-specific (overrides):
# agent-research: (none additional)
# agent-dev:      VS_CODE_SYNC=enabled
# agent-deploy:   CONTAINER_MANAGEMENT=enabled
```

## 🔗 Inter-Agent Communication Pattern

```
agent-research writes:
  /workspace/shared/research/findings.json
    {
      "task": "analyze-nodejs-libraries",
      "findings": [...],
      "recommended_images": ["node:18-alpine", ...]
    }
              ↓
   file-monitor detects change
              ↓
  agent-dev reads, implements findings
              ↓
  agent-dev writes:
    /workspace/shared/dev/implemented.json
              ↓
  agent-deploy reads, deploys
              ↓
  agent-deploy writes:
    /workspace/shared/deployments/status.json
```

## 🛠️ Configuration Files

| File | Purpose | Templated |
|------|---------|-----------|
| `.env` | Shared environment vars | No |
| `docker-compose.yml` | Service definitions | No |
| `agents/[role]/config.yaml` | Agent configuration | Yes (${ENV_VAR}) |
| `agents/[role]/entrypoint.sh` | Startup logic | No |
| `agents/[role]/Dockerfile` | Image definition | No |

## 🔐 Secrets & Credentials

Store in **Docker Desktop → MCP Toolkit → [Profile] → [Server] → Configuration**:

- **GitHub PAT**: `ghp_...` (create: https://github.com/settings/tokens)
- **Docker Hub Token**: `dckr_...` (create: https://hub.docker.com/settings/security)
- **API Keys**: Stripe, Anthropic, etc.

**Never** commit to git or hardcode in containers.

## 📊 Scaling to N Agents

To add a 4th agent (e.g., QA):

1. Copy `agents/research/` → `agents/qa/`
2. Edit `config.yaml`: `AGENT_NAME=QABot`, `AGENT_ROLE=qa-lead`, `AGENT_COLOR=yellow`
3. Add to `docker-compose.yml`:
   ```yaml
   agent-qa:
     build: ./agents/qa
     container_name: agent-qa-lead
     environment:
       - AGENT_ROLE=qa-lead
       - AGENT_NAME=QABot
       - AGENT_COLOR=yellow
     networks: [agents, mcp-hub, shared-services]
     depends_on: {mcp-gateway: {condition: service_healthy}}
   ```
4. Run: `docker-compose up -d agent-qa`

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Gateway won't start | `docker-compose logs mcp-gateway` → Check Docker running |
| Agents can't reach gateway | `docker exec agent-research-lead ping mcp-gateway` |
| Files not syncing | `ls -la ./projects ./shared ./cache` → Verify host dirs exist |
| GitHub tools missing | Docker Desktop → MCP Toolkit → Catalog → Add GitHub |
| Permission denied on Docker socket | `sudo chown $USER /var/run/docker.sock` (Linux only) |

## 📦 Adding Agents' Dependencies

To install Python packages, edit agent Dockerfile:

```dockerfile
RUN pip install --no-cache-dir \
    mcp \
    httpx \
    pydantic \
    click \
    pyyaml \
    anthropic        # Add LLM client
    aiohttp          # Add async HTTP
```

Then rebuild: `docker-compose build --no-cache`

## 🚀 Next: Implement Agent Logic

Replace Python placeholder in `agents/[role]/entrypoint.sh`:

```python
# REPLACE THIS:
python3 -c "
import os, time
while True:
    print(f'[{agent_name}] Monitoring...')
    time.sleep(30)
"

# WITH THIS (pseudocode):
python3 << 'EOF'
import asyncio
from anthropic import Anthropic

client = Anthropic()

async def agent_loop():
    while True:
        # 1. Read task from shared/
        task = read_task_queue()
        
        # 2. Call Claude with MCP tools
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            tools=[
                {"type": "mcp", "name": "github", ...},
                {"type": "mcp", "name": "docker-hub", ...},
                # ... other tools
            ],
            messages=[{"role": "user", "content": task}]
        )
        
        # 3. Execute tools
        for content_block in response.content:
            if content_block.type == "tool_use":
                execute_mcp_tool(content_block)
        
        # 4. Write result to shared/
        write_result(response)
        
        await asyncio.sleep(5)

asyncio.run(agent_loop())
EOF
```

## 📚 Resources

- **ARCHITECTURE.md** - Deep dive into design
- **QUICKSTART.md** - Getting started
- **MCP_SETUP.md** - Configure MCP servers
- **SUMMARY.md** - Complete overview
- **Docker Compose Docs** - https://docs.docker.com/compose/
- **Docker MCP Toolkit** - https://docs.docker.com/ai/mcp-catalog-and-toolkit/
- **Docker MCP Catalog** - https://hub.docker.com/search?q=&type=mcp

---

**Status: ✓ Ready to Start | ✓ Networks Configured | ✓ MCP Hub Available**

Run: `./start.sh` then `docker-compose logs -f`
