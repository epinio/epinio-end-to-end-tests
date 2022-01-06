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

// Search button by label
Cypress.Commands.add('clickButton', (label) => {
  cy.get('.btn').contains(label).click();
});

// Ensure that we are in the desired menu
Cypress.Commands.add('clickMenu', (name) => {
  cy.get('.label').contains(name).click();
  cy.get('header').should('contain', name);
});

Cypress.Commands.add('confirmDelete', (nameSpace?:string) => {
  if (nameSpace) {
    cy.get('#confirm').type(nameSpace);
  }
  cy.get('.card-actions').contains('Delete').click();
});

// Check the status of the running stage
Cypress.Commands.add('checkStageStatus', (numIndex, timeout:number=6000, status?:string='Success') => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter > .status > .badge';
  cy.get(getScope, {timeout:timeout}).contains(status).should('be.visible');
});

// Insert a value in a field *BUT* force a clear before!
Cypress.Commands.add('typeValue', (label, value) => {
  cy.byLabel(label).focus().clear().type(value);
});

// Application functions

// Create an Epinio application
Cypress.Commands.add('createApp', (appName:string, archiveName:string, instanceNum?:number=1) => {
  cy.clickMenu('Applications');
  cy.clickButton('Create');
  cy.typeValue('Name', appName);
  cy.typeValue('Instances', instanceNum);
  cy.clickButton('Next');

  // Upload the test application
  cy.get('input[type="file"]').attachFile({filePath: archiveName, encoding: 'base64', mimeType: 'application/octet-stream'});
  cy.clickButton('Next');

  // Start application creation
  cy.clickButton('Create');

  // Check that each steps are succesfully done
  cy.checkStageStatus(1);
  cy.checkStageStatus(2);
  cy.checkStageStatus(3, 240000);
  cy.checkStageStatus(4, 120000);

  // Application is created!
  cy.clickButton('Done');
});

// Ensure that the application is up and running
Cypress.Commands.add('checkApp', (appName:string, nameSpace:string) => {
  cy.clickMenu('Applications');

  // Go to application details
  cy.get('.col-link-detail').contains(appName).click();

  // Make sure the application is in running state
  cy.get('.primaryheader', {timeout: 5000}).should('contain', appName).and('contain', 'Running');

  // Make sure all application instances are up
  cy.get('.numbers', {timeout: 120000}).should('contain', '100%');

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
  cy.clickMenu('Applications');
  cy.contains(state + ' ' + appName).click('left');
  cy.clickButton('Delete');
  cy.confirmDelete();

  // Check that the application has effectively been destroyed
  cy.contains(appName, {timeout: 60000}).should('not.exist');
});

// Namespace functions

// Create an Epinio namespace
Cypress.Commands.add('createNamespace', (nameSpace:string) => {
  cy.clickMenu('Namespaces');
  cy.clickButton('Create');
  cy.typeValue('Name', nameSpace);
  cy.clickButton('Create');

  // Check that the namespace has effectively been created
  cy.contains(nameSpace).should('be.visible');
});

// Delete an Epinio namespace
Cypress.Commands.add('deleteNamespace', (nameSpace:string, appName?:string) => {
  cy.clickMenu('Namespaces');
  cy.get('[data-title="Name"]').contains(nameSpace).click();
  cy.clickButton('Delete');
  cy.confirmDelete(nameSpace);

  // Check that the namespace has effectively been destroyed
  cy.contains(nameSpace, {timeout: 60000}).should('not.exist');

  // If needed, make sure the application is also deleted
  if (appName) {
    cy.clickMenu('Applications');
    cy.contains(appName).should('not.exist');
  }
});
