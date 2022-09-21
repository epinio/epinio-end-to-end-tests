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

  it('Add the Epinio helm repo', () => {
    cy.addHelmRepo({repoName: 'epinio-repo', repoUrl: 'https://github.com/epinio/helm-charts', repoType: 'git'});
  });

  it('Install Epinio', () => {
    // Boolean must be forced to false otherwise code is failing
    cy.epinioInstall({s3: false, extRegistry: false});
  });

  it('Get and store the epinio-ui ingress URL', () => {
    cy.contains('More Resources').click();
    cy.contains('Networking').click();
    cy.contains('Ingresses').click();
    cy.contains('.ingress-target .target > a', 'epinio-ui')
      .prevAll('a')
      .invoke('attr', 'href').then( (href) => {
        cy.origin(href, (href) => {
        cy.visit('/');
        cy.get('.dashboard-body');
        cy.url().then(url => {
          const tempURL= url
          cy.log(tempURL);
          cy.task('setEpinioUrl', tempURL);
        });
      });
    });
    // Debug only
    cy.task('getEpinioUrl').then((epinioUrl) => {
      cy.log(epinioUrl);
    });
  })
});
