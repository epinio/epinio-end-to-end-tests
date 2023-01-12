import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Epinio uninstallation testing', () => {
  const topLevelMenu = new TopLevelMenu();
  const epinio = new Epinio();

  beforeEach(() => {
    cy.login();
    cy.visit('/home');
    topLevelMenu.openIfClosed();
    cy.get('.clusters').contains(Cypress.env('cluster')).click()
  });

  it('Uninstall Epinio', () => {
    cy.epinioUninstall();
  });

  it('Remove the Epinio helm repo', () => {
    if (Cypress.env('experimental_chart_branch') != null) {
      cy.removeHelmRepo({ repoName: 'epinio-experimental' });
    }
    else {
      cy.removeHelmRepo({ repoName: 'epinio-repo' });
    }
  });
});
