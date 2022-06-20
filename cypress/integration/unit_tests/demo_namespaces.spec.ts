import { Epinio } from '~/cypress/support/epinio';
import { TopLevelMenu } from '~/cypress/support/toplevelmenu';

Cypress.config();
describe('Namespaces testing', () => {
    const topLevelMenu = new TopLevelMenu();
    const epinio = new Epinio();
    const namespace = 'mynamespace';

    beforeEach(() => {
        cy.login();
        //cy.visit('/');
        if (Cypress.env('ui') == "rancher") {
        topLevelMenu.openIfClosed();
        epinio.accessEpinioMenu(Cypress.env('cluster'));
        }
    });

    it('Create a namespace', () => {
        cy.createNamespace(namespace);
    });

    it('Delete a namespace', () => {
        cy.deleteNamespace({namespace: namespace});
    });
});
