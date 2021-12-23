import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';
import { Epinio } from '~/cypress/integration/util/epinio';

Cypress.config();
describe('Menu testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
  });
  
  it('Check Epinio menu', () => {
    // Epinio's icon should appear in the side menu
    epinio.epinioIcon().should('exist');
    // Click on the Epinio's logo as well as your Epinio instance 
    epinio.accessEpinioMenu(Cypress.env('cluster'));
    // Check Epinio's side menu
    epinio.checkEpinioNav();
  });
});
