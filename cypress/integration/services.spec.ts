import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Services testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz';
  const service = 'service01';

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Create a new service', () => {
    cy.createService({serviceName: service});
  });

  it('Create an application with the newly created service', () => {
    cy.createApp({appName: appName, archiveName: archive, serviceName: service});
    cy.checkApp({appName: appName, checkService: true});
  });

  it('Unbind and delete the created service', () => {
    cy.deleteService({serviceName: service});
    cy.checkApp({appName: appName});
  });

  it('Create another new service', () => {
    cy.createService({serviceName: anotherService});
  });

  it('Bind the created service to the application', () => {
    cy.bindService({appName: appName, serviceName: anotherService});
    cy.checkApp({appName: appName, checkService: true});
  });

  it('Delete the application and the service', () => {
    cy.deleteApp({appName: appName});
    cy.deleteService({serviceName: anotherService});
  });
});
