import cypress from 'cypress';
import { Epinio } from '~/cypress/support/epinio';
import './functions';

// First connexion test
Cypress.Commands.add('runFirstConnectionTest', () => {
  const epinio = new Epinio();

  cy.visit('/auth/login');
  cy.get("span").then($text => {
    if ($text.text().includes('your first time visiting Rancher')) {
      epinio.firstLogin();
    }
    else {
      cy.log('Rancher already initialized, no need to handle first login.');
    };
  });
});

// Applications tests
Cypress.Commands.add('runApplicationsTest', (testName: string) => {
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz';
  const customRoute = 'custom-route-' + appName + '.' + Cypress.env('system_domain');
  const paketobuild = 'paketobuildpacks/builder:tiny';
  const gitUrl = 'https://github.com/epinio/example-go';
  const configuration = 'configuration01';
  const manifest = 'manifest.json';

  // Create an application on default namespace and check it
  switch (testName) {
    case 'multipleInstanceAndContainer':
      cy.createApp({appName: appName, archiveName: 'httpd:latest', instanceNum: 5, sourceType: 'Container Image'});
      cy.checkApp({appName: appName, dontCheckRouteAccess: true});
      break;
    case 'customRoute':
      cy.createApp({appName: appName, archiveName: archive, route: customRoute, sourceType: 'Archive'});
      cy.checkApp({appName: appName, route: customRoute});
      cy.showAppLog({appName: appName});
      // App shell feature is not available in std UI yet
      // https://github.com/epinio/ui/issues/84 
      if (Cypress.env('ui') == "rancher") cy.showAppShell({appName: appName});
      break;
    case 'envVarsAndGitUrl':
      cy.createApp({appName: appName, archiveName: gitUrl, customPaketoImage: paketobuild, addVar: 'ui', sourceType: 'Git URL'});
      cy.checkApp({appName: appName, checkVar: true});
      break;
    case 'restartAndRebuild':
      cy.createApp({appName: appName, archiveName: archive, sourceType: 'Archive'});
      cy.checkApp({appName: appName});
      cy.restartApp({appName: appName});
      cy.checkApp({appName: appName});
      cy.rebuildApp({appName: appName});
      cy.checkApp({appName: appName});
      break;
    case 'allTests':
      cy.createApp({appName: appName, archiveName: gitUrl, customPaketoImage: paketobuild, instanceNum: 5, addVar: 'ui', route: customRoute, sourceType: 'Git URL'});
      cy.checkApp({appName: appName, checkVar: true, route: customRoute});
      break;
    case 'downloadManifestAndPushApp':
      cy.createConfiguration({configurationName: configuration});      
      cy.createApp({appName: appName, archiveName: archive, sourceType: 'Archive', route: customRoute,  instanceNum: 2, addVar: 'ui', configurationName: configuration });   
      cy.checkApp({appName: appName , checkConfiguration: true, route:customRoute, instanceNum: 2}); 
      // Downloading manifest      
      cy.downloadManifest({appName: appName});
      // Delete app prior uploading from manifest
      cy.deleteApp({appName: appName});
      // Create app from manifest solely and check results
      cy.createApp({archiveName: archive, sourceType: 'Archive', manifestName: manifest }); 
      cy.checkApp({appName: appName , checkConfiguration: true, route: customRoute, checkVar: true, instanceNum: 2});
      break;
  }

  // Delete the tested application
  cy.deleteApp({appName: appName});
});

// Configurations tests
Cypress.Commands.add('runConfigurationsTest', (testName: string) => {
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz'
  const configuration = 'configuration01';

  switch (testName) {
    case 'newAppWithConfiguration':
      // Create a new configuration
      cy.wait(5000); // Workaround for https://github.com/rancher/dashboard/issues/5240
      cy.createConfiguration({configurationName: configuration});

      // Create an application with the newly created configuration and check it
      cy.createApp({appName: appName, archiveName: archive, configurationName: configuration, sourceType: 'Archive'});
      cy.checkApp({appName: appName, checkConfiguration: true});

      // Unbind the created configuration
      cy.unbindConfiguration({appName: appName, configurationName: configuration});
      cy.checkApp({appName: appName});

      // Delete the tested application
      cy.deleteApp({appName: appName});
      
      // Delete the created configuration
      cy.deleteConfiguration({configurationName: configuration});
      break;
    case 'bindConfigurationOnApp':
      // Create another new configuration
      cy.wait(5000); // Workaround for https://github.com/rancher/dashboard/issues/5240
      cy.createConfiguration({configurationName: configuration, fromFile: true});

      // Create an application *WITHOUT* any configuration
      cy.createApp({appName: appName, archiveName: archive, addVar: 'file', sourceType: 'Archive'});
      cy.checkApp({appName: appName});

      // Bind the created configuration to the application and check it
      cy.bindConfiguration({appName: appName, configurationName: configuration});
      cy.checkApp({appName: appName, checkConfiguration: true, checkVar: true});

      // Edit the created configuration
      cy.editConfiguration({configurationName: configuration});

      // Delete the tested application and the configuration
      cy.deleteApp({appName: appName});
      cy.deleteConfiguration({configurationName: configuration});
      break;
  }
});

// Namespaces tests
Cypress.Commands.add('runNamespacesTest', (testName: string) => {
  const appName = 'testapp';
  const archive = 'sample-app.tar.gz';
  const defaultNamespace = 'workspace';
  const namespace = 'mynamespace';

  switch (testName) {
    case 'newNamespace':
      // Create a new namespace
      cy.wait(5000); // Workaround for https://github.com/rancher/dashboard/issues/5240
      cy.createNamespace(namespace);

      // Create an application on the new namespace and check it
      cy.createApp({appName: appName, archiveName: archive, sourceType: 'Archive'});
      cy.checkApp({appName: appName, namespace: namespace});

      // Delete the namespace
      cy.deleteNamespace({namespace: namespace, appName: appName});
      break;
    case 'withoutNamespace':
      // Delete default namespace
      cy.wait(5000); // Workaround for https://github.com/rancher/dashboard/issues/5240
      cy.deleteNamespace({namespace: defaultNamespace});

      // Try to create the application
      cy.createApp({appName: appName, archiveName: archive, sourceType: 'Archive', shouldBeDisabled: true});

      // Re-create default namespace
      cy.createNamespace(defaultNamespace);
      break;
  }
});
