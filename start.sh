#!/bin/bash
set -e

echo "=================================="
echo "Agent Team Docker Setup"
echo "=================================="
echo ""

# Create directory structure
echo "[Setup] Creating workspace directories..."
mkdir -p projects/frontend projects/backend projects/infra
mkdir -p shared cache

# Create placeholder files
echo "[Setup] Initializing project structure..."
cat > projects/README.md << EOF
# Projects Workspace

This directory contains all team projects:
- **frontend/**: Research Lead monitors for UI/UX insights
- **backend/**: Dev Lead manages API and core logic
- **infra/**: Deploy Lead handles infrastructure code

All agents can read and write here. Shared cache in /cache for inter-agent communication.
EOF

cat > shared/README.md << EOF
# Shared Communication Hub

Agents coordinate via this directory:
- Task assignments (JSON)
- Research findings (Markdown)
- Deployment plans (YAML)
- Status reports (Log files)

Monitor this directory for agent activity.
EOF

# Pull/build agent images
echo "[Setup] Building agent images..."
docker-compose build --no-cache || echo "Build completed with warnings"

# Start services
echo "[Setup] Starting Docker Compose stack..."
docker-compose up -d

echo ""
echo "=================================="
echo "✓ Agent Team Stack Started"
echo "=================================="
echo ""
echo "Containers running:"
docker-compose ps
echo ""
echo "Networks created:"
docker network ls | grep -E "mcp-hub|agents-network|shared-services"
echo ""
echo "MCP Gateway health check:"
sleep 5
curl -s http://localhost:8080/health || echo "Gateway not ready yet"
echo ""
echo "Next steps:"
echo "  1. docker-compose logs -f mcp-gateway      # Watch MCP Gateway startup"
echo "  2. docker-compose logs -f agent-research   # Watch Research Agent"
echo "  3. docker-compose logs -f agent-dev        # Watch Dev Agent"
echo "  4. docker-compose logs -f agent-deploy     # Watch Deploy Agent"
echo "  5. Monitor /workspace/shared for inter-agent communication"
echo ""
