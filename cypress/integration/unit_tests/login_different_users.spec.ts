import '~/cypress/support/functions';

Cypress.config();
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

  it.skip('Check login with regular user "user1" and password with special characters', () => {
    const user_epinio = "user1"
    const pwd_epinio = "Hell@World"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it.skip('Check login with regular user "user2" and password with many special characters', () => {
    const user_epinio = "user2"
    const pwd_epinio = "Hell#@~%/=World"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });
})
