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
    if (Cypress.env('experimental_chart_branch') != null) {
      cy.addHelmRepo({ repoName: 'epinio-experimental', repoUrl: 'https://github.com/epinio/charts.git', repoType: 'git', branchName: Cypress.env('experimental_chart_branch') });
    }
    else {
      cy.addHelmRepo({ repoName: 'epinio-repo', repoUrl: 'https://github.com/epinio/helm-charts', repoType: 'git' });
    }
  });

  it('Install Epinio with s3gw, check ingress over URL and uninstall it', () => {
    cy.epinioInstall({ s3: false, s3gw: true, extRegistry: false });
    cy.checkEpinioInstallationRancher();
    cy.visit('/c/local/explorer#cluster-events');
    cy.epinioUninstall();
  });

  it('Install Epinio', () => {
    if (Cypress.env('experimental_chart_branch') != null) {
      cy.epinioInstall({ s3: false, extRegistry: false, namespace: 'None' });
    }
    else {
      // Boolean must be forced to false otherwise code is failing
      cy.epinioInstall({ s3: false, extRegistry: false });
    }
  });

  it('Verify Epinio over ingress URL', () => {
    cy.checkEpinioInstallationRancher();
  });
  
});
