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
  cy.get(getScope, {timeout: timeout}).contains(status).should('be.visible');
});

// Insert a value in a field *BUT* force a clear before!
Cypress.Commands.add('typeValue', ({label, value, noLabel=false}) => {
  if (noLabel) {
    cy.get(label).focus().clear().type(value);
  } else {
    cy.byLabel(label).focus().clear().type(value);
  }
});

// Application functions

// Create an Epinio application
Cypress.Commands.add('createApp', ({appName, archiveName, route, addVar=false, instanceNum=1, shouldBeDisabled=false}) => {
  cy.clickMenu('Applications');
  cy.clickButton('Create');
  cy.typeValue({label: 'Name', value: appName});

  // Only if we want to check that 'Next' button is disabled
  // This could happen only if there is no namespace defined
  if (shouldBeDisabled) {
    cy.get('.btn').should('contain', 'Next').and('be.disabled');
    return;  // Of course, in that case the test is done if button is disabled
  }

  // Change default route if needed
  if (route) {
    cy.get('.btn').contains('Add').click();
    cy.typeValue({label: '.value > input', value: route, noLabel: true});
  }

  // Add an environment variable
  if (addVar) {
    cy.get('.key-value > .footer > .add').click();
    cy.typeValue({label: '.key > input', value: 'test_var', noLabel: true});
    // '.no-resize' sounds weird, but it's the name of the field...
    cy.typeValue({label: '.no-resize', value: 'test_value', noLabel: true});
  }

  // Set the desired number of instances
  cy.typeValue({label: 'Instances', value: instanceNum});
  cy.clickButton('Next');

  // Upload the test application
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
Cypress.Commands.add('checkApp', ({appName, namespace, route, checkVar=false}) => {
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

  // If needed, check that there is one environment variable
  if (checkVar) cy.contains('1 Environment Vars').should('be.visible');

  // Check the application route
  var appRoute = 'https://' + appName + '.' + Cypress.env('system_domain');
  if (route) appRoute = route;  // Supersede the app route if needed
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
  cy.typeValue({label: 'Name', value: namespace});
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

// Epinio installation functions

// Add the Epinio Helm repo
Cypress.Commands.add('addHelmRepo', ({repoName, repoUrl}) => {
  cy.get('.nav').contains('Apps & Marketplace').click();
  cy.get('.nav').contains('Repositories').click();

  // Make sure we are in Repositories page and we can see the Create button
  cy.get('h1').contains('Repositories');
  cy.contains('Create').should('be.visible');

  cy.clickButton('Create');
  cy.contains('Repository: Create').should('be.visible');
  cy.typeValue({label: 'Name', value: repoName});
  cy.typeValue({label: 'Index URL', value: repoUrl});
  cy.clickButton('Create');
});

// Install Epinio via Helm
Cypress.Commands.add('epinioInstall', () => {
    cy.get('.nav').contains('Apps & Marketplace').click();
    cy.get('.nav').contains('Charts').click();
    cy.contains('epinio-installer').click();
    cy.contains('Charts: epinio-installer').should('be.visible');
    cy.clickButton('Install');

    // Namespace where installation will happen
    cy.typeValue({label: 'Name', value: 'epinio-install'});
    cy.clickButton('Next');
    
    // Configure custom domain
    cy.typeValue({label: 'Domain', value: Cypress.env('system_domain')});

    // Configure cors setting
    cy.typeValue({label: 'Access control allow origin', value: Cypress.env('cors')});

    // Cert Manager and ingress controler already installed by Rancher
    cy.contains('CertManager').click();
    cy.contains('ingress controller').click();

    // Install and check we get successfull installation message with a timeout long enough
    cy.clickButton('Install');
    cy.contains('SUCCESS: helm install', { timeout: 600000 }).should('be.visible');
    cy.get('.tab > .closer').click();
});
