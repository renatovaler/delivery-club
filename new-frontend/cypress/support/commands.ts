/// <reference types="cypress" />

// Comando personalizado para login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para verificar se está autenticado
Cypress.Commands.add('checkAuthenticated', () => {
  cy.window().its('localStorage').invoke('getItem', 'auth-storage').should('exist');
});

// Comando para limpar autenticação
Cypress.Commands.add('clearAuth', () => {
  cy.window().its('localStorage').invoke('removeItem', 'auth-storage');
  cy.reload();
});

// Comando para esperar carregamento
Cypress.Commands.add('waitForLoad', () => {
  cy.get('.animate-spin').should('not.exist');
});

// Comando para verificar toast
Cypress.Commands.add('checkToast', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Comando para navegar para uma rota autenticada
Cypress.Commands.add('visitAuthenticated', (url: string) => {
  cy.intercept('GET', '/api/users/me', {
    statusCode: 200,
    body: {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User'
    }
  }).as('me');

  cy.window().then((win) => {
    win.localStorage.setItem('auth-storage', JSON.stringify({
      token: 'fake-jwt-token',
      refreshToken: 'fake-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User'
      }
    }));
  });

  cy.visit(url);
  cy.wait('@me');
});

// Comando para interceptar requisições da API
Cypress.Commands.add('mockApi', (method: string, url: string, response: any) => {
  cy.intercept(method, url, {
    statusCode: 200,
    body: response
  }).as('apiRequest');
});

// Comando para verificar formulário de erro
Cypress.Commands.add('checkFormError', (fieldName: string, errorMessage: string) => {
  cy.get(`[data-error="${fieldName}"]`).should('contain', errorMessage);
});

// Comando para preencher formulário
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[name="${field}"]`).type(value);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      checkAuthenticated(): Chainable<void>;
      clearAuth(): Chainable<void>;
      waitForLoad(): Chainable<void>;
      checkToast(message: string): Chainable<void>;
      visitAuthenticated(url: string): Chainable<void>;
      mockApi(method: string, url: string, response: any): Chainable<void>;
      checkFormError(fieldName: string, errorMessage: string): Chainable<void>;
      fillForm(formData: Record<string, string>): Chainable<void>;
    }
  }
}
