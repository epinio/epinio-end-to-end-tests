import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Epinio installation testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    cy.get('.clusters').contains(Cypress.env('cluster')).click()
  });

  if (Cypress.env('experimental_chart_branch') == null) {
    it('Add the Epinio helm repo', () => {
      cy.addHelmRepo({ repoName: 'epinio-repo', repoUrl: 'https://github.com/epinio/helm-charts', repoType: 'git' });
    });

    it('Install Epinio', () => {
      // Boolean must be forced to false otherwise code is failing
      cy.epinioInstall({ s3: false, extRegistry: false });
    });
  }

  else if (Cypress.env('experimental_chart_branch') != null) {
    it('Add the Epinio helm experimental repo', () => {
      cy.addHelmRepo({ repoName: 'epinio-experimental', repoUrl: 'https://github.com/epinio/charts.git', repoType: 'git', branchName: Cypress.env('experimental_chart_branch') });
    });

    it('Install Epinio Experimental', () => {
      // Boolean must be forced to false otherwise code is failing
      cy.epinioInstall({ s3: false, extRegistry: false, namespace: 'None' });
    });
  }

  it('Verify Epinio over ingress URL', () => {
    // WORKAROUND until Epinio icon will be present again in Rancher UI
    cy.contains('More Resources').click();
    cy.contains('Networking').click();
    cy.contains('Ingresses').click();
    cy.contains('.ingress-target .target > a', 'epinio-ui')
      .prevAll('a')
      .invoke('attr', 'href').then( (href) => {
        cy.origin(href, (href) => {
        cy.visit('/');
        cy.get('h1').contains('Welcome to Epinio').should('be.visible')
        cy.url().then(url => {
          const tempUrl= url.replace(/^(https:\/\/.*?)\/.*$/, "$1");
          cy.log(`Epinio URL from ingress: ${tempUrl}`);
        });
      });
    });
  });
});

// if (Cypress.env('experimental_chart_branch') == null){
// describe('Epinio installation testing', () => {
//   const topLevelMenu = new TopLevelMenu();
//   const epinio = new Epinio();

//   beforeEach(() => {
//     cy.login();
//     cy.visit('/home');
//     topLevelMenu.openIfClosed();
//     cy.get('.clusters').contains(Cypress.env('cluster')).click()
//   });

//   it('Add the Epinio helm repo', () => {
//     cy.addHelmRepo({repoName: 'epinio-repo', repoUrl: 'https://github.com/epinio/helm-charts', repoType: 'git'});
//   });

//   it('Install Epinio', () => {
//     // Boolean must be forced to false otherwise code is failing
//     cy.epinioInstall({s3: false, extRegistry: false});
//   });

//   it('Verify Epinio over ingress URL', () => {
//     // WORKAROUND until Epinio icon will be present again in Rancher UI
//     cy.contains('More Resources').click();
//     cy.contains('Networking').click();
//     cy.contains('Ingresses').click();
//     cy.contains('.ingress-target .target > a', 'epinio-ui')
//       .prevAll('a')
//       .invoke('attr', 'href').then( (href) => {
//         cy.origin(href, (href) => {
//         cy.visit('/');
//         cy.get('h1').contains('Welcome to Epinio').should('be.visible')
//         cy.url().then(url => {
//           const tempUrl= url.replace(/^(https:\/\/.*?)\/.*$/, "$1");
//           cy.log(`Epinio URL from ingress: ${tempUrl}`);
//         });
//       });
//     });
//   });
// });
// }

// else if (Cypress.env('experimental_chart_branch') != null){
// describe('Epinio installation testing from experimental charts', () => {
//   const topLevelMenu = new TopLevelMenu();
//   const epinio = new Epinio();

//   beforeEach(() => {
//     cy.login();
//     cy.visit('/home');
//     topLevelMenu.openIfClosed();
//     cy.get('.clusters').contains(Cypress.env('cluster')).click()
//   });

//   it('Add the Epinio helm repo', () => {
//     cy.addHelmRepo({repoName: 'epinio-experimental', repoUrl: 'https://github.com/epinio/charts.git', repoType: 'git', branchName: Cypress.env('experimental_chart_branch')});
//   });

//   it('Install Epinio', () => {
//     // Boolean must be forced to false otherwise code is failing
//     cy.epinioInstall({s3: false, extRegistry: false, namespace: 'None'});
//   });

//   it('Verify Epinio over ingress URL', () => {
//     // Select "All Namespaces" from Namespace filter at the top
//     cy.get('.top > .ns-filter').click({force: true})
//     cy.get('#all', {timeout: 2000}).contains('All Namespaces').should('be.visible').click()
//     // Close the namespaces dropdowy
//     cy.get('.top > .ns-filter > .ns-dropdown.ns-open').click({force: true});

//     // WORKAROUND until Epinio icon will be present again in Rancher UI
//     cy.contains('More Resources').click({force: true});
//     cy.contains('Networking').click();
//     cy.contains('Ingresses').click();
//     cy.contains('.ingress-target .target > a', 'epinio-ui')
//       .prevAll('a')
//       .invoke('attr', 'href').then( (href) => {
//         cy.origin(href, (href) => {
//         cy.visit('/');
//         cy.get('h1').contains('Welcome to Epinio').should('be.visible')
//         cy.url().then(url => {
//           const tempUrl= url.replace(/^(https:\/\/.*?)\/.*$/, "$1");
//           cy.log(`Epinio URL from ingress: ${tempUrl}`);
//         });
//       });
//     });
//   });
// })
// };
