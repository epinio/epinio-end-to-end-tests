#!/bin/bash

set -ex

# Patch the epinio-ui deployment with latest dev image
# The image is building by https://github.com/epinio/ui/actions/workflows/release-next.yml
kubectl set image -n epinio deployment/epinio-ui epinio-ui=ghcr.io/epinio/epinio-ui:latest-next
kubectl patch deployment epinio-ui -n epinio -p '{"spec":{"template":{"spec":{"containers":[{"name":"epinio-ui", "imagePullPolicy":"Always"}]}}}}'
kubectl wait pods -n epinio -l app.kubernetes.io/name=epinio-ui --for=condition=ready --timeout=2m
