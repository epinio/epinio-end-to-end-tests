import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Configuration testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }

    // Executes application cleansing of "testapp" and "configuration01"
    // Destroy application "testapp" and verify
    // Could be a function later?
    cy.clickEpinioMenu('Applications');
    cy.get('body').then(($body) => {
      if ($body.text().includes('testapp')) {
        cy.get('[width="30"] > .checkbox-outer-container').click();
        cy.clickButton('Delete');
        cy.confirmDelete();
        cy.contains('testapp', {timeout: 60000}).should('not.exist');
      };
    });

    // Destroy configuration "configuration01" and verify
    cy.clickEpinioMenu('Configurations');
    cy.get('body').then(($body) => {
      if ($body.text().includes('configuration01')) {
        cy.get('[width="30"] > .checkbox-outer-container').click();
        cy.clickButton('Delete');
        cy.confirmDelete();
        cy.contains('configurations01', {timeout: 60000}).should('not.exist');
      };
    });
  });

  it('Create an application with a configuration, unbind the configuration and delete all', () => {
    cy.runConfigurationsTest('newAppWithConfiguration');
  });

  it('Bind a created configuration to an existing application, edit configuration and delete all', () => {
    cy.runConfigurationsTest('bindConfigurationOnApp');
  });
});
