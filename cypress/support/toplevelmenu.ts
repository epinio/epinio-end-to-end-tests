export class TopLevelMenu {
  toggle() {
    cy.get('.menu-icon').click();
  }

  openIfClosed() {
    cy.get('body').then((body) => {
      if (body.find('.menu.raised').length === 0) {
        this.toggle();
      }
    });
  }

  categories() {
    cy.get('.side-menu .body .category');
  }

  links() {
    cy.get('.side-menu .option');
  }

  clusters() {
    cy.get('.clusters .cluster.selector.option');
  }

  localization() {
    cy.get('.locale-chooser');
  }
}
