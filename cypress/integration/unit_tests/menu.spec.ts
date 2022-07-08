import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';
import '~/cypress/support/functions';

Cypress.config();
describe('Menu testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

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

// // Note: this test may need to be adapted with Rancher Dashboard
describe('Login with different users', () => {

  it('Check login with admin user', () => {
    const user_epinio = "admin"
    const pwd_epinio = "password"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it('Check login with regular user and simple password', () => {
    const user_epinio = "epinio"
    const pwd_epinio = "password"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it('Check login with regular user "user1" and password with special characters', () => {
    const user_epinio = "user1"
    const pwd_epinio = "Hell@World"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it('Check login with regular user "user2" and password with many special characters', () => {
    const user_epinio = "user2"
    const pwd_epinio = "Hell#@~%/=World"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });
})
