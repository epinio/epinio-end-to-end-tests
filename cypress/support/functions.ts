import 'cypress-file-upload';

// Generic functions

// Log into Rancher
Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password'), cacheSession = Cypress.env('cache_session')) => {
  const login = () => {
    cy.intercept('POST', '/v3-public/localProviders/local*').as('loginReq');
    cy.visit('/auth/login');

    cy.byLabel('Username')
      .focus()
      .type(username, {log: false});

    cy.byLabel('Password')
      .focus()
      .type(password, {log: false});

    cy.get('button').click();
    cy.wait('@loginReq');
    cy.contains("Getting Started", {timeout: 10000}).should('be.visible');
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
Cypress.Commands.add('clickEpinioMenu', (label) => {
  cy.get('.label').contains(label).click();
  cy.location('pathname').should('include', '/' + label.toLocaleLowerCase());
  cy.get('.m-0').should('contain', label);
});

// Confirm the delete operation
Cypress.Commands.add('confirmDelete', (namespace) => {
  if (namespace) cy.get('#confirm').type(namespace);

  // Always unbind a configuration before deletion
  cy.get('.card-body').then(($cardBody) => {
    if ($cardBody.find('.checkbox-container').length) {
      cy.contains('Unbind').click();
    }
  });

  // Confirm the deletion
  cy.get('.card-actions').contains('Delete').click();
});

// Check the status of the running stage
Cypress.Commands.add('checkStageStatus', ({numIndex, timeout=6000, status='Success'}) => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter > .status > .badge';
  cy.get(getScope, {timeout: timeout}).contains(status).should('be.visible');
});

// Insert a value in a field *BUT* force a clear before!
Cypress.Commands.add('typeValue', ({label, value, noLabel, log=true}) => {
  if (noLabel === true) {
    cy.get(label).focus().clear().type(value, {log: log});
  } else {
    cy.byLabel(label).focus().clear().type(value, {log: log});
  }
});

Cypress.Commands.overwrite('type', (originalFn, subject, text, options = {}) => {
  options.delay = 100;

  return originalFn(subject, text, options);
});

// Add a delay between command without using cy.wait()
// https://github.com/cypress-io/cypress/issues/249#issuecomment-443021084
const COMMAND_DELAY = 1000;

for (const command of ['visit', 'click', 'trigger', 'type', 'clear', 'reload', 'contains']) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
        const origVal = originalFn(...args);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(origVal);
            }, COMMAND_DELAY);
        });
    });
}; 

// Make sure we are in the desired menu inside a cluster (local by default)
// You can access submenu by giving submenu name in the array
// ex:  cy.clickClusterMenu(['Menu', 'Submenu'])
Cypress.Commands.add('clickClusterMenu', (listLabel: string[]) => {
  listLabel.forEach(label => cy.get('nav').contains(label).click());
});

// Insert a key/value pair
Cypress.Commands.add('typeKeyValue', ({key, value}) => {
  cy.get(key).clear().type(value);
});

// Get the detail of an element
Cypress.Commands.add('getDetail', ({name, type, namespace='workspace'}) => {
  var dataNodeId = '[data-node-id="' + type + '/' + namespace + '/' + name + '"]';
  cy.get(dataNodeId).within(() => {
    cy.get('td').contains(name).click();
  });
});

// Application functions

// Create an Epinio application
Cypress.Commands.add('createApp', ({appName, archiveName, sourceType, customPaketoImage, route, addVar, instanceNum=1, configurationName, shouldBeDisabled}) => {
  var envFile = 'read_from_file.env';  // File to use for the "Read from File" test

  cy.clickEpinioMenu('Applications');
  cy.clickButton('Create');
  cy.typeValue({label: 'Name', value: appName});

  // Only if we want to check that 'Next' button is disabled
  // This could happen only if there is no namespace defined
  if (shouldBeDisabled === true) {
    cy.get('.btn').should('contain', 'Next').and('be.disabled');
    return;  // Of course, in that case the test is done if button is disabled
  }

  // Change default route if needed
  if (route) {
    cy.get('.btn').contains('Add').click();
    cy.typeValue({label: '.value > input', value: route, noLabel: true});
  }

  // Add an environment variable
  if (addVar === 'ui') {
    cy.get('.key-value > .footer > .add').click();
    cy.typeKeyValue({key: '.kv-item.key', value: 'PORT'});
    cy.typeKeyValue({key: '.kv-item.value', value: '8080'});
  } else if (addVar === 'file') {
    cy.get('input[type="file"]').attachFile({filePath: envFile});

    // Check the entered values
    cy.get('.key > input').should('have.value', 'PORT');
    cy.get('.no-resize').should('have.value', '8080');
  }

  // Set the desired number of instances
  cy.typeValue({label: 'Instances', value: instanceNum});
  cy.clickButton('Next');

  // Select the Source Type if needed
  if (sourceType) {
    cy.get('.labeled-select').click();
    cy.contains(sourceType, {timeout: 120000}).click();
    if (sourceType === 'Container Image') cy.typeValue({label: 'Image', value: archiveName});
    if (sourceType === 'Git URL') {
      cy.typeValue({label: 'URL', value: archiveName});
      cy.typeValue({label: 'Branch', value: 'main'});
    }
  } else {
    // Use the default one and upload the test application
    cy.get('input[type="file"]').attachFile({filePath: archiveName, encoding: 'base64', mimeType: 'application/octet-stream'});
  }

  // Use a custom Paketo Build Image if needed
  if (customPaketoImage) {
    cy.contains('Custom Image').click();
    cy.typeValue({label: '.no-label', value: customPaketoImage, noLabel: true});
  }

  // Continue with the next screen
  cy.clickButton('Next');

  // Bind a configuration if needed
  if (configurationName) {
    cy.wait(500);  // We need to wait a little for the listbox to be updated
    cy.get('.labeled-select').click();
    cy.contains(configurationName, {timeout: 120000}).click();
  }

  // Start application creation
  cy.clickButton('Create');

  // Check that each steps are succesfully done
  cy.checkStageStatus({numIndex: 1});
  cy.checkStageStatus({numIndex: 2, timeout: 120000});
  if (sourceType !== 'Container Image') {
    cy.checkStageStatus({numIndex: 3, timeout: 240000});
    cy.checkStageStatus({numIndex: 4, timeout: 120000});
  }

  // Application is created!
  cy.clickButton('Done');
  // Give some time to the application to be ready
  cy.wait(6000);
});

// Ensure that the application is up and running
Cypress.Commands.add('checkApp', ({appName, namespace='workspace', route, checkVar, checkConfiguration, dontCheckRouteAccess}) => {
  cy.clickEpinioMenu('Applications');

  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure the application is in running state
  cy.get('header').should('contain', appName).and('contain', 'Running');

  // Make sure all application instances are up
  cy.get('.numbers', {timeout: 160000}).should('contain', '100%');

  // If needed. check that the correct namespace has been used
  if (namespace) cy.contains('Namespace: ' + namespace).should('be.visible');

  // If needed, check that there is one environment variable
  if (checkVar) cy.contains('1 Environment Vars').should('be.visible');

  // Check binded configurations
  var configurationNum = 0;
  if (checkConfiguration === true) configurationNum = 1;
  cy.contains(configurationNum + ' Configs', {timeout: 24000}).should('be.visible');

  // Check the application route
  var appRoute = 'https://' + appName + '.' + Cypress.env('system_domain');
  if (route) appRoute = route;  // Supersede the app route if needed
  cy.contains(appRoute).should('be.visible');

  // Check that the application website is responding if needed
  if (dontCheckRouteAccess === false) {
    cy.contains(appRoute).invoke('attr', 'href').then(appLink => {
      cy.request({
        url: appLink,
      }).then(httpAnswer => {
        // Answer status code should be 200
        expect(httpAnswer.status).to.eq(200);
      });
    });
  }
});

// Delete an Epinio application
Cypress.Commands.add('deleteApp', ({appName, state='Running'}) => {
  cy.clickEpinioMenu('Applications');
  cy.contains(state + ' ' + appName).click('left');
  cy.clickButton('Delete');
  cy.confirmDelete();

  // Check that the application has effectively been destroyed
  cy.contains(appName, {timeout: 60000}).should('not.exist');
});

// Restart an Epinio application
Cypress.Commands.add('restartApp', ({appName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and edit configuration
  cy.get('.role-multi-action').click();
  cy.contains('li', 'Restart').click(); 

  // Restart counter is not ready yet so we can not use it for now.
  // I tried to check that instances number is not equal to 100% because
  // it's expected as new instances are popping to replace the olders.
  // But at the end, it adds flakyness, we wait for the restart counter to be ready.
});

Cypress.Commands.add('rebuildApp', ({appName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and edit configuration
  cy.get('.role-multi-action').click();
  cy.contains('li', 'Rebuild').click(); 

  // Make sure the app is rebuilding and then, back to running status
  cy.get('header').should('contain', appName).and('contain', 'Building');
  cy.get('header', {timeout: 20000}).should('contain', appName).and('contain', 'Running');
});

// Namespace functions

// Create an Epinio namespace
Cypress.Commands.add('createNamespace', (namespace) => {
  cy.clickEpinioMenu('Namespaces');
  cy.clickButton('Create');
  cy.typeValue({label: 'Name', value: namespace});
  cy.clickButton('Create');

  // Check that the namespace has effectively been created
  cy.contains(namespace).should('be.visible');
});

// Delete an Epinio namespace
Cypress.Commands.add('deleteNamespace', ({namespace, appName}) => {
  cy.clickEpinioMenu('Namespaces');
  cy.get('[data-title="Name"]').contains(namespace).click();
  cy.clickButton('Delete');
  cy.confirmDelete(namespace);

  // Check that the namespace has effectively been destroyed
  cy.contains(namespace, {timeout: 60000}).should('not.exist');

  // If needed, make sure the application is also deleted
  if (appName) {
    cy.clickEpinioMenu('Applications');
    cy.contains(appName).should('not.exist');
  }
});

// Configurations functions

// Create a configuration
Cypress.Commands.add('createConfiguration', ({configurationName, fromFile, namespace='workspace'}) => {
  var configurationFile = 'read_from_file.configuration';  // File to use for the "Read from File" test

  cy.clickEpinioMenu('Configurations');
  cy.clickButton('Create');

  // Name of the configuration
  cy.typeValue({label: 'Name', value: configurationName});

  // Enter Configuration Data
  if (fromFile === true) {
    cy.clickButton('Remove');
    cy.get('input[type="file"]').attachFile({filePath: configurationFile});

    // Check the entered values
    cy.get('.key > input').should('have.value', 'config_var');
    cy.get('.no-resize').should('have.value', 'config_value');
  } else {
    cy.typeKeyValue({key: '.kv-item.key', value: 'test_data'});
    cy.typeKeyValue({key: '.kv-item.value', value: 'test_value'});
  }

  // We need this little trick before clicking on 'Create' (why?)
  cy.wait(500);
  cy.clickButton('Create');

  // Check that the configuration has effectively been created
  cy.contains(configurationName).should('be.visible');
  // Give some time to the configuration to be ready
  cy.wait(1000);
});

// Delete a configuration
Cypress.Commands.add('deleteConfiguration', ({configurationName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Configurations');

  // Search for the correct configuration (same name can be used on different namespace)
  cy.getDetail({name: configurationName, type: 'configurations', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Configurations:').and('contain', configurationName);

  // Select the 3dots button and delete the configuration
  cy.get('.role-multi-action').click();
  cy.contains('Delete').click();
  cy.confirmDelete();

  // Check that the configuration has effectively been destroyed
  cy.contains(configurationName).should('not.exist');
});

// Unbind a configuration from an app
Cypress.Commands.add('unbindConfiguration', ({appName, configurationName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Make sure the configuration is bounded already
  cy.get('[data-title="Bound Configs"]').should('contain', configurationName);

  // Select the 3dots button and edit configuration
  cy.get('.role-multi-action').click();
  cy.contains('Edit Config').click();

  // Select the Configurations tab
  cy.get('#configurations').click();
  cy.get('.tab-container').should('contain', configurationName);
  
  // Remove the configuration
  cy.get('[aria-label="Deselect configuration01"]').click();

  // And save
  cy.clickButton('Save');

  // Make sure the configuration is not bounded anymore
  cy.get('[data-title="Bound Configs"]').should('not.contain', configurationName);

  // Application status should be equal to 1/1
  cy.get('[data-title="Status"]', {timeout: 16000}).should('contain', '1/1');
  cy.wait(2000);
 });

// Bind a configuration to an existing application
Cypress.Commands.add('bindConfiguration', ({appName, configurationName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');

  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and edit configuration
  cy.get('.role-multi-action').click();
  cy.contains('Edit Config').click();

  // Select the Configurations tab
  cy.get('#configurations').click();

  // Select the configuration
  cy.wait(500);  // We need to wait a little for the listbox to be updated
  // 'multiple' and 'force' are needed here
  // TODO: try to find a better way for this
  cy.get('.labeled-select').click({multiple: true, force: true});
  cy.contains(configurationName, {timeout: 120000}).click();

  // And save
  cy.clickButton('Save');
  // Strange sporadic issues happen here
  // The wait call seems to improve test realibility
  cy.wait(6000);
});

// Edit a configuration
Cypress.Commands.add('editConfiguration', ({configurationName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Configurations');

  // Go to configuration details
  cy.getDetail({name: configurationName, type: 'configurations', namespace: namespace});
  cy.wait(1000);

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Configurations:').and('contain', configurationName);

  // Select the 3dots button and edit the configuration
  cy.get('.role-multi-action').click();
  cy.contains('Edit Config').click();
  cy.get('.no-resize').type('_add');
  cy.clickButton('Save'); 
  cy.get('header').should('contain', 'Configurations:').and('contain', configurationName).and('not.contain', 'Saving');

  // For now, that's not possible to check that the configuration has effectively been changed
  // because we can't scrap the value in the html page, maybe because the field is grey.
  // Attach to app might be a solution for checking it but the feature is not yet released.
  // Otherwise, we can use kubectl command but at the end of Cypress tests.
});

// Epinio installation functions

// Add the Epinio Helm repo
Cypress.Commands.add('addHelmRepo', ({repoName, repoUrl}) => {
  cy.clickClusterMenu(['Apps & Marketplace', 'Repositories'])

  // Make sure we are in the 'Repositories' screen (test failed here before)
  cy.contains('header', 'Repositories', {timeout: 8000}).should('be.visible');
  cy.contains('Create').should('be.visible');

  cy.clickButton('Create');
  cy.contains('Repository: Create').should('be.visible');
  cy.typeValue({label: 'Name', value: repoName});
  cy.typeValue({label: 'Index URL', value: repoUrl});
  cy.clickButton('Create');
});

// Install Epinio via Helm
Cypress.Commands.add('epinioInstall', ({s3, extRegistry}) => {
  cy.clickClusterMenu(['Apps & Marketplace', 'Charts']);
  
  // Make sure we are in the chart screen (test failed here before)
  cy.contains('header', 'Charts', {timeout: 8000}).should('be.visible');
  
  // Install epinio-installer chart
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

  // Configure external registry
  if (extRegistry === true) {
    cy.contains('a', 'External registry').click();
    cy.contains('Use an external registry').click();
    cy.typeValue({label: 'External registry url', value: 'registry.hub.docker.com'});
    cy.typeValue({label: 'External registry username', value: Cypress.env('external_reg_username'), log: false});
    cy.typeValue({label: 'External registry password', value: Cypress.env('external_reg_password'), log: false});
    cy.typeValue({label: 'External registry namespace', value: Cypress.env('external_reg_username'), log: false});
  }

  // Configure s3 storage
  if (s3 === true) {
    cy.contains('a', 'External S3 storage').click();
    cy.contains('Use an external s3 storage').click();
    cy.typeValue({label: 'S3 endpoint', value: 's3.amazonaws.com'});
    cy.typeValue({label: 'S3 access key id', value: Cypress.env('s3_key_id'), log: false});
    cy.typeValue({label: 'S3 access key secret', value: Cypress.env('s3_key_secret'), log: false});
    cy.typeValue({label: 'S3 bucket', value: 'epinio-ci'});
    cy.contains('S3 use SSL').click();
  }

  // Install and check we get successfull installation message with a timeout long enough
  cy.clickButton('Install');
  cy.contains('SUCCESS: helm install', { timeout: 600000 }).should('be.visible');
  cy.get('.tab > .closer').click();
});

// Uninstall Epinio via Helm
Cypress.Commands.add('epinioUninstall', () => {
  cy.clickClusterMenu(['Apps & Marketplace', 'Installed Apps'])

  // Make sure we are in the 'Installed Apps' screen (test failed here before)
  cy.contains('header', 'Installed Apps', {timeout: 8000}).should('be.visible');
  cy.contains('epinio-installer:').click();
  cy.clickButton('Delete');
  cy.confirmDelete();
  cy.contains('SUCCESS: helm uninstall', {timeout: 300000}).should('be.visible');
});

// Remove the Epinio Helm repo
Cypress.Commands.add('removeHelmRepo', () => {
  cy.clickClusterMenu(['Apps & Marketplace', 'Repositories']);

  // Make sure we are in the 'Repositories' screen (test failed here before)
  cy.contains('header', 'Repositories', {timeout: 8000}).should('be.visible');
  cy.contains('epinio-repo').click();
  // Using three dots menu to delete the repo
  // TODO: Check if we can click checkbox instead
  cy.contains('Repository: epinio-repo').should('be.visible');
  cy.get('.role-multi-action').click();
  cy.contains('Delete').click();
  cy.confirmDelete();
});
