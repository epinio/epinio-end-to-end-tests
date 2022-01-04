import 'cypress-file-upload';

// Generic functions

Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password'), cacheSession = false) => {
  const login = () => {
    cy.intercept('POST', '/v3-public/localProviders/local*').as('loginReq');
    cy.visit('/auth/login');

    cy.byLabel('Username')
      .focus()
      .type(username);

    cy.byLabel('Password')
      .focus()
      .type(password);

    cy.get('button').click();
    cy.wait('@loginReq');
  };

  if (cacheSession) {
    cy.session([username, password], login);
  } else {
    login();
  }
});

Cypress.Commands.add('byLabel', (label) => {
  return cy.get('.labeled-input').contains(label).siblings('input');
});

Cypress.Commands.add('checkMenu', (name) => {
  cy.contains(name).click();
  return cy.get('.m-0').should('contain', name);
});

Cypress.Commands.add('checkSuccess', (numIndex:string, timeout:number=4000) => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter';
  cy.get(getScope, {timeout:timeout}).should('contain', 'Success').should('be.visible');
});

// Application functions

Cypress.Commands.add('createApp', (appName:string) => {
  cy.get('.nav').contains('Applications').click();
  cy.get('.outlet').should('contain', 'Applications');
  cy.get('.outlet').contains('Create').click();
  cy.get('.input-string > .labeled-input').type(appName);
  cy.get('.controls-row').contains('Next').click();
  // Upload the test app
  cy.get('input[type="file"]').attachFile({filePath: 'sample-app.tar.gz', encoding: 'base64', mimeType: 'application/octet-stream'});
  cy.contains('Next').click();
  cy.get('.controls-row').contains('Create').click();
});

Cypress.Commands.add('checkApp', (appName:string, nameSpace:string) => {
  cy.checkSuccess('1');
  cy.checkSuccess('2');
  cy.checkSuccess('3', 240000);
  cy.checkSuccess('4');
  cy.get('.controls-row').contains('Done').click();
  // Make sure the app is in running state
  cy.get('.primaryheader', {timeout: 5000}).should('contain', appName).and('contain', 'Running');
  // Make sure all app instances are up
  cy.get('.numbers', {timeout: 60000}).should('contain', '100%');

  if (nameSpace) {
    cy.contains('Namespace: ' + nameSpace).should('be.visible');
  }
  cy.contains('https://' + appName + '.' + Cypress.env('system_domain')).should('be.visible');
});

Cypress.Commands.add('deleteApp', (appName:string, state:string) => {
  cy.checkMenu('Applications');
  cy.contains('Running ' + appName).click('left');
  cy.contains('Delete').click();
  cy.get('.card-container').contains('Delete').click();
  cy.contains(appName, {timeout: 60000}).should('not.exist');
});

// Namespace functions

Cypress.Commands.add('createNamespace', (nameSpace:string) => {
  cy.checkMenu('Namespaces');
  cy.contains('Create', {timeout: 4000}).click();
  cy.get('.labeled-input.create').type(nameSpace);
  cy.get('.card-actions .role-primary').click();
  cy.contains(nameSpace).should('be.visible');
});

Cypress.Commands.add('deleteNamespace', (nameSpace:string, appName:string) => {
  cy.checkMenu('Namespaces');
  cy.contains(nameSpace).click();
  cy.contains('Delete').click();
  cy.get('#confirm').type(nameSpace);
  cy.get('.card-container').contains('Delete').click();
  cy.contains(nameSpace, {timeout: 60000}).should('not.exist');

  // If needed, make sure the app is also deleted
  if (appName) {
    cy.contains('Applications').click();
    cy.contains(appName).should('not.exist');
  }
});
