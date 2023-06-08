import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';
import '~/cypress/support/functions';

Cypress.config();
describe('Menu testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('Check Epinio menu',  { tags: ['@menu-1', '@smoke']  },  () => {
    if (Cypress.env('ui') == "rancher") {
      topLevelMenu.openIfClosed();

      // Epinio's icon should appear in the side menu
      epinio.epinioIcon().should('exist');

      // Click on the Epinio's logo as well as your Epinio instance
      epinio.accessEpinioMenu(Cypress.env('cluster')); 
    }

    // Check Epinio's side menu
    epinio.checkEpinioNav();
  });

  it('Verify Welcome Screen without Namespaces', { tags: '@menu-2' }, () => {
    cy.deleteAll('Namespaces');
    cy.clickEpinioMenu('Dashboard');
    cy.checkDashboardResources({namespaceNumber: '0'});
    cy.get('.head-title > h1').contains('Welcome to Epinio', {timeout: 4000}).should('be.visible'); 
    cy.createNamespace('workspace');
  });

  it('Check "About" page and main links', { tags: '@menu-3' }, () => {
    // Check link in main page is present and works after clicking
    cy.get('.version.text-muted > a').should('have.attr', 'href').and('include', '/epinio/c/default/about');
    cy.get('.version.text-muted > a').click();

    // Test in ABOUT page starts here
    cy.get('table > tr > td:nth-child(2)').eq(0).invoke('text').then(version => {
      cy.log(`Epinio version in ABOUT PAGE is ${version}`);
     
      // Slice version to 6 chars if more found (Epinio Server Versions)
      if (version.length > 6) {
        cy.log(`More than 6 chars found in ${version}`)
        cy.log(`Slicing ${version} to ${version.slice(0,6)}`)
        version = version.slice(0,6);
      }
   
      // Check Epinio link has correct href
      cy.get('a[href="https://github.com/epinio/epinio"]', {timeout: 10000}).should('contain', 'Epinio');

      // Check "Go back" link
      cy.get('.back-link').should('exist').click();
      cy.get('span.label.no-icon').eq(1).contains('Applications').should('be.visible');

      // Checks version displayed in about page is the same as in main page ()
      // Later returns to About page
      cy.get('.version.text-muted > a').invoke('text').should('contains', version).then(version_main => {
        cy.log(`Epinio version in MAIN UI is ${version_main}`);
        cy.visit('/epinio/c/default/about');
        
      // Check back button turns into home if refreshed
      cy.reload()
      cy.get('a.back-link', {timeout: 5000}).contains('Home').should('be.visible');
      });
    });
  });

  it.skip('Check binaries, version related links and downloads from About menu', { tags: '@menu-4' }, () => {
    // Go to About page
    cy.get('.version.text-muted > a').click();

    // Test in ABOUT page starts here
    cy.get('table > tr > td:nth-child(2)').eq(0).invoke('text').then(version => {

      // Slice version to 6 chars if more found (Epinio Server Versions)
      if (version.length > 6) {
      cy.log(`More than 6 chars found in ${version}`)
      cy.log(`Slicing ${version} to ${version.slice(0,6)}`)
      version = version.slice(0,6);
    }

      // Verify amount of binaries in the page
      cy.get('tr.link > td > a').should('have.length', 3);
      const binOsNames = ['darwin-x86_64', 'linux-x86_64', 'windows-x86_64.zip'];

      for (let i = 0; i < binOsNames.length; i++) {

      // Verify binaries names and version match the one in the page
      cy.get('tr.link > td > a').contains(binOsNames[i]).and('have.attr', 'href')
        .and('include', `https://github.com/epinio/epinio/releases/download/${version}/epinio-${binOsNames[i]}`);
      }
      // Downloading using wget to issues with Github when clicking
      // Scoping download solely to Linux amd
      cy.exec('mkdir -p cypress/downloads');
      cy.exec(`wget -qS  https://github.com/epinio/epinio/releases/download/${version}/epinio-linux-x86_64 -O cypress/downloads/epinio-linux-x86_64`, { failOnNonZeroExit: false }).then((result) => {
        if (result.code != 0) {
          cy.task('log', '### ERROR: Could not download binary. Probably an error on Github ###');
        }
        cy.task('log', '### Stderr for download binary command starts here.');
        cy.task('log', result.stderr);
      });

      // Check link "See all packages" and visit binary page
      // Check version number in binary page matches the one in Epinio
      cy.get('.mt-5').contains('See all packages').invoke('attr', 'href').as('href_repo').then(() => {
        cy.get('@href_repo').should('eq', `https://github.com/epinio/epinio/releases/tag/${version}`);
        // Giving a bit of time beween latest time hitting github and now
        cy.wait(2000);
        cy.origin('https://github.com', { args: { version } }, ({ version }) => {
          cy.visit(`/epinio/epinio/releases/tag/${version}`, { timeout: 15000 });
          cy.get('.d-inline.mr-3', { timeout: 15000 }).contains(`${version}`).should('be.visible');
          cy.screenshot(`epinio-bin-repo-${version}`, { timeout: 15000 });
        });
      });
    });
  });

 
  it('Test buttons and links in dashboard page',  { tags: ['@menu-5', '@smoke']  },  () => {
    // Verify Get started and Issues links
    cy.get('.head-links').contains('Get started').should('have.attr', 'href').and('equal', 'https://epinio.io/');
    cy.get('.head-links').contains('Issues').should('have.attr', 'href').and('equal', 'https://github.com/epinio/epinio/issues');
  
    // NAMESPACES CARD
    cy.get('div.d-main > div > a > h1').eq(0).contains('Namespaces').should('be.visible').click();
    cy.get('h1.m-0').contains('Namespaces').should('be.visible');
    cy.go('back');
    // Click on card Create Namespace and check redirection
    cy.get('a.btn.role-secondary', {timeout: 20000}).contains('Create Namespace').should('be.visible').click();
    cy.get('.btn.role-secondary.mr-10').contains('Cancel ').should('be.visible').click();
    cy.go('back');
  
    // APPLICATIONS CARD
    cy.get('div.d-main > div > a > h1').eq(1).contains('Applications').should('be.visible').click();
    cy.get('h1.m-0').contains('Applications').should('be.visible');
    cy.go('back');
    // Click on card Deploy application and check redirection
    cy.get('a.btn.role-secondary', {timeout: 20000}).contains('Deploy Application').should('be.visible').click();
    cy.get('[data-testid="epinio_app-source_type"]').should('be.visible');
    cy.go('back');
  
    // SERVICES CARD
    cy.get('div.d-main > div > a > h1').eq(2).contains('Services').should('be.visible').click();
    cy.get('h1.m-0').contains('Instances').should('be.visible');
    cy.go('back');
    // Click on card "Services" and check redirection
    cy.get('a.link', {timeout: 20000}).contains('mysql-dev').should('be.visible').click();
    cy.contains('mysql-dev').should('be.visible');
    cy.go('back');
    cy.get('a.link', {timeout: 20000}).contains('redis-dev').should('be.visible').click();
    cy.contains('redis-dev').should('be.visible');
    });

  it('Verify stats in Dashboard page',  { tags: ['@menu-6', '@smoke']  },  () => {
    cy.createApp({appName: 'testapp', archiveName: 'sample-app.tar.gz', sourceType: 'Archive'});
    cy.createService({ serviceName: 'mycustom-service-1', catalogType: 'postgresql-dev' });
    cy.createNamespace('ns-1');
    cy.checkDashboardResources({namespaceNumber: '2', newestNamespaces: ['ns-1', 'workspace'], appNumber: '1', runningApps: '1', servicesNumber: '1' });
    cy.deleteNamespace({namespace:'ns-1'});
    cy.deleteAll('Applications');
    cy.deleteAll('Services');
    });

});

// Note: this test needs to be adapted for Rancher Dashboard
// Currently we are good if the custom user is unable to login when chart installed over Rancher
// We'd need to apply values.yaml with the users first in Edit YAML
describe('Login with different users', () => {

  it('Check login with admin user', { tags: '@login-1' }, () => {
    const user_epinio = "admin"
    const pwd_epinio = "password"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it('Check login with regular user and simple password', { tags: '@login-2' }, () => {
    const user_epinio = "epinio"
    const pwd_epinio = "password"
    cy.login(user_epinio, pwd_epinio);
    cy.contains('Invalid username or password. Please try again.').should('not.exist')
    cy.contains('Applications').should('be.visible')
  });

  it('Check login with regular user "user1" and password with special characters', { tags: '@login-3' },() => {
    const user_epinio = "user1"
    const pwd_epinio = "Hell@World"
    cy.login(user_epinio, pwd_epinio);
    if (Cypress.env('ui') == null ) {
      cy.contains('Invalid username or password. Please try again.').should('not.exist')
      cy.contains('Applications').should('be.visible')
    }
    // Login fails when installed from rancher
    else if (Cypress.env('ui') == 'epinio-rancher' || Cypress.env('ui') == 'rancher') {
      cy.contains('Invalid username or password. Please try again.').should('exist')
      cy.exec('echo "Negative testing for users. This user not allowed to log in unless values-users.yaml is applied."')
    }
    else {
      throw new Error('ERROR: Variable "ui" is set to an unexpected value.')
    }
  });

  it('Check login with regular user "user2" and password with many special characters', { tags: '@login-4' }, () => {
    const user_epinio = "user2"
    const pwd_epinio = "Hell#@~%/=World"
    cy.login(user_epinio, pwd_epinio);
    if (Cypress.env('ui') == null ) {
      cy.contains('Invalid username or password. Please try again.').should('not.exist')
      cy.contains('Applications').should('be.visible')
    }
    // Login fails when installed from rancher
    else if (Cypress.env('ui') == 'epinio-rancher' || Cypress.env('ui') == 'rancher') {
      cy.contains('Invalid username or password. Please try again.').should('exist')
      cy.exec('echo "Negative testing for users. This user not allowed to log in unless values-users.yaml is applied."')
    }
    else {
      throw new Error('ERROR: Variable "ui" is set to an unexpected value.')
    }
  });

  it('Check login with admin user name with special character (user@test) and password also with special characters', { tags: '@login-5' }, () => {
    const user_epinio = "user@test"
    const pwd_epinio = "Hell@World"
    cy.login(user_epinio, pwd_epinio);
    if (Cypress.env('ui') == null ) {
      cy.contains('Invalid username or password. Please try again.').should('not.exist')
      cy.contains('Applications').should('be.visible')
    }
    // Login fails when installed from rancher
    else if (Cypress.env('ui') == 'epinio-rancher' || Cypress.env('ui') == 'rancher') {
      cy.contains('Invalid username or password. Please try again.').should('exist')
      cy.exec('echo "Negative testing for users. This user not allowed to log in unless values-users.yaml is applied."')
    }
    else {
      throw new Error('ERROR: Variable "ui" is set to an unexpected value.')
    }
  });

  it('Check login with admin user name with numbers (0123456789) and password', { tags: '@login-6' },() => {
    const user_epinio = "0123456789"
    const pwd_epinio = "password"
    cy.login(user_epinio, pwd_epinio);
    if (Cypress.env('ui') == null) {
      cy.contains('Invalid username or password. Please try again.').should('not.exist')
      cy.contains('Applications').should('be.visible')
    }
    // Login fails when installed from rancher
    else if (Cypress.env('ui') == 'epinio-rancher' || Cypress.env('ui') == 'rancher') {
      cy.contains('Invalid username or password. Please try again.').should('exist')
      cy.exec('echo "Negative testing for users. This user not allowed to log in unless values-users.yaml is applied."')
    }
    else {
      throw new Error('ERROR: Variable "ui" is set to an unexpected value.')
    }
  });
});

  describe('Dex testing', () => {
  it('Check Dex login works with granted access', { tags: '@dex-1'}, () => {
    cy.dexLogin('admin@epinio.io', 'password');
  });

  it('Check users not allowed cannot connect to Dex', { tags: '@dex-2'}, () => {
    cy.dexLogin('invalid-mail@epinio.io', 'password', { checkLandingPage : false });
    cy.contains('Invalid Email Address and password').should('be.visible');
  });
});

