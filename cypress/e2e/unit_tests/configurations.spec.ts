import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe.skip('Configuration testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }

    // Delete all Apps and Configurations that may exist
    cy.deleteAll('Applications')
    cy.deleteAll('Configurations')
  });

  it('Create an application with a configuration, unbind the configuration and delete all', () => {
    cy.runConfigurationsTest('newAppWithConfiguration');
  });

  it('Bind a created configuration to an existing application, edit configuration and delete all', () => {
    cy.runConfigurationsTest('bindConfigurationOnApp');
  });
});
