FROM python:3.11-slim

WORKDIR /app

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Python MCP client and agent libraries
RUN pip install --no-cache-dir \
    mcp \
    httpx \
    pydantic \
    click \
    pyyaml

# Create workspace directories
RUN mkdir -p /workspace/{projects,shared,cache}

# Copy agent startup script (role-specific, provided at runtime)
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Copy baseline config
COPY config.yaml /app/config.baseline.yaml

ENTRYPOINT ["/app/entrypoint.sh"]
