import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Namespace testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
  const nameSpace = 'mynamespace';
  const appName = 'testapp';

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.epinioIcon().should('exist');
    epinio.accessEpinioMenu(Cypress.env('cluster'));
    // Make sure the Epinio nav menu is correct
    epinio.checkEpinioNav();
  });
  
  it('Create namespace', () => {
    cy.createNamespace(nameSpace);
  });

  it('Push and check an application into the created namespace', () => {
    cy.createApp(appName, 'sample-app.tar.gz');
    cy.checkApp(appName, nameSpace);
  });

  it('Delete namespace', () => {
    cy.deleteNamespace(nameSpace, appName);
  });
});
