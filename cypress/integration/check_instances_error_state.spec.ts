import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';

Cypress.config();
describe('No Epinio instances testing', () => {
  const topLevelMenu = new TopLevelMenu();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
  });

  it('checks that there is an Epinio instance in error state', () => {
    cy.get('.title').should('contain', 'Welcome');
    cy.get('.menu').click();
    cy.contains('Epinio').click();
    cy.get('.badge-state').should('contain', 'Error');
  });
});
