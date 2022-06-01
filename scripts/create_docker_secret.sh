#!/bin/bash

set -ex

# Create docker pull secret to avoid the docker hub rate limit
kubectl create secret docker-registry regcred \
  --docker-server https://index.docker.io/v1/ \
  --docker-username $EXT_REG_USER \
  --docker-password $EXT_REG_PASSWORD
