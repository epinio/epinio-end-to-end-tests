import { defineConfig } from 'cypress'

// export default defineConfig({
export default defineConfig({
  defaultCommandTimeout: 10000,
  reporter: 'mochawesome',
  reporterOptions: {
    reportFilename: '[name]-report_[status]_[datetime]',
    timestamp: 'shortDate',
  },
  clientCertificates: [
    {
      url: 'https://*',
      ca: [],
      certs: [
        {
          cert: 'cypress/fixtures/epinio-private-cert-pem.file',
          key: 'cypress/fixtures/epinio-private-key-pem.file',
        },
      ],
    },
  ],
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config)
    },
    experimentalSessionAndOrigin: true,
    specPattern:
      'cypress/e2e/unit_tests/*.spec.ts',
  },
})
