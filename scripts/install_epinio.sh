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
   --set s3.endpoint=s3.eu-central-1.amazonaws.com \
   --set s3.accessKeyID=${S3_KEY_ID} \
   --set s3.secretAccessKey=${S3_KEY_SECRET} \
   --set s3.region=eu-central-1 \
  "
fi

# Append extraEnv.name and value if provided
if [[ -v EXTRAENV_NAME ]] && [[ -v EXTRAENV_VALUE ]]; then
INSTALL_OPTIONS+="
   --set extraEnv[0].name=${EXTRAENV_NAME} \
   --set-string extraEnv[0].value=${EXTRAENV_VALUE} \
  "
fi

# Use specific Epinio version if called
# If not, use latest Epinio version
if [[ ! -z $EPINIO_VERSION  ]]; then
ADD_EPINIO_VERSION="--version=${EPINIO_VERSION}"
  echo "using CHART=epinio/epinio"
  echo "using EPINIO_VERSION=${EPINIO_VERSION}"
  CHART="epinio/epinio"
else
  echo "using CHART=helm-charts/chart/epinio"
  CHART="helm-charts/chart/epinio/"
fi

# Install Epinio
helm upgrade --debug --wait --install -n epinio --create-namespace epinio ${CHART} \
  --set global.domain=${EPINIO_SYSTEM_DOMAIN} \
  --set server.accessControlAllowOrigin="https://${MY_HOSTNAME}" \
  --set server.disableTracking=true \
  ${INSTALL_OPTIONS} \
  ${ADD_EPINIO_VERSION} \
  --values ../scripts/values-users.yaml \
  --wait

# Wait for Epinio deployment to be ready
kubectl rollout status deployment epinio-server -n epinio --timeout=480s

# Patch Epinio pod if no targeting specific versions
# mandatory to use the 'main' version!
if [[ -z $EPINIO_VERSION ]]; then
  echo "Patching"
  make patch-epinio-deployment
fi

# Show Epinio info, could be useful for debugging
kubectl wait pods -n epinio -l app.kubernetes.io/name=epinio-server --for=condition=ready --timeout=2m
dist/epinio-* login -u admin -p password --trust-ca https://epinio.${EPINIO_SYSTEM_DOMAIN}
dist/epinio-* info

# Go back to the previous directory
popd
