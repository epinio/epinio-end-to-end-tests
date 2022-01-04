import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';
import { Epinio } from '~/cypress/integration/util/epinio';

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

  it('Push an application into default namespace', () => {
    cy.createApp(appName);
    cy.checkApp(appName);
  });

  it('Delete the pushed application', () => {
    cy.deleteApp(appName);
  });
});
