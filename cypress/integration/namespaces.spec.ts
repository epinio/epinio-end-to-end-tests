import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Namespace testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Push and check an application into the created namespace', () => {
    cy.runNamespaceTest('newNamespace');
  });

  it('Try to push an application without any namespace', () => {
    cy.runNamespaceTest('withoutNamespace');
  });
});