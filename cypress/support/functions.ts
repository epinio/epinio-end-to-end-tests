import 'cypress-file-upload';

// Generic functions

   // Log into Rancher
Cypress.Commands.add('login', (username = Cypress.env('username'), password = Cypress.env('password'), cacheSession = Cypress.env('cache_session'), ui = Cypress.env('ui')) => {
  const login = () => {
    let loginPath
    ui == "rancher" ? loginPath="/v3-public/localProviders/local*" : loginPath="/pp/v1/epinio/rancher/v3-public/authProviders/local/login";
    cy.intercept('POST', loginPath).as('loginReq');
    
    cy.visit('/auth/login');

    cy.byLabel('Username')
      .focus()
      .type(username, {log: false});

    cy.byLabel('Password')
      .focus()
      .type(password, {log: false});

    cy.get('button').click();
    cy.wait('@loginReq');
      if (ui == "rancher") {
      cy.contains("Get Started", {timeout: 10000}).should('be.visible');
    } 
      else{
          cy.get("body").then(($body) => {
            if ($body.text().includes('Routes')) {
              cy.contains('.m-0', 'Applications', {timeout: 20000}).should('be.visible');
            } else if ($body.text().includes('Welcome to Epinio')) {
              cy.get('h1').contains('Welcome to Epinio', {timeout: 4000}).should('be.visible')}});
          }
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
  cy.get('.btn', {timeout: 30000}).contains(label).click();
});

// Ensure that we are in the desired menu
Cypress.Commands.add('clickEpinioMenu', (label) => {
  cy.get('.header').contains('Advanced').click( {force : true} );
  cy.get('.label').contains(label).click( {force : true} );
  cy.location('pathname').should('include', '/' + label.toLocaleLowerCase());
  // This will check application menu regardles if it has namespaces
  cy.get("body").then(($body) => {
    if ($body.text().includes('Routes')) {
      cy.contains('.m-0', 'Applications', {timeout: 20000}).should('be.visible');
    } else if ($body.text().includes('Welcome to Epinio')) {
      cy.get('h1').contains('Welcome to Epinio', {timeout: 4000}).should('be.visible')}});
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

Cypress.Commands.add('deleteAll', (label) => {
  // Must be present in Configurations, Aplications or Namespaces page first
  cy.clickEpinioMenu(label)
  cy.get('h1').contains(label).should('be.visible')
  cy.log(`## DElETION OF ALL ${label} STARTS HERE ##`)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Delete')) {
      cy.get('[width="30"] > .checkbox-outer-container.check').click();
      cy.get('.btn').contains('Delete').click({ctrlKey: true});
      cy.get('#promptRemove', {timeout: 40000}).should('not.exist')
    };
  });
});

// Check the status of the running stage
Cypress.Commands.add('checkStageStatus', ({numIndex, sourceType, timeout=6000, status='Success', appName="testapp"}) => {
  var getScope = ':nth-child(' + numIndex + ') > .col-badge-state-formatter > .status > .badge';
  if (sourceType == 'Container Image') {
    if (numIndex === 2) {
      cy.get('.tab-label', {timeout: 100000}).should('contain', `${appName} - App Logs`);
      cy.contains('Command line: \'httpd -D FOREGROUND\'', {timeout: timeout});
      cy.get('.tab > .closer').click(); 
    }
  } else {
      if (numIndex === 3) {
        cy.get('.tab-label').should('contain', 'testapp - Build');
        cy.contains('===> EXPORTING', {timeout: timeout});
        cy.contains('_ _ __ ___ _____ Done', {timeout: timeout});
        cy.get('.tab > .closer').click();
      
        /* Ugly thing here...
        When step 3 (building is done), it automatically opens a new App logs tab
        and it hides the success badge of step 3...
        So we have to wait last step done before continuing */
        cy.get('.tab-label', {timeout: 100000}).should('contain', 'testapp - App Logs');
        if (sourceType != 'Git URL' && sourceType != 'GitHub') cy.contains('Development Server (http://0.0.0.0:8080) started', {timeout: timeout});
        cy.get('.tab > .closer').click();
      }      
  }
  cy.get(getScope, {timeout: 20000}).contains(status).should('be.visible');
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
Cypress.Commands.add('createApp', ({appName, archiveName, sourceType, customPaketoImage, customApplicationChart, route, addVar, instanceNum=1, configurationName, shouldBeDisabled, manifestName, serviceName, catalogType, namespace='workspace'}) => {
  var envFile = 'read_from_file.env';  // File to use for the "Read from File" test

  cy.clickEpinioMenu('Applications');
  cy.clickButton('Create');

  // Select the Source Type if needed
  if (sourceType) {
    // Adding explicit wait here to attempt avoid failure in CI
    cy.wait(5000)
    cy.get('.labeled-select.hoverable').contains('Source Type', {timeout: 10000}).should('be.visible').click( {force : true} );
    cy.wait(1000)
    cy.contains(sourceType, {timeout: 10000}).should('be.visible').click({force: true});
    switch (sourceType) {
      case 'Container Image':
        cy.typeValue({label: 'Image', value: archiveName}); 
        break;
      case 'Git URL':
        cy.typeValue({label: 'URL', value: archiveName});
        cy.typeValue({label: 'Branch', value: 'main'}); 
        break;
      case 'Archive':
        cy.get(' button[data-testid="epinio_app-source_archive_file"] input[type="file"]').attachFile({filePath: archiveName, encoding: 'base64', mimeType: 'application/octet-stream'});   
        break; 
      case 'GitHub':
        cy.get('.labeled-input.edit.has-tooltip',{timeout:5000}).contains('label', 'Username / Organization').should('be.visible')
        // Typing a bit slower to avoid fetching too early
        cy.get('.labeled-input.edit.has-tooltip > input[type="text"]',{timeout:5000}).type('epinio',{delay:250, force:true})
        // Function 'typeValue' not working here
        // Selecting Repository
        cy.get('.labeled-select.edit.hoverable',{timeout:5000}).contains('label', 'Repository').should('be.visible').click();
        cy.contains('example-go').click();
        // Selecting Branch
        cy.get('.labeled-select.edit.hoverable',{timeout:5000}).contains('label', 'Branch').should('be.visible').click();
        cy.contains('main',{timeout:5000}).should('be.visible').click();
        // Selecting last commit. Currently at the top of the list.
        cy.get('span.radio-custom',{timeout:5000}).first().should('be.visible').click();
        break;
    };
  };

  if (manifestName) {
    // Rename downloaded file and upload
    cy.exec(`mv cypress/downloads/* cypress/downloads/${manifestName}`,{failOnNonZeroExit: false})
    cy.get('input[type="file"]').eq(0).attachFile({filePath: `../downloads/${manifestName}`, mimeType: 'application/octet-stream'});
  }

  // Use a custom Paketo Build Image if needed
  if (customPaketoImage) {
    cy.get('.advanced.text-link').click()
    cy.contains('Custom Image').click();
    cy.typeValue({label: '.no-label', value: customPaketoImage, noLabel: true});
  }

  // Use a custom Application Chart
  if (customApplicationChart) {
    // For now we asume Advance Settings is opened customPaketoImage
    // This is to avoid closing Advance Settings.
    // If at any point we want to use this function alone logic should be added
    cy.get('[data-testid="epinio_app-source_appchart"] > div > div >  .vs__selected').contains(' standard (Epinio standard deployment)').should('be.visible').click()
    cy.contains(customApplicationChart).click()
  }

  // Continue with the next screen
  cy.clickButton('Next', {force : true});
  // Only if we want to check that we get warned about no namespace defined
  if (shouldBeDisabled === true) {
    cy.get('.btn').should('contain', 'Next').and('be.disabled');
    cy.get('.banner.warning').should('contain', 'There are no namespaces. Please create one before proceeding');
    return;  // Of course, in that case the test is done if button is disabled
  }

  // Define application's name
  if (appName) {
    cy.typeValue({ label: 'Name', value: appName });
  }

  // Select other namespace aside from default
  if (namespace != 'workspace'){
    cy.selectNamespaceinComboBox({namespace});
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

  if (addVar === 'wordpress_env_file') {
    cy.get('input[type="file"]').attachFile({filePath: 'read_from_worpress_file.txt'});
    // Check the entered values
    cy.get('.key > input').eq(0).should('have.value', 'BP_PHP_VERSION');
    cy.get('.no-resize').eq(0).should('have.value', '8.0.x');
    cy.get('.key > input').eq(1).should('have.value', 'BP_PHP_SERVER');
    cy.get('.no-resize').eq(1).should('have.value', 'nginx');
    cy.get('.key > input').eq(2).should('have.value', 'BP_PHP_WEB_DIR');
    cy.get('.no-resize').eq(2).should('have.value', 'wordpress ');
    cy.get('.key > input').eq(3).should('have.value', 'DB_HOST');
    cy.get('.no-resize').eq(3).should('have.value', 'x8e5ee833a0f2faebaf5c4171baca-mysql');
    cy.get('.key > input').eq(4).should('have.value', 'SERVICE_NAME');
    cy.get('.no-resize').eq(4).should('have.value', 'mycustom-service');
  }

  if (addVar === 'go_example') {
    cy.get('.key-value > .footer > .add').click();
    cy.typeKeyValue({key: '.kv-item.key', value: 'BP_KEEP_FILES'});
    cy.typeKeyValue({key: '.kv-item.value', value: 'static/*'});
  }
  
  // Set the desired number of instances
  if (!manifestName){
  cy.typeValue({label: 'Instances', value: instanceNum});}
  cy.clickButton('Next');

  // Bind to Service if needed
  if (serviceName) {
    cy.get('input[placeholder="Select services to bind app to"]').should('be.visible').click()
    cy.get('.vs__dropdown-option > div').contains(serviceName&&catalogType).should('be.visible').click()
    // Check service is correctly selected
    cy.get('span.vs__selected').should('contain', serviceName&&catalogType )
  }

  // Bind a configuration if needed
  if (configurationName) {
    cy.wait(500);  // We need to wait a little for the listbox to be updated
    cy.contains('.labeled-select', 'Configurations').click();
    cy.contains(configurationName, {timeout: 120000}).click();
  }

  // Start application creation
  cy.clickButton('Create');

  // Check that each steps are succesfully done
  cy.checkStageStatus({numIndex: 1});
  cy.checkStageStatus({numIndex: 2, timeout: 240000, sourceType, appName});
  if (sourceType !== 'Container Image') {
    cy.checkStageStatus({numIndex: 3, timeout: 240000, sourceType});
    cy.checkStageStatus({numIndex: 4, timeout: 240000});
  }

  // Application is created!
  cy.clickButton('Done');
  // Give some time to the application to be ready
  cy.wait(6000);
});

// Ensure that the application is up and running
Cypress.Commands.add('checkApp', ({appName, namespace='workspace', route, checkVar, checkConfiguration, dontCheckRouteAccess, instanceNum, serviceName, checkCreatedApp}) => {
  cy.clickEpinioMenu('Applications');

  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure the application is in running state
  cy.get('header').should('contain', appName).and('contain', 'Running');

  // Make sure all application instances are up
  cy.get('.numbers', {timeout: 160000}).should('contain', '100%');

  // If needed, check the amount of instances
  if (instanceNum) cy.get('.scale-instances > div > div.value').contains(instanceNum).should('exist') 

  // If needed. check that the correct namespace has been used
  if (namespace) cy.contains('Namespace: ' + namespace).should('be.visible');

  // If needed, check that there is one environment variable
  if (checkVar) cy.contains('1 Environment Vars').should('be.visible');

  // If needed, check that created service exists
  if (serviceName) {
    cy.get('li#services').click()
    cy.contains(serviceName).should('be.visible');
    // Re-focus to top to check configurations on later steps
    cy.get('div.application-card-details-bottom').click()
  }

  if (checkCreatedApp) {
    // This will check the route link and extract its content
    // Then it will visit directly the app link within the same tab
    cy.get('.application-card-details-top > div > ul > li > a').invoke('text').then(text => {cy.visit(text)})
    // Specify here the exact locator for a given app
    switch (checkCreatedApp) {
      case 'wordpress':
        cy.get('#logo').should('exist'); 
        break;
    default:
      throw new Error('Case App to be checked not specified in test')
    };
    // Take a screenshot and go back to previous page
    cy.screenshot()
    cy.go('back')
  }

  // Check binded configurations
  var configurationNum = 0;
  if (checkConfiguration === true) configurationNum = 1;
  cy.contains(configurationNum + ' Configurations', {timeout: 24000}).should('be.visible');

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
  cy.get('div.actions > .role-multi-action').click()
  cy.contains('li', 'Restart').click(); 

  // Handle application log tab
  cy.get('.tab-label').should('contain', 'testapp - App Logs');
  cy.contains('Development Server (http://0.0.0.0:8080) started', {timeout: 120000});
  cy.get('.tab > .closer').click();
});

Cypress.Commands.add('rebuildApp', ({appName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and edit configuration
  cy.get('div.actions > .role-multi-action').click()
  cy.contains('li', 'Rebuild').click(); 

  // Make sure the app is rebuilding and then, back to running status
  cy.get('header').should('contain', appName).and('contain', 'Building');
  
  cy.get('.tab-label').should('contain', 'testapp - Build');
  cy.contains('Reusing layers from image', {timeout: 120000});
  cy.get('.tab > .closer').click();

  cy.get('header', {timeout: 60000}).should('contain', appName).and('contain', 'Running');
});

// Check application logs
Cypress.Commands.add('showAppLog', ({appName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and show logs
  cy.get('div.actions > .role-multi-action').click();
  cy.contains('li', 'App Logs').click();

  // A new tab must appear
  cy.get('.tab-label').should('contain', 'testapp - App Logs');
  
  // Web server ready message must appear in the log
  cy.contains('Development Server (http://0.0.0.0:8080) started', {timeout: 120000});
  cy.get('.tab > .closer').click();
});

// Check application shell
Cypress.Commands.add('showAppShell', ({appName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');
  
  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and show logs
  cy.get('div.actions > .role-multi-action').click();
  cy.contains('li', 'App Shell').click();

  // A new tab must appear
  cy.get('.tab-label').should('contain', 'testapp - App Shell');
  
  // Make sure we can run ls command in the shell
  cy.contains('Connected');
  cy.get('.terminal').type('ls{enter}');
  // Record a screenshot and close the tab
  cy.get('.terminal').screenshot('record_ls_command_output');
  cy.get('.tab > .closer').click();
});

// Downloading manifest 
Cypress.Commands.add('downloadManifest', ({appName}) => {
  cy.clickEpinioMenu('Applications');
  cy.get('.role-multi-action.actions').click();
  cy.contains('li', 'Download Manifest').click( {force: true} );  
  // Find downloaded json manifest in download folder & verify name in stdout 
  cy.exec(`find "cypress/downloads/" -name "workspace-${appName}*"`).its('stdout')
  .should('contain', appName);
})  

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
  cy.contains(namespace).click();
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

Cypress.Commands.add('openNamespacesFilter', ({location}) => {
  cy.clickEpinioMenu(location);
  cy.contains('Namespace:', {timeout: 55000}).should('be.visible');

  // Open namespace filter dropdown
  cy.get('.top > .ns-filter').click({force : true});

  // Confirm it is opened
  cy.get('i[class="icon icon-close"]', {timeout: 5000}).should('be.visible')
});

Cypress.Commands.add('filterNamespacesAndCheck', ({ namespace, elemInNamespaceName, filterOut=false }) => {

  if (filterOut === true) {
    // Select particular namespace in filter
    cy.get('.ns-item').contains(namespace).click();    

    // Check chip is not displayed on top of filter
    cy.get('[data-testid="namespaces-dropdown"]').contains(namespace).should('not.exist');
    
    if (elemInNamespaceName) {
    // Check element associated to namespace (app, config,...) is not displayed
    cy.get(".sortable-table.top-divider > tbody> tr.main-row")
      .find('td')
      .contains(elemInNamespaceName)
      .should('not.exist');
    }
  }

  else if (filterOut === false) {
    // Select particular namespace in filter
    cy.get('.ns-item').contains(namespace).click().then(() =>
      cy.get('.icon.icon-checkmark').should('be.visible'));

    // Check chip is added on top of filter
    cy.get('.ns-value').contains(namespace).should('be.visible');

    // Check element associated to namespace (app, config,...) is displayed
    cy.get(".sortable-table.top-divider > tbody> tr.main-row")
      .find('td')
      .contains(elemInNamespaceName)
      .should('have.length', 1);
  }
});

Cypress.Commands.add('checkOutcomeFilteredNamespaces', ({expectedNumFilteredNamespaces, expectedNumElemInNamespaces, expectedNameElementInNamespaces}) => {
 
  // Check chip is added on top of filter
  cy.get('div.ns-value').should('have.length', expectedNumFilteredNamespaces)
  
  // If 0 namespaces are filtered, check All namespaces is selected
  if(expectedNumFilteredNamespaces = 0) {
    cy.get('#all.ns-selected').contains('All Namespaces').should('be.selected');
  }

  // Check element associated to namespace (app, config,...) is displayed
  cy.get(".sortable-table.top-divider > tbody> tr.main-row")
  .should('have.length', expectedNumElemInNamespaces)

  // Check element displayed (app,config, etc) if specified
  if(expectedNameElementInNamespaces) {
  cy.get(".sortable-table.top-divider > tbody> tr.main-row").contains(expectedNameElementInNamespaces).should('be.visible');
  }

});


Cypress.Commands.add('selectNamespaceinComboBox', ({namespace}) => {
  cy.get('span.vs__selected',{timeout: 25000}).should('be.visible').click({ force: true });
  cy.get('ul.vs__dropdown-menu > li').contains(namespace).click({ force: true });
});

// Configurations functions

// Create a configuration
Cypress.Commands.add('createConfiguration', ({configurationName, fromFile, namespace='workspace'}) => {
  var configurationFile = 'read_from_file.configuration';  // File to use for the "Read from File" test

  cy.clickEpinioMenu('Configurations');
  cy.clickButton('Create');

  // Select other namespace aside from default
  if (namespace != 'workspace'){
  cy.selectNamespaceinComboBox({namespace})
  }

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
  cy.contains(configurationName, {timeout: 20000}).should('be.visible');
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
  cy.get('.main-row').should('contain', configurationName);

  // Select the 3dots button and edit configuration
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});
  cy.get('div.actions > .role-multi-action').click()
  cy.contains('Edit Config').click();

  // Select the Configurations tab
  cy.get('#configurations').click();
  cy.get('.tab-container').should('contain', configurationName);
  
  // Remove the configuration
  cy.get('[aria-label="Deselect configuration01"]').click();

  // And save
  cy.clickButton('Save');

  // Make sure the configuration is not bounded anymore
  cy.clickEpinioMenu('Applications');
  cy.get('.main-row').should('not.contain', configurationName);

  // Application status should be equal to 1/1
  cy.get('.main-row').should('contain', '1/1', {timeout: 16000});
  cy.wait(2000);
});

// Create an instance from catalog service
Cypress.Commands.add('createService', ({serviceName, catalogType}) => {
  cy.get('.accordion.package.depth-0.has-children', {timeout: 20000}).contains('Services').click()
  cy.clickButton('Create');
  cy.typeValue({label: 'Name', value: serviceName});
  cy.get('input[placeholder="Select the type of Service to create"].vs__search').click()
  cy.contains(catalogType).click()
  // Verify selected catalog service is selected
  cy.get('span.vs__selected').eq(1).should('contain', catalogType )
  cy.clickButton('Create');
  // Verify service is deployed 
  cy.get('span.badge-state.bg-success', {timeout: 90000}).contains('Deployed').should('be.visible')
  cy.get('td.col-link-detail').eq(0).contains(serviceName).should('be.visible')
});

// Bind a configuration to an existing application
Cypress.Commands.add('bindConfiguration', ({appName, configurationName, namespace='workspace'}) => {
  cy.clickEpinioMenu('Applications');

  // Go to application details
  cy.getDetail({name: appName, type: 'applications', namespace: namespace});

  // Make sure we are in the details page
  cy.get('header').should('contain', 'Applications:').and('contain', appName);

  // Select the 3dots button and edit configuration
  cy.get('div.actions > .role-multi-action').click()
  cy.contains('Edit Config').click();

  // Select the Configurations tab
  cy.get('#configurations').click();

  // Select the configuration
  cy.wait(500);  // We need to wait a little for the listbox to be updated
  // 'multiple' and 'force' are needed here
  // TODO: try to find a better way for this
  cy.contains('.labeled-select', 'Configurations').click();
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
  // For some reason if at this points changes screen and we attempt to delete the app,
  // it will crash. A bit of extra time,helps to prevent this.
  cy.wait(6000)
  // For now, that's not possible to check that the configuration has effectively been changed
  // because we can't scrap the value in the html page, maybe because the field is grey.
  // Attach to app might be a solution for checking it but the feature is not yet released.
  // Otherwise, we can use kubectl command but at the end of Cypress tests.
});

// Epinio installation functions

// Add the Epinio Helm repo
Cypress.Commands.add('addHelmRepo', ({repoName, repoUrl, repoType}) => {
  cy.clickClusterMenu(['Apps', 'Repositories'])

  // Make sure we are in the 'Repositories' screen (test failed here before)
  cy.contains('header', 'Repositories', {timeout: 8000}).should('be.visible');
  cy.contains('Create').should('be.visible');

  cy.clickButton('Create');
  cy.contains('Repository: Create').should('be.visible');
  cy.typeValue({label: 'Name', value: repoName});
  if (repoType === 'git') {
    cy.contains('Git repository').click();
    cy.typeValue({label: 'Git Repo URL', value: repoUrl});
    cy.typeValue({label: 'Git Branch', value: 'main'});
  } else {
    cy.typeValue({label: 'Index URL', value: repoUrl});
  }
  cy.clickButton('Create');
});

// Install Epinio via Helm
Cypress.Commands.add('epinioInstall', ({s3, extRegistry}) => {
  cy.clickClusterMenu(['Apps', 'Charts']);
  
  // Make sure we are in the chart screen (test failed here before)
  cy.contains('header', 'Charts', {timeout: 8000}).should('be.visible');
  
  // Install epinio-installer chart
  cy.contains('Epinio deploys Kubernetes').click();
  cy.contains('Charts: epinio').should('be.visible');
  cy.clickButton('Install');

  // Namespace where installation will happen
  cy.typeValue({label: 'Name', value: 'epinio-install'});
  // Typing just a new namespace name is not enough, select 'Create a New Namespace' first
  cy.get('div.vs__selected-options').eq(0).click();
  cy.get('li.vs__dropdown-option').contains('Create a New Namespace').click({force: true});
  cy.get(':nth-child(1) > .labeled-input').type('epinio');
  cy.clickButton('Next');
  
  // Configure custom domain
  cy.typeValue({label: 'Domain', value: Cypress.env('system_domain')});

  // Configure cors setting
  cy.typeValue({label: 'Access control allow origin', value: Cypress.env('cors')});

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

  // Add ExtraEnv values on bottom of values yaml if present, careful here, editor does indentation
  if (Cypress.env('extraEnvName') && Cypress.env('extraEnvValue')) {
    cy.contains('Edit YAML').click();
    cy.get('.CodeMirror textarea').type('{ctrl+end}{enter}extraEnv:{enter}  - name: ' + Cypress.env('extraEnvName') + '{enter}  value: \'' + Cypress.env('extraEnvValue') + '\'', { force: true });
  }

  // Install and check we get successfull installation message with a timeout long enough
  cy.clickButton('Install');
  cy.contains('SUCCESS: helm install', { timeout: 600000 }).should('be.visible');
  cy.get('.tab > .closer').click();
});

// Uninstall Epinio via Helm
Cypress.Commands.add('epinioUninstall', () => {
  cy.clickClusterMenu(['Apps', 'Installed Apps'])

  // Make sure we are in the 'Installed Apps' screen (test failed here before)
  cy.contains('header', 'Installed Apps', {timeout: 8000}).should('be.visible');
  cy.contains('epinio:').click();
  cy.clickButton('Delete');
  cy.confirmDelete();
  cy.contains('SUCCESS: helm uninstall', {timeout: 300000}).should('be.visible');
});

// Remove the Epinio Helm repo
Cypress.Commands.add('removeHelmRepo', () => {
  cy.clickClusterMenu(['Apps', 'Repositories']);

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
