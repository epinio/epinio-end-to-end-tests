#!/bin/bash

set -ex

# Go to Epinio repo, checkout should have been done before or course!
pushd epinio

# Install needed tools and compile Epinio
make tools-install
make build

# Add options for External Registry if needed
if [[ -n "${EXT_REG_USER}" && -n "${EXT_REG_PASSWORD}" ]]; then
  INSTALL_OPTIONS+="
   --set registry.url=registry.hub.docker.com \
   --set registry.username=${EXT_REG_USER} \
   --set registry.password=${EXT_REG_PASSWORD} \
   --set registry.namespace=${EXT_REG_USER} \
  "
fi

# Add options for S3 Storage if needed
if [[ -n "${S3_KEY_ID}" && -n "${S3_KEY_SECRET}" ]]; then
  INSTALL_OPTIONS+="
   --set minio.enabled=false \
   --set s3.useSSL=true \
   --set s3.bucket=epinio-ci \
   --set s3.endpoint=s3.amazonaws.com \
   --set s3.accessKeyID=${S3_KEY_ID} \
   --set s3.secretAccessKey=${S3_KEY_SECRET} \
  "
fi

# Install Epinio
helm upgrade --debug --wait --install -n epinio --create-namespace epinio helm-charts/chart/epinio \
  --set global.domain=${EPINIO_SYSTEM_DOMAIN} \
  --set server.accessControlAllowOrigin="https://${MY_HOSTNAME}" \
  ${INSTALL_OPTIONS} \
  --wait

# Wait for Epinio deployment to be ready
kubectl rollout status deployment epinio-server -n epinio --timeout=480s

# Patch Epinio pod, mandatory to use the 'main' version!
make patch-epinio-deployment

# Show Epinio info, could be useful for debugging
dist/epinio-* config update

# Wait a little before getting informations, otherwise we can have a 502 code
sleep 20
dist/epinio-* info

# Go back to the previous directory
popd
