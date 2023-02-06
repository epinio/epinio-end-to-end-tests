## Experimental CI workflows

Besides the workflows running daily for e2e ([Rancher UI E2E tests and Standalone UI E2E tests](https://github.com/epinio/epinio-end-to-end-tests#rancher-ui-e2e-tests)) we have added the following customizeable workflows for UI ad-hoc testing:


### [Master Rancher UI EXPERIMENTAL workflow](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/master_rancher_ui_experimental_workflow.yml?query=branch%3Amain)
Taking the normal [Master Rancher UI workflow](https://github.com/epinio/epinio-end-to-end-tests/blob/main/.github/workflows/master_rancher_ui_workflow.yml) as base, this workflow allows to install epinio using specific branches with diferent epinio versions, rather than the latest one, run specific test spec and later uninstalls epinio and helm chart as in main version. It has the following dispatches on Github UI for further test customization:

- Branch for experimental epinio charts
- Browser where to run the tests
- Cypress Docker image to use
- Scenario to test
- Runner to use
- Extra options for Docker (mainly for running Firefox tests)

### [STD UI experimental template](https://github.com/epinio/epinio-end-to-end-tests/actions/workflows/master_std_ui_experimental.yml?query=branch%3Amain)
This workflow enables to run specific tests either by **tittle** or **tags** and allow to customize other options. This feature is particularly useful to save time by allowing to trigger single tests or specific group of tests properly marked (ie: by using tags). 
It uses a Cypress plugging called [cypress-grep](https://github.com/cypress-io/cypress/tree/develop/npm/grep)

Aside from this feature, we included also other dispatches on Github UI for further customization:

- k3s version 
- Browser where the test will run
- Cypress Docker image
- Cypress specs where to look at (default all)
- Grep by title
- Grep by tags
- Extra options for Docker (mainly for running Firefox tests)

####To run them locally use:

######To filter by test title use `--env grep "Test title"`. 

For example:
```
npx cypress run -C cypress.config --env grep "Push and check an application into the created namespace" cypress/e2e/unit_tests/namespaces.spec.ts.
```

Note: the title can be either at `describe` or `it` level.

#####To filter by tags use: `--env grepTags=tag` 
For example:
```
npx cypress run -C cypress.config.ts  --env grepTags="@smoke" cypress/e2e/unit_tests/*.spec.ts
``` 


Notes:
In the previous tag example no spec was specifically written to search across all specs
Tags need to be previously set on tests and do not need to be preceded by `@`; we just opt to for following a standard rule. 

For more details see description of plugin used previously mentioned.