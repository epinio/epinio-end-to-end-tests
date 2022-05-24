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

  it('Push an app from manifest and download manifest from ui', () => {
    // Create config, app and check it is ok
    cy.createConfiguration({configurationName: 'newappwithconfiguration15'});
    cy.createApp({appName: 'testapp', archiveName: 'sample-app.tar.gz', instanceNum: 2, configurationName: 'newappwithconfiguration15', sourceType: 'Archive'});
    cy.checkApp({appName: 'testapp', checkConfiguration: true});

      // Redirecting to Applications 
    cy.get('span > i.icon-folder').eq(0).click()

    // Download the manifest
    cy.get('span > a').eq(0).contains('testapp').should('be.visible')
    cy.get('span > a').eq(2).contains('newappwithconfiguration15').should('be.visible')
    cy.get('button.role-multi-action').click()
    cy.contains('li', 'Download Manifest').click( {force: true} ); 

    // Find manifest in download folder
    // Verify name of stdout matches expected one
    cy.exec('find "cypress/downloads/" -name "workspace-testapp*"').its('stdout')
    .should('contain', 'testapp')

    // Upload downloaded file
    // cy.createApp({appName: 'testapp2', archiveName: 'downloads/workspace-testapp', sourceType: 'Archive'});

  });

});
