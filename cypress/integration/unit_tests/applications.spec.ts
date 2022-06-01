import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Applications testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
    // Executes application cleansing of "testapp" and "configuration01"
    // If the app does not exist it will not fail
    // Destroy application "testapp" and verify
    cy.exec('epinio app delete testapp', { failOnNonZeroExit: false });
    cy.clickEpinioMenu('Applications');
    cy.contains('testapp', { timeout: 60000 }).should('not.exist');

    // Destroy configuration "configuration01" and verify
    cy.exec('epinio configuration delete configuration01', { failOnNonZeroExit: false });
    cy.clickEpinioMenu('Configurations');
    cy.contains('configuration01', { timeout: 60000 }).should('not.exist');
  });

  it('Push basic application and check we can restart and rebuild it', () => {
    cy.runApplicationsTest('restartAndRebuild');
  });

  it('Push a 5 instances application with a container image into default namespace and check it', () => {
    cy.runApplicationsTest('multipleInstanceAndContainer');
  });

  it('Push application with custom route into default namespace and check app log/shell features', () => {
    cy.runApplicationsTest('customRoute');
  });

  it('Push application with env vars and Git URL into default namespace and check it', () => {
    cy.runApplicationsTest('envVarsAndGitUrl');
  });

  it('Push a 5 instances application with mixed options into default namespace and check it', () => {
    cy.runApplicationsTest('allTests');
  });

  it('Download manifest from ui and push an app from it',  () => {
    cy.runApplicationsTest('downloadManifestAndPushApp');
  });
});
