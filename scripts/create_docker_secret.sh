#!/bin/bash

DOCKER_TOKEN=$(echo -n "$EXT_REG_USER:$EXT_REG_PASSWORD" | base64)
GHCR_TOKEN=$(echo -n "$GHCR_USER:$GHCR_PASSWORD" | base64)

sudo mkdir -p /etc/rancher/k3s
sudo tee /etc/rancher/k3s/registries.yaml << EOF
mirrors:
  docker.io:
    endpoint:
      - "https://registry-1.docker.io"
  ghcr.io:
    endpoint:
      - "https://ghcr.io"

configs:
  "registry-1.docker.io":
    auth:
      auth: $DOCKER_TOKEN
  "ghcr.io":
    auth:
      auth: $GHCR_TOKEN
EOF
