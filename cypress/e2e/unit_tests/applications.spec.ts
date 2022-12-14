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
    // Delete all Apps and Configurations that may exist
    cy.deleteAll('Applications')
    cy.deleteAll('Configurations')
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

  it('Create mysql service, bind it to a Wordpress app and push it',  () => {
    cy.runApplicationsTest('serviceMysqlBindWordpressPushApp');
  });

  it('Create postgress service, bind/unbind app from service page',  () => {
    cy.runApplicationsTest('serviceBindUnbindFromServicePage');
  });
  // Remove skip when this is fixed: https://github.com/epinio/ui/issues/160
  it.skip('Push application with Github Source type and env vars and check it',  () => {
    cy.runApplicationsTest('gitHubAndEnvVar');
  });

});
