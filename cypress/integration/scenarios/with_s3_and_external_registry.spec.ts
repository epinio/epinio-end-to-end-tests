import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';
import '~/cypress/support/functions';

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

  it('Verify Welcome Screen without Namespaces', () => {
    cy.clickEpinioMenu('Namespaces');
    // Deletes all namespaces if detected
    cy.get("body").then(($body) => {
      if ($body.text().includes('Delete')) {
        cy.deleteAllNamespaces()
      }
     }
    )
    cy.clickEpinioMenu('Applications');
    cy.get('h1').contains('Welcome to Epinio').should('be.visible')
    // Verify creating namespace from Get Started button works
    cy.get('a.btn.role-secondary').contains('Get started').click()
    cy.clickButton('Create');
    const defaultNamespace = 'workspace'
    cy.typeValue({label: 'Name', value: defaultNamespace});
    cy.clickButton('Create');
    // Check that the namespace has effectively been created
    cy.contains(defaultNamespace).should('be.visible');
  }
)});

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
