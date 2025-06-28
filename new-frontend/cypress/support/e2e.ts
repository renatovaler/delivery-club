/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      // Adicione tipos personalizados de comandos aqui
      // exemplo:
      // login(email: string, password: string): Chainable<void>
    }
  }
}

// Configurações globais do Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornando false aqui impede que o Cypress falhe o teste
  return false;
});

// Preservar o cookie de autenticação entre os testes
Cypress.Cookies.defaults({
  preserve: ['auth-storage'],
});
