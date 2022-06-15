import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';
import '~/cypress/support/functions';

Cypress.config();
const epinio = new Epinio();
const topLevelMenu = new TopLevelMenu();

if (Cypress.env('ui') == "rancher") {
  describe('First login on Rancher', () => {
    it('Log in and accept terms and conditions', () => {
      cy.runFirstConnectionTest();
    });
  });
}

describe('Menu testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('Check Epinio menu', () => {
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();

      // Epinio's icon should appear in the side menu
      epinio.epinioIcon().should('exist');

      // Click on the Epinio's logo as well as your Epinio instance 
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }

    // Check Epinio's side menu
    epinio.checkEpinioNav();
  });

  it('Verify Welcome Screen without Namespaces', () => {
    cy.clickEpinioMenu('Namespaces');
    // Deletes all namespaces if detected
    cy.get("body").then(($body) => {
      if ($body.text().includes('Delete')) {
        cy.deleteAllNamespaces()
      }
     }
    )
    cy.clickEpinioMenu('Applications');
    cy.get('h1').contains('Welcome to Epinio', { timeout: 4000 }).should('be.visible')
    cy.createNamespace('workspace')
  }
)});

describe('Applications testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
    // Executes application cleansing of "testapp" and "configuration01"
    // Destroy application "testapp" and verify
    // Could be a function later?
    cy.clickEpinioMenu('Applications');
    cy.get('body').then(($body) => {
      if ($body.text().includes('testapp')) {
        cy.get('[width="30"] > .checkbox-outer-container').click();
        cy.clickButton('Delete');
        cy.confirmDelete();
        cy.contains('testapp', {timeout: 60000}).should('not.exist');
      };
    });

    // Destroy configuration "configuration01" and verify
    cy.clickEpinioMenu('Configurations');
    cy.get('body').then(($body) => {
      if ($body.text().includes('configuration01')) {
        cy.get('[width="30"] > .checkbox-outer-container').click();
        cy.clickButton('Delete');
        cy.confirmDelete();
        cy.contains('configurations01', {timeout: 60000}).should('not.exist');
      };
    });
  });

  it('Push basic application and check we can restart and rebuild it', () => {
    cy.runApplicationsTest('restartAndRebuild');
  });

  it('Push a 5 instances application with container image into default namespace and check it', () => {
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

describe('Configurations testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
  });

  it('Create an application with a configuration, unbind the configuration and delete all', () => {
    cy.runConfigurationsTest('newAppWithConfiguration');
  });

  it('Bind a created configuration to an existing application, edit configuration and delete all', () => {
    cy.runConfigurationsTest('bindConfigurationOnApp');
  });
});

describe('Namespaces testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();
      epinio.accessEpinioMenu(Cypress.env('cluster'));
    }
  });

  it('Push and check an application into the created namespace', () => {
    cy.runNamespacesTest('newNamespace');
  });

  it.skip('Try to push an application without any namespace', () => {
    cy.runNamespacesTest('withoutNamespace');
  });
});
