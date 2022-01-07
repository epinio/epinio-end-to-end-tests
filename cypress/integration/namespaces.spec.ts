import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Namespace testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
  const defaultNamespace = 'workspace';
  const namespace = 'mynamespace';
  const appName = 'testapp';

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });
  
  it('Create namespace', () => {
    cy.createNamespace(namespace);
  });

  it('Push and check an application into the created namespace', () => {
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz'});
    cy.checkApp({appName: appName, namespace: namespace});
  });

  it('Delete namespace', () => {
    cy.deleteNamespace({namespace: namespace, appName: appName});
  });

  it('Try to push an application without any namespace', () => {
    // Delete default namespace
    cy.deleteNamespace({namespace: defaultNamespace});

    // Try to create the application
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz', shouldBeDisabled: true});

    // Re-create default namespace
    cy.createNamespace(defaultNamespace);
  });
});
