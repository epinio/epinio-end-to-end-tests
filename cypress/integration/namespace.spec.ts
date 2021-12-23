import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';
import { Epinio } from '~/cypress/integration/util/epinio';

Cypress.config();
describe('Namespace testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
  const app_name = 'testapp';

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
    cy.contains('Namespaces').click();
    cy.get('.m-0').should('contain', 'Namespaces');
    cy.contains('Create', {timeout: 4000}).click();
    cy.get('.labeled-input.create').type('mynamespace');
    cy.get('.card-actions .role-primary').click();
    cy.contains('mynamespace').should('be.visible');
  });

  it('Push an app into mynamespace', () => {
    cy.createApp('testapp');
    cy.checkApp('testapp');
  });

  it('Delete namespace', () => {
    cy.contains('Namespaces').click();
    cy.get('.m-0').should('contain', 'Namespaces');
    cy.contains('mynamespace').click();
    cy.contains('Delete').click();
    cy.get('#confirm').type('mynamespace');
    cy.get('.card-container').contains('Delete').click();
    cy.contains('mynamespace', {timeout: 60000}).should('not.exist');
    // Make sure the app is also deleted
    cy.contains('Applications').click();
    cy.contains(app_name).should('not.exist');
  });
});
