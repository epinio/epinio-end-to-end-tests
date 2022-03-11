import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
const epinio = new Epinio();
const topLevelMenu = new TopLevelMenu();

describe('First login on Rancher', () => {
  it('Log in and accept terms and conditions', () => {
    cy.runFirstConnectionTest();
  });
});

describe('Menu testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
  });

  it('Check Epinio menu', () => {
    // Epinio's icon should appear in the side menu
    epinio.epinioIcon().should('exist');

    // Click on the Epinio's logo as well as your Epinio instance
    epinio.accessEpinioMenu(Cypress.env('cluster'));

    // Check Epinio's side menu
    epinio.checkEpinioNav();
  });
});

describe('Applications testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Push basic application and check we can restart and rebuild it', () => {
    cy.runApplicationsTest('restartAndRebuild');
  });

  it('Push a 5 instances application with container image into default namespace and check it', () => {
    cy.runApplicationsTest('multipleInstanceAndContainer');
  });

  it('Push application with custom route into default namespace and check it', () => {
    cy.runApplicationsTest('customRoute');
  });

  it('Push application with env vars and Git URL into default namespace and check it', () => {
    cy.runApplicationsTest('envVarsAndGitUrl');
  });

  it('Push a 5 instances application with mixed options into default namespace and check it', () => {
    cy.runApplicationsTest('allTests');
  });
});

describe('Configurations testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Create an application with a configuration, unbind the configuration and delete all', () => {
    cy.runConfigurationsTest('newAppWithConfiguration');
  });

  it('Bind a created configuration to an existing application and delete all', () => {
    cy.runConfigurationsTest('bindConfigurationOnApp');
  });
});

describe('Namespaces testing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Push and check an application into the created namespace', () => {
    cy.runNamespacesTest('newNamespace');
  });

  it('Try to push an application without any namespace', () => {
    cy.runNamespacesTest('withoutNamespace');
  });
});
