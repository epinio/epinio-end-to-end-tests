import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Application testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
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

  it('Push and check an application into default namespace', () => {
    cy.createApp(appName, 'sample-app.tar.gz');
    cy.checkApp(appName);
  });

  it('Delete the pushed application', () => {
    cy.deleteApp(appName);
  });
});
