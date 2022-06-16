#!/bin/bash

set -ex

# The script uses nohup and &, it works but maybe it could be more elegant
# I was thinking about systemctl service but maybe overkill for oneshot deployment?

# Deploy the latest ui-backend
pushd ui-backend/src/jetstream
cp config.example config.properties
echo 'AUTH_ENDPOINT_TYPE=epinio' >> config.properties
go build && \
    EPINIO_API_URL=https://epinio.${EPINIO_SYSTEM_DOMAIN} \
    EPINIO_WSS_URL=https://epinio.${EPINIO_SYSTEM_DOMAIN} \
    EPINIO_API_SKIP_SSL=true  \
    EPINIO_VERSION=dev \
    nohup ./jetstream &

# Deploy the latest dev dashboard
popd; pushd dashboard
npm install --global yarn && yarn install
EXCLUDES_PKG=rancher-components \
    API=https://localhost:5443  \
    RANCHER_ENV=epinio \
    nohup yarn mem-dev & 
