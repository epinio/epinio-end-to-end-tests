#!/bin/bash

set -e

CA_NAME="epinio-tls"
CA_NS="epinio"
DATA_PATH="cypress/fixtures"
typeset -l I

for I in crt key; do
  # Get and decode secret value
  VALUE=$(kubectl get secret ${CA_NAME} \
           -n ${CA_NS} \
           -o jsonpath="{.data.tls\.${I}}" \
          | base64 -d)

  # Store it in a file
  FILE="${DATA_PATH}/${CA_NAME}-${I}-pem.file"
  echo "${VALUE}" > ${FILE}

  # And update cypress.json
  sed -i "s|%${I}%|${FILE}|g" cypress.json
done
