import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Application testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();
  const appName = 'testapp';
  const customRoute = 'custom-route-' + appName + '.' + Cypress.env('system_domain');

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    epinio.accessEpinioMenu(Cypress.env('cluster'));
  });

  it('Push a 5 instances application into default namespace and check it', () => {
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz', instanceNum: 5});
    cy.checkApp({appName: appName});
    cy.deleteApp({appName: appName});
  });

  it('Push application with custom route into default namespace and check it', () => {
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz', route: customRoute});
    cy.checkApp({appName: appName, route: customRoute});
    cy.deleteApp({appName: appName});
  });

  it('Push application with env vars into default namespace and check it', () => {
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz', addVar: true});
    cy.checkApp({appName: appName, checkVar: true});
    cy.deleteApp({appName: appName});
  });

  it('Push a 5 instances application with custom route and env vars into default namespace and check it', () => {
    cy.createApp({appName: appName, archiveName: 'sample-app.tar.gz', instanceNum: 5, addVar: true, route: customRoute});
    cy.checkApp({appName: appName, checkVar: true, route: customRoute});
    cy.deleteApp({appName: appName});
  });
});
