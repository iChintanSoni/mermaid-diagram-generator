# Define network name
NETWORK_NAME="mermaid-diagram-network"

# Check if the network exists
if ! podman network exists "$NETWORK_NAME"; then
    echo "Creating network: $NETWORK_NAME"
    podman network create "$NETWORK_NAME"
else
    echo "Network '$NETWORK_NAME' already exists. Skipping creation."
fi

#!/usr/bin/env bash
set -e

# Colors for terminal output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
RESET="\033[0m"

log() {
  echo -e "$1"
}

SERVICE_NAME="Vector Store"

log "${BLUE}🔹 Starting ${SERVICE_NAME}...${RESET}"

# Stop any running containers and start new ones
podman-compose down
podman-compose up --build -d

log "${GREEN}✅ ${SERVICE_NAME} started successfully.${RESET}"
