### Rancher UI E2E tests
[![Scenario 1 Chrome](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_rancher_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_rancher_ui.yml?query=branch%3Amain)
[![Scenario 2 Firefox](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_rancher_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_rancher_ui.yml?query=branch%3Amain)

### Standalone UI E2E tests
[![Scenario 1 Chrome](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_std_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_std_ui.yml?query=branch%3Amain)
[![Scenario 2 Firefox](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_std_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_std_ui.yml?query=branch%3Amain)

# epinio-end-to-end-tests
This repository contains all the files necessary to run Epinio end-to-end tests.</br>
In the cypress directory are stored the tests written using the [Cypress](https://www.cypress.io/) testing framework.</br>
Tests are executed every night in the CI. For now, two scenarios are tested.

## Rancher and Epinio UI
E2E tests are executed both on Rancher and Epinio UI but there is a difference between them.</br>
For the first one, Epinio is installed via Rancher while for Epinio UI, Epinio is installed via Helm command line.</br>
__Attention__, we currently have an [issue](https://github.com/epinio/ui/issues/88) for running our Cypress tests on the standalone UI so it's still Rancher UI configured there but as mentioned above, installation process is different.
## Scenario 1 - Using Chrome
In this first scenario, Epinio is deployed with default options. </br>
You can check all the things we test directly in the [file](./cypress/integration/scenarios/with_default_options.spec.ts).

## Scenario 2 - Using Firefox
Second scenario tests Epinio installation with S3 and external registry configured. </br>
Unlike the first scenario, we only play a small bunch of [tests](./cypress/integration/scenarios/with_s3_and_external_registry.spec.ts).

## Which versions are tested
Obviously, e2e tests are ran with main branches of [epinio](https://github.com/epinio/epinio) and [epinio's helm chart](https://github.com/epinio/helm-charts).

