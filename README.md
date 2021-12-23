
 # epinio-end-to-end-tests
 This repository contains all the files necessary to run Epinio end-to-end tests.
 
 In the cypress directory are stored the tests written using the [Cypress](https://www.cypress.io/) testing framework. 
 
 ## Running the tests
 
 It's expected that you have a Rancher instance installed and accessible by default.
 
 Some environment variables must be set before running the test, mainly to target your Rancher instance:
 
|  Variable name | Description | Default |
|--|--|--|
| `RANCHER_USER`  | Rancher dashboard user | X |
| `RANCHER_PASSWORD`  | Rancher dashboard password | X |
| `RANCHER_URL`  | Rancher dashboard URL | `http://localhost:8005` |
| `CLUSTER_NAME`  | Cluster where you want Epinio installed | `local` |
| `SYSTEM_DOMAIN`  | Domain name for Epinio | X |

`make e2e-tests`
