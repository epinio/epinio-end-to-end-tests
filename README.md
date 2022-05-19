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

## Contents

- [Epinio-end-to-end-tests](#epinio-end-to-end-tests)
  - [Contents](#contents)
  - [Rancher UI and Epinio UI](#rancher-and-epinio-ui)
  - [Scenario 1 - Using Chrome](#scenario-1---using-chrome)
  - [Scenario 2 - Using Firefox](#scenario-2---using-firefox)
  - [Process explained in one chart](#process-explained-in-one-chart)
## Rancher UI and Epinio UI
E2E tests are executed both on Rancher UI and Epinio UI but there is a difference between them.</br>
For the first one, Epinio is installed via Rancher while for Epinio UI, it is installed via Helm command line.</br>
The tests run with main branches of [epinio](https://github.com/epinio/epinio) and [epinio's helm chart](https://github.com/epinio/helm-charts).
## How to quickly start a dev env with k3d
__Attention__, it was only tested on Linux so far.
### Epinio UI

1. Clone the repo
```bash
git clone https://github.com/epinio/epinio-end-to-end-tests.git
```

2. Check if you got all dependencies installed:
```bash
make check-dependencies
```

3. Create the cluster
```bash
make prepare-cluster
```
Check the output and export the IP as the IP_ADDR variable (export IP_ADDR=<IP>).

4. Deploy Epinio
```bash
make deploy-epinio
```

5. Export variables for Cypress
```bash
export RANCHER_USER=admin RANCHER_PASSWORD=password RANCHER_URL=https://epinio.${IP_ADDR}.nip.io SYSTEM_DOMAIN=${IP_ADDR}.nip.io
```

6. Start Cypress GUI
```bash
make cypress-gui
```

## Scenario 1 - Using Chrome
In this first scenario, Epinio is deployed with default options. </br>
You can check all the things we test directly in the [file](./cypress/integration/scenarios/with_default_options.spec.ts).

## Scenario 2 - Using Firefox
Second scenario tests Epinio installation with S3 and external registry configured. </br>
Unlike the first scenario, we only play a small bunch of [tests](./cypress/integration/scenarios/with_s3_and_external_registry.spec.ts).

## Process explained in one chart
```mermaid
flowchart TB;
    A{{Color meaning}}
    A --- B([Rancher UI stuff])
    A --- C([Common stuff])
    A --- D([Embedded UI stuff])
    style B fill:#406c93,stroke:#000000,stroke-width:2px;
    style C fill:#823764,stroke:#000000,stroke-width:2px;
    style D fill:#256C35,stroke:#000000,stroke-width:2px;
```
---
```mermaid

flowchart TB;
    %% Rancher UI part
    A[Epinio e2e tests]:::common --> B{Rancher UI}:::rancherUI
    B --> C(Install </br> K3s - Helm - Rancher </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L59-L78'>Makefile</a>):::rancherUI
    C --> D(Install Epinio </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L84-L130'>Cypress container</a>):::rancherUI
    D --> E(Patch Epinio </br> to use latest code </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L132-L170'>Makefile</a>):::rancherUI
    J --> S(Uninstall Epinio </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L196'>Cypress container</a>):::rancherUI

    %% Common part
    E --> F(E2E tests via <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L173-L214'>Cypress container</a>):::common
    F --> G(Scenario 1 </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/scenario_1_chrome_rancher_ui.yml'>Chrome</a>):::rancherUI
    F --> H(Scenario 2 </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/scenario_2_firefox_rancher_ui.yml'>Firefox</a>):::rancherUI
    F --> U([Scenario 1 </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/scenario_1_chrome_std_ui.yml'>Chrome</a>]):::stdUI
    F --> V([Scenario 2 </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/scenario_2_firefox_std_ui.yml'>Firefox</a>]):::stdUI
    
    subgraph one-test
      I((Sample application </br> deployment using</br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/cypress/integration/scenarios/with_s3_and_external_registry.spec.ts'>ext registry / s3</a>)):::common
    end
    H --> one-test
    V --> one-test
    one-test --> J[Upload results in GH]:::common

    subgraph full-tests
      direction LR
      O((<a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/cypress/integration/unit_tests/applications.spec.ts'>applications</a>)):::common
      Q((<a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/cypress/integration/unit_tests/configurations.spec.ts'>configurations</a>)):::common
      R((<a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/cypress/integration/unit_tests/namespaces.spec.ts'>namespaces</a>)):::common
      O -.-> Q -.-> R
    end
    U --> full-tests
    G --> full-tests
    full-tests --> J
    S --> T[ <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml#L222-L229'>Delete k3s / Clean worker</a>]:::common

    %% Standalone UI part
     A --> B1{Embedded UI}:::stdUI
     B1 --> C1([Install </br> K3s - Helm - Epinio </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_std_ui_workflow.yml#L70-L89'>Makefile</a>]):::stdUI
     C1 --> F
     J --> D1([Uninstall Epinio </br> via </br> <a href='https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_std_ui_workflow.yml#L144-L149'>Makefile</a>]):::stdUI
     D1 --> T

     %% CSS definition
classDef stdUI fill:#256C35,stroke:#000000,stroke-width:2px;
classDef rancherUI fill:#406c93,stroke:#000000,stroke-width:2px;
classDef common fill:#823764,stroke:#000000,stroke-width:2px;

```
