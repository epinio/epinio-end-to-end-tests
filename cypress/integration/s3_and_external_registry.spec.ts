import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Epinio installation testing with s3 and external registry configured', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
  });

  it('Add the Epinio helm repo', () => {
    cy.get('.clusters').contains('local').click()
    cy.addHelmRepo({repoName: 'epinio-repo', repoUrl: 'https://epinio.github.io/helm-charts'});
  });

  it('Install Epinio', () => {
    cy.get('.clusters').contains('local').click()
    cy.epinioInstall({s3: true, extRegistry: true});
  });

  it('Deploy an application to test external registry / s3', () => {
    epinio.accessEpinioMenu(Cypress.env('cluster'));
    cy.runAppTest('multipleInstance');
  });

  it('Uninstall Epinio', () => {
    cy.get('.clusters').contains('local').click()
    cy.epinioUninstall();
  });

  it('Remove the Epinio helm repo', () => {
    cy.get('.clusters').contains('local').click()
    cy.removeHelmRepo();
  });
});
