export class Epinio {
  epinioIcon() {
    return cy.get('.option .icon.group-icon.icon-epinio');
  } 

  checkEpinioNav() {
    // Open Services & Advanced accordions
    cy.get('div.header > i').eq(0).click()
    cy.get('div.header').contains('Services').should('be.visible')
    cy.get('div.header').contains('Advanced').should('be.visible')
    cy.get('div.header > i').eq(1).click()
   
    // Check all listed options once accordions are opened
    cy.get('li.child.nav-type').should(($lis) => {
    expect($lis).to.have.length(6);
    expect($lis.eq(0)).to.contain('Applications');
    expect($lis.eq(1)).to.contain('Namespaces');
    expect($lis.eq(2)).to.contain('Instances');
    expect($lis.eq(3)).to.contain('Catalog');
    expect($lis.eq(4)).to.contain('Configurations');
    expect($lis.eq(5)).to.contain('Application Templates');
    })      
  }

  accessEpinioMenu(cluster: string) {
    cy.contains('Epinio').click();
    cy.contains('Epinio instances', {timeout: 8000}).should('be.visible') && cy.contains('Available').should('be.visible');
    cy.contains(cluster).click();
  }

  firstLogin() {
    cy.get('input').type(Cypress.env('password'), {log: false});
    cy.clickButton('Log in with Local User');
    cy.contains('By checking the box, you accept').click('left');
    cy.clickButton('Continue');
    cy.contains("Get Started", {timeout: 10000});
  }
}
