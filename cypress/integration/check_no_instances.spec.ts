import { TopLevelMenu } from '~/cypress/integration/util/toplevelmenu';

Cypress.config();
describe('No Epinio instances testing', () => {
  const topLevelMenu = new TopLevelMenu();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
  });

  it('checks that there is no Epinio instances', () => {
    cy.get('.title').contains('Welcome');
    cy.get('.menu').click();
    cy.contains('Epinio').click();
    cy.get('.root').contains('No instances of Epinio were found');
  });
});
