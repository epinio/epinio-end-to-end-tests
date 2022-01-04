import 'cypress-file-upload';

// Generic functions

// Log into Rancher
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

// Search fields by label
Cypress.Commands.add('byLabel', (label) => {
  cy.get('.labeled-input').contains(label).siblings('input');
});

// Ensure that we are in the desired menu
Cypress.Commands.add('checkMenu', (name) => {
  cy.contains(name).click();
  cy.get('.m-0').should('contain', name);
});

// Check the status of the running stage
Cypress.Commands.add('checkStageStatus', (numIndex:string, timeout:number=6000, status?:string='Success') => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter';
  cy.get(getScope, {timeout:timeout}).should('contain', status).should('be.visible');
});

// Application functions

// Create an Epinio application
Cypress.Commands.add('createApp', (appName:string, archiveName:string) => {
  cy.checkMenu('Applications');
  cy.get('.outlet').contains('Create').click();
  cy.get('.input-string > .labeled-input').type(appName);
  cy.get('.controls-row').contains('Next').click();

  // Upload the test application
  cy.get('input[type="file"]').attachFile({filePath: archiveName, encoding: 'base64', mimeType: 'application/octet-stream'});
  cy.contains('Next').click();

  // Start application creation
  cy.get('.controls-row').contains('Create').click();

  // Check that each steps are succesfully done
  cy.checkStageStatus('1');
  cy.checkStageStatus('2');
  cy.checkStageStatus('3', 240000);
  cy.checkStageStatus('4', 120000);

  // Application is created!
  cy.get('.controls-row').contains('Done').click();
});

// Ensure that the application is up and running
Cypress.Commands.add('checkApp', (appName:string, nameSpace:string) => {
  cy.checkMenu('Applications');

  // Go to application details
  cy.get('.col-link-detail').should('contain', appName).click();

  // Make sure the application is in running state
  cy.get('.primaryheader', {timeout: 5000}).should('contain', appName).and('contain', 'Running');

  // Make sure all application instances are up
  cy.get('.numbers', {timeout: 60000}).should('contain', '100%');

  // If needed. check that the correct namespace has been used
  if (nameSpace) {
    cy.contains('Namespace: ' + nameSpace).should('be.visible');
  }

  // Check the application route
  var appRoute = 'https://' + appName + '.' + Cypress.env('system_domain');
  cy.contains(appRoute).should('be.visible');

  // Check that the application website is responding
  cy.contains(appRoute).invoke('attr', 'href').then(appLink => {
    cy.request({
      url: appLink,
    }).then(httpAnswer => {
      // Answer status code should be 200
      expect(httpAnswer.status).to.eq(200);
    });
  });
});

// Delete an Epinio application
Cypress.Commands.add('deleteApp', (appName:string, state:string='Running') => {
  cy.checkMenu('Applications');
  cy.contains(state + ' ' + appName).click('left');
  cy.contains('Delete').click();
  cy.get('.card-container').contains('Delete').click();
  cy.contains(appName, {timeout: 60000}).should('not.exist');
});

// Namespace functions

// Create an Epinio namespace
Cypress.Commands.add('createNamespace', (nameSpace:string) => {
  cy.checkMenu('Namespaces');
  cy.contains('Create', {timeout: 4000}).click();
  cy.get('.labeled-input.create').type(nameSpace);
  cy.get('.card-actions .role-primary').click();
  cy.contains(nameSpace).should('be.visible');
});

// Delete an Epinio namespace
Cypress.Commands.add('deleteNamespace', (nameSpace:string, appName:string) => {
  cy.checkMenu('Namespaces');
  cy.contains(nameSpace).click();
  cy.contains('Delete').click();
  cy.get('#confirm').type(nameSpace);
  cy.get('.card-container').contains('Delete').click();
  cy.contains(nameSpace, {timeout: 60000}).should('not.exist');

  // If needed, make sure the application is also deleted
  if (appName) {
    cy.contains('Applications').click();
    cy.contains(appName).should('not.exist');
  }
});
