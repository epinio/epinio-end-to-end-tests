import { Epinio } from '~/cypress/support/epinio';

Cypress.config();
describe('Example test calling kubectl and epinio commands', () => {
  const epinio = new Epinio();

  it('Log in and perform CLI commands', () => {
    cy.login();

    // Deploy kubectl (incl. configuration) and epinio
    // cy.kubectlDeployCli(); // in case you need only kubectl
    cy.epinioDeployCli();

    // Call commands here
    cy.commandCall('kubectl', 'get pods -A');
    // This command is suppose to fail so add "|| true" at the end of arguments
    let result = cy.commandCall('epinio', 'info || true');
    console.log(result);
  });
});
