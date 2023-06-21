declare global {
    namespace Cypress {
      interface Chainable {
        login(email?: string, password?: string): Chainable<Element>;
        loginAsAdmin(): Chainable<Element>;
        loginAsUser(): Chainable<Element>;
      }
    }
  }
  
  export {};