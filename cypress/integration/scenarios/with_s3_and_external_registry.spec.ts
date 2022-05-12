import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
const epinio = new Epinio();
const topLevelMenu = new TopLevelMenu();

if (Cypress.env('ui') == "rancher") {
  describe('First login on Rancher', () => {
    it('Log in and accept terms and conditions', () => {
    cy.runFirstConnectionTest();
    });
  });
}

describe('Menu testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });
  
  it('Check Epinio menu', () => {
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();

      // Epinio's icon should appear in the side menu
      epinio.epinioIcon().should('exist');

      // Click on the Epinio's logo as well as your Epinio instance 
      epinio.accessEpinioMenu(Cypress.env('cluster')); 
    }

    // Check Epinio's side menu
    epinio.checkEpinioNav();
  });
});

describe('Applications testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
  });

  it('Deploy an application to test external registry / s3', () => {
    cy.runApplicationsTest('multipleInstanceAndContainer');
  });
});
