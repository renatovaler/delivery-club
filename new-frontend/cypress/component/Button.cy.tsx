import React from 'react';
import { mount } from 'cypress/react18';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    mount(<Button>Click me</Button>);
    cy.get('button').should('exist').and('contain.text', 'Click me');
  });

  it('handles click events', () => {
    const onClick = cy.spy().as('onClick');
    mount(<Button onClick={onClick}>Click me</Button>);
    cy.get('button').click();
    cy.get('@onClick').should('have.been.called');
  });

  it('renders in disabled state', () => {
    mount(<Button disabled>Disabled</Button>);
    cy.get('button')
      .should('be.disabled')
      .and('have.class', 'cursor-not-allowed');
  });

  it('renders with loading state', () => {
    mount(<Button isLoading>Loading</Button>);
    cy.get('button')
      .should('be.disabled')
      .find('.animate-spin')
      .should('exist');
  });

  it('renders with different variants', () => {
    mount(
      <div className="space-y-2">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    );

    cy.get('button').should('have.length', 6);
    cy.contains('button', 'Default').should('have.class', 'bg-slate-900');
    cy.contains('button', 'Destructive').should('have.class', 'bg-red-500');
    cy.contains('button', 'Outline').should('have.class', 'border');
    cy.contains('button', 'Secondary').should('have.class', 'bg-slate-100');
    cy.contains('button', 'Ghost').should('have.class', 'hover:bg-slate-100');
    cy.contains('button', 'Link').should('have.class', 'underline-offset-4');
  });

  it('renders with different sizes', () => {
    mount(
      <div className="space-y-2">
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🔍</Button>
      </div>
    );

    cy.get('button').should('have.length', 4);
    cy.contains('button', 'Default').should('have.class', 'h-10');
    cy.contains('button', 'Small').should('have.class', 'h-9');
    cy.contains('button', 'Large').should('have.class', 'h-11');
    cy.contains('button', '🔍').should('have.class', 'h-10 w-10');
  });

  it('renders with custom className', () => {
    mount(
      <Button className="custom-class" data-testid="custom-button">
        Custom
      </Button>
    );

    cy.get('[data-testid="custom-button"]')
      .should('have.class', 'custom-class')
      .and('contain.text', 'Custom');
  });

  it('forwards ref correctly', () => {
    const buttonRef = React.createRef<HTMLButtonElement>();
    mount(<Button ref={buttonRef}>Ref Button</Button>);
    cy.get('button').then(($button) => {
      expect($button.get(0)).to.equal(buttonRef.current);
    });
  });

  it('renders with left and right icons', () => {
    mount(
      <Button>
        <span className="mr-2">←</span>
        With Icons
        <span className="ml-2">→</span>
      </Button>
    );

    cy.get('button')
      .should('contain.text', 'With Icons')
      .find('span')
      .should('have.length', 2);
  });

  it('maintains focus state', () => {
    mount(<Button>Focus Test</Button>);
    cy.get('button').focus().should('be.focused');
  });

  it('handles keyboard interaction', () => {
    const onKeyPress = cy.spy().as('onKeyPress');
    mount(<Button onKeyPress={onKeyPress}>Key Press</Button>);
    cy.get('button').type('{enter}');
    cy.get('@onKeyPress').should('have.been.called');
  });
});
