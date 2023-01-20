#!/bin/bash

set -e

# Needed to install Cypress plugins
npm install

# Start Cypress tests with docker
docker run -v $PWD:/e2e -w /e2e                  \
    -e RANCHER_USER=$RANCHER_USER                \
    -e RANCHER_PASSWORD=$RANCHER_PASSWORD        \
    -e SYSTEM_DOMAIN=$EPINIO_SYSTEM_DOMAIN       \
    -e RANCHER_URL=$RANCHER_URL                  \
    -e GREP=$GREP                                \
    -e GREPTAGS=$GREPTAGS                        \
    --add-host host.docker.internal:host-gateway \
    $DOCKER_OPTIONS                              \
    $CYPRESS_DOCKER                              \
    -C /e2e/$CYPRESS_CFG                         \
    -b $BROWSER                                  \
    -s /e2e/$SPEC
