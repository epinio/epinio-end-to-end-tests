import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Applications testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Push a 5 instances application into default namespace and check it', () => {
    cy.runAppTest('multipleInstance');
  });

  it('Push application with custom route into default namespace and check it', () => {
    cy.runAppTest('customRoute');
  });

  it('Push application with env vars into default namespace and check it', () => {
    cy.runAppTest('envVars');
  });

  it('Push a 5 instances application with custom route and env vars into default namespace and check it', () => {
    cy.runAppTest('allTests');
  });
});
