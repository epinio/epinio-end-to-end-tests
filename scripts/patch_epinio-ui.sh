#!/bin/bash

set -ex

# Patch the epinio-ui deployment with latest QA image
kubectl set image -n epinio deployment/epinio-ui epinio-ui=juadk/epinio-ui-qa:latest
