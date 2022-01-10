import './functions';

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string, cacheSession?: boolean): Chainable<Element>;
      byLabel(label: string,): Chainable<Element>;
      clickButton(label: string,): Chainable<Element>;
      clickMenu(label: string,): Chainable<Element>;
      confirmDelete(namespace?: string,): Chainable<Element>;
      checkStageStatus(numIndex: number, timeout?: number, status?: string,): Chainable<Element>;
      typeValue(label: string, value: string, noLabel?: boolean,): Chainable<Element>;
      createApp(appName: string, archiveName: string, route?: string, addVar?:boolean, instanceNum?: number, shouldBeDisabled?: boolean,): Chainable<Element>;
      checkApp(appName: string, namespace?: string, route?: string, checkVar?: boolean): Chainable<Element>;
      deleteApp(appName: string, state?: string,): Chainable<Element>;
      createNamespace(namespace: string,): Chainable<Element>;
      deleteNamespace(namespace: string, appName?: string,): Chainable<Element>;
      addHelmRepo(repoName: string, repoUrl: string,): Chainable<Element>;
      epinioInstall(): Chainable<Element>;
    }
}}

// TODO handle redirection errors better?
// we see a lot of 'error nagivation cancelled' uncaught exceptions that don't actually break anything; ignore them here
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('navigation guard')) {
    return false;
  }
});

require('cypress-dark');
