# MCP Profile Setup for Agent Teams

This guide configures Docker Desktop's MCP Toolkit to enable GitHub, Docker Hub, and Filesystem tools for your agent team.

## Prerequisites

- Docker Desktop 4.62+
- MCP Toolkit enabled in Docker Desktop settings

## Step 1: Verify MCP Toolkit is Enabled

1. Open **Docker Desktop**
2. Go to **Settings → Beta features**
3. Check **Enable Docker MCP Toolkit**
4. Click **Apply**
5. Restart Docker Desktop

## Step 2: Create Profile via CLI (Recommended)

```powershell
# List existing profiles
docker mcp profile list

# Create a new profile for agents
docker mcp profile create --name agent-team-profile

# Verify
docker mcp profile show agent-team-profile
```

## Step 3: Add MCP Servers to Profile

### Option A: Docker Desktop UI (Visual)

1. Open **Docker Desktop → MCP Toolkit**
2. Go to **Profiles** tab → Select **agent-team-profile**
3. Go to **Catalog** tab
4. Search for and add each server:

#### GitHub MCP Server
- Search: "github"
- Click **GitHub** (official)
- Click **Add to agent-team-profile**
- Configure: Enter GitHub PAT (Personal Access Token)
  - Create PAT: https://github.com/settings/tokens
  - Scopes needed: `repo`, `read:user`
- Save

#### Docker Hub MCP Server
- Search: "docker-hub" or "docker hub"
- Click **Docker Hub**
- Click **Add to agent-team-profile**
- Configure: Enter Docker Hub username and token
  - Create token: https://hub.docker.com/settings/security
- Save

#### Filesystem MCP Server
- Search: "filesystem"
- Click **Filesystem**
- Click **Add to agent-team-profile**
- Configure: Set `paths` to allow workspace access
  - Add paths: `/workspace/projects`, `/workspace/shared`, `/workspace/cache`
- Save

### Option B: CLI (Scripted)

```powershell
# Enable GitHub (requires GitHub PAT stored in Docker secrets)
# docker mcp server add github --profile agent-team-profile

# Enable Docker Hub
# docker mcp server add docker-hub --profile agent-team-profile

# Enable Filesystem
# docker mcp server add filesystem --profile agent-team-profile

# (These are examples; exact CLI commands depend on Docker version)
```

## Step 4: Verify Profile

```powershell
# Show all servers in profile
docker mcp profile show agent-team-profile

# Test gateway with profile
docker mcp gateway run --profile agent-team-profile --verbose

# Expected output:
# - Reading profile configuration...
# - Loading catalog...
# - Servers loaded: github, docker-hub, filesystem
# - Listing MCP tools...
# - Start stdio server
```

## Step 5: Update Agent Team Compose File (Optional)

If you want to use `agent-team-profile` instead of `default_profile`:

```yaml
# In docker-compose.yml, update mcp-gateway service:

  mcp-gateway:
    command:
      - --profile=agent-team-profile  # Changed from default_profile
      - --port=8080
      - --transport=streaming
```

Then rebuild:
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Step 6: Connect Claude Desktop (Already Done)

Claude Desktop config (`$env:APPDATA\Claude\claude_desktop_config.json`) is already set:

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

If you're using `agent-team-profile`, update it:

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": ["mcp", "gateway", "run", "--profile", "agent-team-profile"]
    }
  }
}
```

Then restart Claude Desktop.

## Step 7: Test Connectivity

### From Agents (Inside Containers)

```powershell
# Check if agents can reach gateway
docker exec agent-research-lead curl http://mcp-gateway:8080/health

# Expected: 200 OK (or similar healthy response)
```

### From Claude Desktop

1. Restart Claude Desktop
2. Ask: "List my GitHub repositories"
3. Should see GitHub MCP tools working
4. Ask: "Search Docker Hub for nginx"
5. Should see Docker Hub tools working

### From Host

```powershell
# Gateway health
curl http://localhost:8080/health

# List available tools (if gateway supports endpoint)
curl http://localhost:8080/tools
```

## Troubleshooting

### Gateway Won't Start

```powershell
# Check Docker is running
docker ps

# Check MCP Toolkit is enabled
docker mcp profile list

# View gateway logs
docker-compose logs mcp-gateway

# Manually test gateway
docker mcp gateway run --profile default_profile --verbose
```

### Agents Can't Connect to Gateway

```powershell
# Check network connectivity
docker exec agent-research-lead ping mcp-gateway

# Check port 8080 is accessible
docker exec agent-research-lead curl http://mcp-gateway:8080/health

# View agent logs
docker-compose logs agent-research
```

### GitHub/Docker Hub Tools Not Available

1. Check servers were added to profile:
   ```powershell
   docker mcp profile show agent-team-profile
   ```

2. Verify secrets/configuration:
   - Docker Desktop → MCP Toolkit → Profiles → agent-team-profile
   - Check each server has required fields filled

3. Restart gateway:
   ```powershell
   docker-compose restart mcp-gateway
   ```

### Filesystem Tool Access Denied

```powershell
# Check if paths are allowed in filesystem config
docker mcp profile show agent-team-profile | grep -A 5 filesystem

# Add workspace paths if missing:
# Docker Desktop → MCP Toolkit → Profiles → agent-team-profile → Filesystem → Configure
# Paths: /workspace/projects, /workspace/shared, /workspace/cache
```

## Available Tools After Setup

Once configured, agents and Claude Desktop have access to:

### GitHub MCP Server Tools
- `search_repositories` - Find repos by keyword
- `get_repository_details` - Get repo info
- `list_issues` - View open issues
- `create_issue` - File a new issue
- `get_pull_requests` - View pull requests
- `create_pull_request` - Open a PR
- `commit_changes` - Push code changes

### Docker Hub MCP Server Tools
- `search_repositories` - Find images by name
- `get_repository_info` - Image metadata
- `get_tags` - View available versions
- `get_readme` - View image documentation

### Filesystem MCP Server Tools
- `read_file` - Read file from allowed path
- `write_file` - Write file to allowed path
- `list_directory` - List directory contents
- `delete_file` - Remove file
- `search_files` - Search directory recursively

## Extending Profile with More Tools

Docker MCP Catalog has 300+ tools. To add more:

1. **Docker Desktop → MCP Toolkit → Catalog**
2. Search (e.g., "stripe", "gmail", "slack")
3. Click **Add to agent-team-profile**
4. Configure required fields
5. Agents auto-discover on next restart

**Popular additions:**
- **Stripe MCP**: Payment processing automation
- **Gmail MCP**: Email integration
- **Slack MCP**: Team notifications
- **Linear MCP**: Issue tracking
- **Anthropic Claude Models**: Direct model access

---

**Your MCP profile is now configured for agent teams with GitHub, Docker Hub, and Filesystem tools. Agents can collaborate via shared workspace and external integrations.**
