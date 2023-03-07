#!/bin/bash

set -ex

# Create docker pull secret to avoid the docker hub rate limit
kubectl create secret docker-registry regcred \
  --docker-server https://index.docker.io/v1/ \
  --docker-username $EXT_REG_USER \
  --docker-password $EXT_REG_PASSWORD
# Create ghcr.io pull secret to avoid the container pull rate limit
kubectl create secret docker-registry regcred-ghcr \
  --docker-server ghcr.io \
  --docker-username $GHCR_USER \
  --docker-password $GHCR_PASSWORD
# Use the secrets/credentials in default sa
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name":"regcred"},{"name":"regcred-ghcr"}]}'
