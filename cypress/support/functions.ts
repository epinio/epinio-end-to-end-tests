import 'cypress-file-upload';

// Generic functions

// Log into Rancher
Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password'), cacheSession = Cypress.env('cache_session')) => {
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
Cypress.Commands.add('clickMenu', (label) => {
  cy.get('.label').contains(label).click();
  cy.get('header').should('contain', label);
});

// Confirm the delete operation
Cypress.Commands.add('confirmDelete', (namespace?) => {
  if (namespace) {
    cy.get('#confirm').type(namespace);
  }
  cy.get('.card-actions').contains('Delete').click();
});

// Check the status of the running stage
Cypress.Commands.add('checkStageStatus', ({numIndex, timeout=6000, status='Success'}) => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter > .status > .badge';
  cy.get(getScope, {timeout:timeout}).contains(status).should('be.visible');
});

// Insert a value in a field *BUT* force a clear before!
Cypress.Commands.add('typeValue', (label, value) => {
  cy.byLabel(label).focus().clear().type(value);
});

// Application functions

// Create an Epinio application
Cypress.Commands.add('createApp', ({appName, archiveName, instanceNum=1, shouldBeDisabled=false}) => {
  cy.clickMenu('Applications');
  cy.clickButton('Create');
  cy.typeValue('Name', appName);
  cy.typeValue('Instances', instanceNum);

  // Only if we want to check that 'Next' button is disabled
  if (shouldBeDisabled) {
    cy.get('.btn').should('contain', 'Next').and('be.disabled');
    return;  // Of course, in that case the test is done if button is disabled
  }

  // Upload the test application
  cy.clickButton('Next');
  cy.get('input[type="file"]').attachFile({filePath: archiveName, encoding: 'base64', mimeType: 'application/octet-stream'});
  cy.clickButton('Next');

  // Start application creation
  cy.clickButton('Create');

  // Check that each steps are succesfully done
  cy.checkStageStatus({numIndex: 1});
  cy.checkStageStatus({numIndex: 2});
  cy.checkStageStatus({numIndex: 3, timeout: 240000});
  cy.checkStageStatus({numIndex: 4, timeout: 120000});

  // Application is created!
  cy.clickButton('Done');
});

// Ensure that the application is up and running
Cypress.Commands.add('checkApp', ({appName, namespace}) => {
  cy.clickMenu('Applications');

  // Go to application details
  cy.get('.col-link-detail').contains(appName).click();

  // Make sure the application is in running state
  cy.get('.primaryheader', {timeout: 5000}).should('contain', appName).and('contain', 'Running');

  // Make sure all application instances are up
  cy.get('.numbers', {timeout: 120000}).should('contain', '100%');

  // If needed. check that the correct namespace has been used
  if (namespace) {
    cy.contains('Namespace: ' + namespace).should('be.visible');
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
Cypress.Commands.add('deleteApp', ({appName, state='Running'}) => {
  cy.clickMenu('Applications');
  cy.contains(state + ' ' + appName).click('left');
  cy.clickButton('Delete');
  cy.confirmDelete();

  // Check that the application has effectively been destroyed
  cy.contains(appName, {timeout: 60000}).should('not.exist');
});

// Namespace functions

// Create an Epinio namespace
Cypress.Commands.add('createNamespace', (namespace) => {
  cy.clickMenu('Namespaces');
  cy.clickButton('Create');
  cy.typeValue('Name', namespace);
  cy.clickButton('Create');

  // Check that the namespace has effectively been created
  cy.contains(namespace).should('be.visible');
});

// Delete an Epinio namespace
Cypress.Commands.add('deleteNamespace', ({namespace, appName}) => {
  cy.clickMenu('Namespaces');
  cy.get('[data-title="Name"]').contains(namespace).click();
  cy.clickButton('Delete');
  cy.confirmDelete(namespace);

  // Check that the namespace has effectively been destroyed
  cy.contains(namespace, {timeout: 60000}).should('not.exist');

  // If needed, make sure the application is also deleted
  if (appName) {
    cy.clickMenu('Applications');
    cy.contains(appName).should('not.exist');
  }
});
