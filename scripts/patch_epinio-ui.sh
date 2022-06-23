#!/bin/bash

set -ex

# Patch the epinio-ui deployment with latest QA image
kubectl set image -n epinio deployment/epinio-ui epinio-ui=epinioteam/epinio-ui-qa:latest
