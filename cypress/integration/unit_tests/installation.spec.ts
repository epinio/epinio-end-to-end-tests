import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Epinio installation testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    cy.get('.clusters').contains(Cypress.env('cluster')).click()
  });

  it('Add the Epinio helm repo', () => {
    cy.addHelmRepo({repoName: 'epinio-repo', repoUrl: 'https://github.com/epinio/helm-charts', repoType: 'git'});
  });

  it('Install Epinio', () => {
    // Boolean must be forced to false otherwise code is failing
    cy.epinioInstall({s3: false, extRegistry: false});
  });
});
