import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
const epinio = new Epinio();
const topLevelMenu = new TopLevelMenu();

describe('First login on Rancher', () => {
  it('Log in and accept terms and conditions', () => {
    cy.runFirstConnexionTest();
  });
});

describe('Epinio installation testing with s3 and external registry configured', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
  });

  it('Add the Epinio helm repo', () => {
    topLevelMenu.clusters('local');
    cy.addHelmRepo({repoName: 'epinio-repo', repoUrl: 'https://epinio.github.io/helm-charts'});
  });

  it('Install Epinio', () => {
    topLevelMenu.clusters('local');
    cy.epinioInstall({s3: true, extRegistry: true});
  });

  it('Deploy an application to test external registry / s3', () => {
    epinio.accessEpinioMenu(Cypress.env('cluster'));
    cy.runApplicationsTest('multipleInstance');
  });

  it('Uninstall Epinio', () => {
    topLevelMenu.clusters('local');
    cy.epinioUninstall();
  });

  it('Remove the Epinio helm repo', () => {
    topLevelMenu.clusters('local');
    cy.removeHelmRepo();
  });
});
