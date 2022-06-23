#!/bin/bash

set -ex

# Go to Epinio repo, checkout should have been done before or course!
pushd epinio

# Install needed tools and compile Epinio
make tools-install
make build

# Add options for External Registry if needed
if [[ ${EXT_REG} == "1" ]]; then
  INSTALL_OPTIONS+="
   --set containerregistry.enabled=false \
   --set global.registryURL=registry.hub.docker.com \
   --set global.registryUsername=${EXT_REG_USER} \
   --set global.registryPassword=${EXT_REG_PASSWORD} \
   --set global.registryNamespace=${EXT_REG_USER} \
  "
fi

# Add options for S3 Storage if needed
if [[ ${S3} == "1" ]]; then
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
sleep 20
dist/epinio-* login -u admin -p password --trust-ca https://epinio.${EPINIO_SYSTEM_DOMAIN}

# Wait a little before getting informations, otherwise we can have a 502 code
sleep 20
dist/epinio-* info

# Go back to the previous directory
popd
