#!/bin/bash

set -ex

pushd ui-backend

cp src/jetstream/config.example src/jetstream/config.properties
echo 'AUTH_ENDPOINT_TYPE=epinio' >> src/jetstream/config.properties
pushd src/jetstream 
go build && EPINIO_API_URL=https://epinio.${EPINIO_SYSTEM_DOMAIN} EPINIO_WSS_URL=https://epinio.${EPINIO_SYSTEM_DOMAIN} EPINIO_API_SKIP_SSL=true EPINIO_VERSION=dev nohup ./jetstream &
popd
popd

pushd dashboard
sudo zypper in -y yarn
yarn install
yarn install 
API=https://localhost:5443 RANCHER_ENV=epinio nohup yarn mem-dev & 
