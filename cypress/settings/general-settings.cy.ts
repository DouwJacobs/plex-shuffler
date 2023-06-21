describe('General Settings', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });
  
    it('opens the settings page from the home page', () => {
      cy.visit('/');
  
      cy.get('[data-testid=sidebar-toggle]').click();
      cy.get('[data-testid=sidebar-menu-settings-mobile]').click();
  
      cy.get('.heading').should('contain', 'General Settings');
    });
  
    it('modifies setting that requires restart', () => {
      cy.visit('/settings');
    
      cy.get('[data-testid=modal-ok-button]').click();
      cy.get('[data-testid=modal-title]').should('not.exist');
  
    });
  });