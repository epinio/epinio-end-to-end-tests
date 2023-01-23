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

  it('Push and check an application into the created namespace', { tags: '@ns-1' }, () => {
    cy.runNamespacesTest('newNamespace');
  });

  it('Test namespace filter with 3 namespaces, 2 apps and 2 configurations', { tags: '@ns-2' }, () => {
    cy.runNamespacesTest('namespaceFilter');
  });
});
