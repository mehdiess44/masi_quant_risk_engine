describe('Overview Page E2E', () => {
  beforeEach(() => {
    // Visiter la page d'accueil
    cy.visit('/');
  });

  it('devrait charger la page correctement et afficher les éléments de base', () => {
    // Vérifier la présence du Hero Chart (canvas ou conteneur)
    cy.get('.tv-lightweight-charts').should('be.visible');

    // Vérifier la présence des KPIs
    cy.contains('Annual Return').should('be.visible');
    cy.contains('Volatility 20d').should('be.visible');

    // Vérifier la présence du Trading Panel
    cy.contains('System Execution').should('be.visible');
  });

  it('devrait interagir avec le Trading Panel', () => {
    // Cypress cannot easily drag custom divs, so we will just click on the track to change value
    // First slider (Risk Tolerance)
    cy.contains('Risk Tolerance').parent().parent().find('.font-mono-data').invoke('text').then((text) => {
      // Simulate clicking on the track of the first GlowSlider
      // We know there are two sliders (div with height 24px and cursor pointer)
      cy.contains('Risk Tolerance').parent().parent().find('div[style*="cursor: pointer"]').first().click('right');
      
      // Values should update
      cy.contains('Execute Model').click();
      
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Execution');
      });
    });
  });
});
