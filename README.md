[![Scenario 1](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_cypress_chrome.yml/badge.svg)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_cypress_chrome.yml)
[![Scenario 2](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_cypress_chrome.yml/badge.svg)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_cypress_chrome.yml)
# epinio-end-to-end-tests
This repository contains all the files necessary to run Epinio end-to-end tests.

In the cypress directory are stored the tests written using the [Cypress](https://www.cypress.io/) testing framework.

Tests are executed every night in the CI. For now, two scenarios are tested.
### Scenario 1
In this first scenario, Epinio is deployed with default options. </br>
You can check all the things we test directly in the [file](./cypress/integration/scenarios/install_with_default_options.spec.ts).

### Scenario 2
Second scenario tests Epinio installation with S3 and external registry configured. </br>
Unlike the first scenario, we only play a small bunch of [tests](./cypress/integration/scenarios/install_with_s3_and_external_registry.spec.ts).

For now, both scenarios are executed on Chrome. </br>
Later, we will execute Scenario 2 on Firefox instead.
## Running the tests

__Attention__, Epinio is using Rancher UI but Epinio will get its own UI in the coming days.
It is not worth it to write documentation that will be quickly become out-of-date.

We will provide an update on how to locally execute the tests later.
