import './functions';

// Applications tests
Cypress.Commands.add('runAppTest', (testName: string) => {
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz';
  const customRoute = 'custom-route-' + appName + '.' + Cypress.env('system_domain');

  // Create an application on default namespace and check it
  switch (testName) {
    case 'multipleInstance':
      cy.createApp({appName: appName, archiveName: archive, instanceNum: 5});
      cy.checkApp({appName: appName});
      break;
    case 'customRoute':
      cy.createApp({appName: appName, archiveName: archive, route: customRoute});
      cy.checkApp({appName: appName, route: customRoute});
      break;
    case 'envVars':
      cy.createApp({appName: appName, archiveName: archive, addVar: true});
      cy.checkApp({appName: appName, checkVar: true});
      break;
    case 'allTests':
      cy.createApp({appName: appName, archiveName: archive, instanceNum: 5, addVar: true, route: customRoute});
      cy.checkApp({appName: appName, checkVar: true, route: customRoute});
      break;
  }

  // Delete the tested application
  cy.deleteApp({appName: appName})
});

// Namespaces tests
Cypress.Commands.add('runNamespaceTest', (testName: string) => {
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz';
  const defaultNamespace = 'workspace';
  const namespace = 'mynamespace';

  switch (testName) {
    case 'newNamespace':
      // Create a new namespace
      cy.createNamespace(namespace);

      // Create an application on the new namespace and check it
      cy.createApp({appName: appName, archiveName: archive});
      cy.checkApp({appName: appName, namespace: namespace});

      // Delete the namespace
      cy.deleteNamespace({namespace: namespace, appName: appName});
      break;
    case 'withoutNamespace':
      // Delete default namespace
      cy.deleteNamespace({namespace: defaultNamespace});

      // Try to create the application
      cy.createApp({appName: appName, archiveName: archive, shouldBeDisabled: true});

      // Re-create default namespace
      cy.createNamespace(defaultNamespace);
      break;
  }
});
