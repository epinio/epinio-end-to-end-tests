#!/bin/bash

set -ex

# Go to Epinio repo, checkout should have been done before or course!
pushd epinio

# Install needed tools and compile Epinio
make tools-install
make build

# Add development Epinio Helm chart repo locally
make setup_chart_museum

# Mandatory! Otherwise Helm repos are not seen...
helm repo update

# Add options for External Registry if needed
if [[ -n "${EXT_REG_USER}" && -n "${EXT_REG_PASSWORD}" ]]; then
  INSTALL_OPTIONS+="
   --set externalRegistryURL=registry.hub.docker.com \
   --set externalRegistryUsername=${EXT_REG_USER} \
   --set externalRegistryPassword=${EXT_REG_PASSWORD} \
   --set externalRegistryNamespace=${EXT_REG_USER} \
  "
fi

# Add options for S3 Storage if needed
if [[ -n "${S3_KEY_ID}" && -n "${S3_KEY_SECRET}" ]]; then
  INSTALL_OPTIONS+="
   --set useS3Storage=true \
   --set s3UseSSL=true \
   --set s3Bucket=epinio-ci \
   --set s3Endpoint=s3.amazonaws.com \
   --set s3AccessKeyId=${S3_KEY_ID} \
   --set s3SecretAccessKey=${S3_KEY_SECRET} \
  "
fi

# Install Epinio
helm install epinio-installer epinio-chartmuseum/epinio-installer \
 --set domain="${EPINIO_SYSTEM_DOMAIN}" \
 --set accessControlAllowOrigin="https://${MY_HOSTNAME}" \
 --set skipTraefik=true \
 --set skipCertManager=true \
 --set containerRegistryChart="http://chartmuseum.${EPINIO_SYSTEM_DOMAIN}/charts/container-registry-0.1.0.tgz" \
 --set epinioChart="http://chartmuseum.${EPINIO_SYSTEM_DOMAIN}/charts/epinio-0.1.0.tgz" \
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
