import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    env: {
      apiUrl: 'http://localhost:8000/api',
    },
    setupNodeEvents(on, config) {
      // Configuração de plugins do Cypress
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });

      // Configuração de variáveis de ambiente
      config.env = {
        ...config.env,
        ...process.env,
      };

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },

  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },

  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  downloadsFolder: 'cypress/downloads',
  fixturesFolder: 'cypress/fixtures',

  watchForFileChanges: true,

  experimentalStudio: true,
  experimentalWebKitSupport: true,
  experimentalMemoryManagement: true,
  experimentalModifyObstructiveThirdPartyCode: true,

  blockHosts: [
    '*google-analytics.com',
    '*hotjar.com',
    '*analytics.com',
  ],
});
