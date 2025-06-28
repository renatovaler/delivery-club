describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Erro no login').should('be.visible');
  });

  it('should redirect to dashboard with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test User'
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token'
      }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('correctpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/customer-dashboard');
  });

  it('should navigate to forgot password page', () => {
    cy.contains('Esqueceu sua senha?').click();
    cy.url().should('include', '/forgot-password');
  });

  it('should navigate to register page', () => {
    cy.contains('Criar conta').click();
    cy.url().should('include', '/register');
  });
});
