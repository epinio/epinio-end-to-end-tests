import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Namespaces testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
  });

  it('Push and check an application into the created namespace', () => {
    cy.runNamespacesTest('newNamespace');
  });

  it('Create a Namespace from multiple services', () => {
    cy.runNamespacesTest('newNamespaceFromResource');
  });

});
