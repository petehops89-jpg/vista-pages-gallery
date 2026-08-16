# 🎯 Next Steps: From Architecture to Running Agent Team

Your **complete Docker agent team architecture** is now in place. Here's how to get it running.

## Phase 1: Immediate (Right Now - 5 minutes)

### 1.1 Make Start Script Executable
```powershell
chmod +x start.sh
```

### 1.2 Review Docker Compose (Optional)
```powershell
cat docker-compose.yml
```
Should show:
- `mcp-gateway` service
- `agent-research`, `agent-dev`, `agent-deploy` services
- `file-monitor` service
- 3 networks: `mcp-hub`, `agents-network`, `shared-services`
- Volume mounts: `/var/run/docker.sock`, workspace dirs

### 1.3 Launch the Stack
```powershell
./start.sh
```

Expected output:
```
==================================
Agent Team Docker Setup
==================================

[Setup] Creating workspace directories...
[Setup] Initializing project structure...
[Setup] Building agent images...
[Setup] Starting Docker Compose stack...

==================================
✓ Agent Team Stack Started
==================================

Containers running:
NAME                    STATUS
mcp-gateway-hub         Up
gateway-init            Exited
file-monitor            Up
agent-research-lead     Up
agent-dev-lead          Up
agent-deploy-lead       Up
```

### 1.4 Verify All Running
```powershell
docker-compose ps
```

Should show 3 agents + gateway + file-monitor all running (UP).

### 1.5 Check Gateway Health
```powershell
curl http://localhost:8080/health
```

Should return 200 OK (or similar health status).

---

## Phase 2: Verify & Configure (Next - 10 minutes)

### 2.1 Verify Agents Connected
```powershell
docker-compose logs agent-research | tail -20
docker-compose logs agent-dev | tail -20
docker-compose logs agent-deploy | tail -20
```

Look for:
```
[Agent] ResearchBot (research-lead) started
[Agent] MCP Gateway: http://mcp-gateway:8080
[Agent] Monitoring: 0 projects, 0 shared files
```

### 2.2 Set Up MCP Tools in Docker Desktop

Open **Docker Desktop → MCP Toolkit** and add servers to `default_profile`:

**Add GitHub MCP:**
1. **Profiles** tab → Select `default_profile`
2. **Catalog** tab → Search "github"
3. Click **GitHub** → **Add to default_profile**
4. Configure: Paste GitHub PAT token
   - Create PAT: https://github.com/settings/tokens (select `repo` scope)
5. Save

**Add Docker Hub MCP:**
1. **Catalog** tab → Search "docker-hub"
2. Click **Docker Hub** → **Add to default_profile**
3. Configure: Enter username + Docker Hub token
   - Create token: https://hub.docker.com/settings/security
4. Save

**Add Filesystem MCP:**
1. **Catalog** tab → Search "filesystem"
2. Click **Filesystem** → **Add to default_profile**
3. Configure: Leave paths as default (or add `/workspace` paths)
4. Save

### 2.3 Restart Claude Desktop

Close and reopen Claude Desktop for it to see new MCP tools.

Test in Claude:
> "Search GitHub for python async libraries"
> "List available Node.js images on Docker Hub"

Should see results from MCP tools.

---

## Phase 3: Test Agent Communication (15 minutes)

### 3.1 Create Task File
```powershell
# Create a research task
mkdir shared/research -Force
@"
{
  "task_id": "test-001",
  "task": "analyze-node-frameworks",
  "assigned_to": "research-lead",
  "status": "pending"
}
"@ | Out-File shared/research/task.json
```

### 3.2 Monitor Agent Reaction
```powershell
docker-compose logs -f agent-research | grep -i "task\|monitoring\|shared"
```

Should see agent detect the new file (if agent logic is implemented).

### 3.3 Write Test Output
```powershell
# Manually write a finding (simulate research)
@"
{
  "research_complete": true,
  "findings": {
    "recommended": ["express", "fastify", "hapi"],
    "trending": true
  },
  "timestamp": $(Get-Date -Format 'o')
}
"@ | Out-File shared/research/findings.json
```

### 3.4 Verify File Sync
```powershell
ls shared/
ls projects/
```

Files should be visible on host. Check in agent container:
```powershell
docker exec agent-dev-lead ls /workspace/shared/
```

Should match host directory.

---

## Phase 4: Connect to Claude Desktop (Optional - 5 minutes)

### 4.1 Verify Claude Config
```powershell
cat $env:APPDATA\Claude\claude_desktop_config.json
```

Should show:
```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": ["mcp", "gateway", "run", "--profile", "default_profile"]
    }
  }
}
```

### 4.2 Test Claude + Agent Team Integration

In Claude Desktop:
> "What projects are in the agent workspace?"
> "Show me the shared findings directory"

Claude should see files from `/workspace/shared` via MCP Toolkit.

---

## Phase 5: Customize Agent Logic (1-2 hours)

### 5.1 Implement Agent Loop

Replace the Python placeholder in `agents/[role]/entrypoint.sh` with actual agent code:

```python
# Example (pseudocode):
import asyncio
from anthropic import Anthropic
import json
import os

client = Anthropic()

async def agent_loop():
    agent_name = os.getenv('AGENT_NAME')
    role = os.getenv('AGENT_ROLE')
    
    while True:
        # 1. Read task from shared/
        task_file = f"/workspace/shared/{role}/task.json"
        if os.path.exists(task_file):
            with open(task_file) as f:
                task = json.load(f)
            
            # 2. Call Claude with MCP tools
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                tools=[...],  # GitHub, Docker Hub, Filesystem
                messages=[{"role": "user", "content": task["task"]}]
            )
            
            # 3. Write results
            with open(f"/workspace/shared/{role}/result.json", "w") as f:
                json.dump({
                    "agent": agent_name,
                    "task_id": task["task_id"],
                    "result": str(response.content),
                    "status": "complete"
                }, f)
        
        await asyncio.sleep(5)

asyncio.run(agent_loop())
```

### 5.2 Test Agent Logic
```powershell
docker-compose restart agent-research
docker-compose logs -f agent-research
```

---

## Phase 6: Scale & Extend (Optional)

### 6.1 Add a 4th Agent (QA)
```powershell
# Copy research agent structure
cp -r agents/research agents/qa

# Edit agents/qa/config.yaml:
# Change: AGENT_NAME=QABot, AGENT_ROLE=qa-lead, AGENT_COLOR=yellow
```

### 6.2 Update docker-compose.yml
```yaml
  agent-qa:
    build: ./agents/qa
    container_name: agent-qa-lead
    environment:
      - AGENT_ROLE=qa-lead
      - AGENT_NAME=QABot
      - AGENT_COLOR=yellow
    networks: [agents, mcp-hub, shared-services]
    depends_on:
      mcp-gateway:
        condition: service_healthy
```

### 6.3 Launch New Agent
```powershell
docker-compose up -d agent-qa
docker-compose logs -f agent-qa
```

---

## 📋 Checklist: Are You Done?

✅ **Setup Complete:**
- [ ] `./start.sh` runs without errors
- [ ] `docker-compose ps` shows all 6 containers UP
- [ ] `curl http://localhost:8080/health` returns 200
- [ ] `docker-compose logs` shows agents connected to gateway

✅ **MCP Tools Configured:**
- [ ] GitHub MCP added to default_profile
- [ ] Docker Hub MCP added to default_profile
- [ ] Filesystem MCP added to default_profile
- [ ] Claude Desktop restarted and sees tools

✅ **Integration Verified:**
- [ ] Files in `shared/` visible in all agents
- [ ] Agent logs show monitoring active
- [ ] Claude Desktop can access MCP tools via gateway

✅ **Optional (Advanced):**
- [ ] Custom agent logic implemented (replaces Python placeholder)
- [ ] Agent responds to task files in `shared/`
- [ ] 4th agent (or more) added and running
- [ ] Docker Hub → GitHub → Local FS workflow tested

---

## 🆘 If Something Breaks

### Gateway Won't Start
```powershell
docker-compose logs mcp-gateway
# Check: Is Docker Desktop running?
# Check: Is MCP Toolkit enabled?
```

### Agents Can't Connect
```powershell
docker exec agent-research-lead curl http://mcp-gateway:8080/health
# Check: Both on same network (mcp-hub)?
docker network inspect mcp-hub | grep -A 5 "Containers"
```

### Files Not Syncing
```powershell
ls -la projects/ shared/ cache/
docker exec file-monitor ls /workspace/
# Check: Are directories created on host?
```

### MCP Tools Not Showing
```powershell
# Check: Are they added to default_profile?
docker mcp profile show default_profile | grep -i github
# Restart gateway to reload:
docker-compose restart mcp-gateway
```

See **REFERENCE.md** for more troubleshooting.

---

## 📞 Quick Command Reference

```powershell
# Start
./start.sh

# Logs
docker-compose logs -f                 # All
docker-compose logs -f agent-research  # Single agent

# Status
docker-compose ps

# Stop
docker-compose down

# Clean
docker-compose down -v

# Network
docker network inspect agents-network

# Files
ls shared/
ls projects/

# Test
curl http://localhost:8080/health

# Debug
docker exec agent-research-lead bash
docker-compose up --build              # Rebuild on changes
```

---

## ✨ You're Ready to Go!

1. Run: `./start.sh`
2. Add MCP servers in Docker Desktop UI
3. Test with Claude Desktop
4. Implement custom agent logic
5. Scale to more agents as needed

**Agent team status: 🟢 Ready to Deploy**

---

Detailed guides:
- **QUICKSTART.md** - Full startup walkthrough
- **ARCHITECTURE.md** - Design deep-dive
- **MCP_SETUP.md** - MCP server configuration
- **REFERENCE.md** - Commands and troubleshooting
