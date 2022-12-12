### Rancher UI E2E tests
[![Scenario 1 Chrome](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_rancher_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_1_chrome_rancher_ui.yml?query=branch%3Amain)
[![Scenario 2 Firefox](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_rancher_ui.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/scenario_2_firefox_rancher_ui.yml?query=branch%3Amain)

### Standalone UI E2E tests
[![Standalone UI Chrome](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/std_ui_latest_chrome.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/std_ui_latest_chrome.yml?query=branch%3Amain)
[![Standalone UI Firefox](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/std_ui_latest_firefox.yml/badge.svg?branch=main)](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/std_ui_latest_firefox.yml?query=branch%3Amain)

# epinio-end-to-end-tests

This repository contains all the files necessary to run Epinio end-to-end tests.</br>

The `cypress` directory contains the tests written using the
[Cypress](https://www.cypress.io/) testing framework.</br>

GitHub Actions CI is used to execute the tests every night.
Currently two scenarios are tested.

## Contents

- [Epinio-end-to-end-tests](#epinio-end-to-end-tests)
  - [Contents](#contents)
  - [Rancher UI and Epinio UI](#rancher-and-epinio-ui)
  - [Scenario 1 - Using Chrome](#scenario-1---using-chrome)
  - [Scenario 2 - Using Firefox](#scenario-2---using-firefox)
  - [Process explained in one chart](#process-explained-in-one-chart)

## Rancher UI and Epinio UI

The E2E tests are executed against both Rancher's UI and Epinio's UI.
Note that they have differences between them.</br>

Epinio is installed via Rancher when testing it against Rancher's UI.
For testing against its own UI, it is installed via its own Helm Chart instead.</br>

The tests use the main branches of [Epinio](https://github.com/epinio/epinio)
and [Epinio's Helm Chart](https://github.com/epinio/helm-charts).

## How To Quick-Start a development environment using k3d

:warning: __Attention__, this was only tested on Linux so far.

### Epinio UI

1. Clone the repository

```bash
git clone https://github.com/epinio/epinio-end-to-end-tests.git
```

2. Check that all dependencies are installed:

```bash
make check-dependencies
```

3. Create the cluster

```bash
make prepare-cluster
```

   Check the output and export the IP as the IP_ADDR variable (`export IP_ADDR=<IP>`).

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

In this scenario, Epinio is deployed in Rancher with default options and a basic UI test is then
performed using [menu.spec.ts](./cypress/integration/unit_tests/menu.spec.ts).
The underlying browser is Chrome.

<!-- You can check all the things we test directly in the [file](./cypress/integration/scenarios/with_default_options.spec.ts). -->

## Scenario 2 - Using Firefox

The second scenario is the same as the first, except it uses Firefox as the browser. </br>

TODO: Get back installation with S3 and external registry configuration within rancher installation.
Ref [Issue#236](https://github.com/epinio/epinio-end-to-end-tests/issues/236)

<!-- Second scenario tests Epinio installation with S3 and external registry configured. </br>
Unlike the first scenario, we only play a small bunch of [tests](./cypress/integration/scenarios/with_s3_and_external_registry.spec.ts). -->

## Process explained in one chart

```mermaid
flowchart TB;
    A{{Color Legend}}
    A --- B([Rancher UI Parts])
    A --- C([Common Parts])
    A --- D([Embedded UI Parts])
    style B fill:#7998b3,stroke:#000000,stroke-width:2px;
    style C fill:#b487a2,stroke:#000000,stroke-width:2px;
    style D fill:#50895d,stroke:#000000,stroke-width:2px;
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
classDef rancherUI fill:#7998b3,stroke:#000000,stroke-width:2px;
classDef common    fill:#b487a2,stroke:#000000,stroke-width:2px;
classDef stdUI     fill:#50895d,stroke:#000000,stroke-width:2px;
```
