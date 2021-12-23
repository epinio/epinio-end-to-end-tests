import 'cypress-file-upload';

Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password'), cacheSession = true) => {
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
  return
});

Cypress.Commands.add('checkApp', (appName:string) => {
  cy.get(':nth-child(1) > .col-badge-state-formatter').should('contain', 'Success').should('be.visible');
  cy.get(':nth-child(2) > .col-badge-state-formatter').should('contain', 'Success').should('be.visible');
  cy.get(':nth-child(3) > .col-badge-state-formatter', {timeout:120000}).should('contain', 'Success').should('be.visible');
  cy.get(':nth-child(4) > .col-badge-state-formatter', {timeout:120000}).should('contain', 'Success').should('be.visible');
  cy.get('.controls-row').contains('Done').click();
  // Make sure the app is in running state
  cy.get('.primaryheader', {timeout: 5000}).should('contain', appName).and('contain', 'Running');
  // Make sure all app instances are up
  cy.get('.numbers', {timeout: 60000}).should('contain', '100%');
  cy.contains('Namespace: mynamespace').should('be.visible');
  var prefix_url = "https://";
  var app_url = prefix_url.concat(appName, ".", Cypress.env('system_domain'));
  cy.contains(app_url).should('be.visible');
  return
});
