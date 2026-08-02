#!/bin/sh
set -e

echo "[$(date)] Agent starting: ${AGENT_NAME} (Role: ${AGENT_ROLE})"
echo "[$(date)] Color: ${AGENT_COLOR}"
echo "[$(date)] MCP Gateway: ${MCP_GATEWAY_URL}"

# Wait for MCP Gateway to be ready
echo "[$(date)] Waiting for MCP Gateway..."
until curl -s http://mcp-gateway:8080/health > /dev/null; do
  echo "[$(date)] MCP Gateway not ready, waiting..."
  sleep 2
done
echo "[$(date)] MCP Gateway is ready"

# Merge baseline config with role-specific overrides
echo "[$(date)] Loading configuration..."
cp /app/config.baseline.yaml /app/config.yaml

# Add role-specific instructions
cat >> /app/config.yaml << EOF

role_instructions:
  research_lead: |
    You are the Research Lead. Your mission: analyze code, research libraries, 
    identify patterns, and provide strategic insights.
    - Monitor GitHub for relevant projects and issues
    - Search Docker Hub for compatible containers
    - Document findings in /workspace/shared
    - Report to the team via shared cache files

  dev_lead: |
    You are the Development Lead. Your mission: write and maintain code,
    handle day-to-day development tasks, integrate with VS Code.
    - Sync with local VS Code via filesystem
    - Push changes to GitHub
    - Build and test Docker containers
    - Coordinate with other agents via /workspace/shared

  deploy_lead: |
    You are the Deployment Lead. Your mission: orchestrate container deployments,
    manage infrastructure, ensure high availability.
    - Pull images from Docker Hub
    - Manage local containers and networks
    - Monitor deployment health
    - Execute deployment strategies from /workspace/shared
EOF

# Launch agent (placeholder: your actual agent Python script goes here)
echo "[$(date)] Starting agent loop..."
python3 -c "
import os
import time
import json
from pathlib import Path

agent_name = os.getenv('AGENT_NAME', 'Unknown')
role = os.getenv('AGENT_ROLE', 'unknown')
color = os.getenv('AGENT_COLOR', 'white')
mcp_url = os.getenv('MCP_GATEWAY_URL', 'http://localhost:8080')

print(f'[Agent] {agent_name} ({role}) started')
print(f'[Agent] MCP Gateway: {mcp_url}')
print(f'[Agent] Workspace: /workspace')

# Monitor workspace
while True:
    projects = list(Path('/workspace/projects').glob('*'))
    shared = list(Path('/workspace/shared').glob('*'))
    print(f'[{agent_name}] Monitoring: {len(projects)} projects, {len(shared)} shared files')
    time.sleep(30)
" || exec /bin/sh
