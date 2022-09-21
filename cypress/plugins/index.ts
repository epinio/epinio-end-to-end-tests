/// <reference types="cypress" />
require('dotenv').config();

/**
 * @type {Cypress.PluginConfig}
 */

let epinioUrl: string | null = null;
// eslint-disable-next-line no-unused-vars
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const url = process.env.RANCHER_URL || 'https://localhost:8005';

  // Getter and Setter for storing epinioUrl domain for all tests
  // setEpinioUrl is called from installation.spec.ts and uninstall.spec.ts
  // getEpinioUrl is called from functions.ts via login()
  on('task', {
    setEpinioUrl(val:string) {
      // copy everything before third slash with lazy regexp
      epinioUrl = val.replace(/^(https:\/\/.*?)\/.*$/, "$1");
      return epinioUrl;
    },
    getEpinioUrl() {
      return epinioUrl;
    }
  })

  config.baseUrl = url.replace(/\/$/, '');

  config.env.username = process.env.RANCHER_USER;
  config.env.password = process.env.RANCHER_PASSWORD;
  config.env.epinio_password = process.env.EPINIO_PASSWORD;
  config.env.cluster = process.env.CLUSTER_NAME;
  config.env.system_domain = process.env.SYSTEM_DOMAIN;
  config.env.cors = process.env.CORS;
  config.env.cache_session = process.env.CACHE_SESSION || false;
  config.env.external_reg_username = process.env.EXT_REG_USER;
  config.env.external_reg_password = process.env.EXT_REG_PASSWORD;
  config.env.s3_key_id = process.env.S3_KEY_ID;
  config.env.s3_key_secret = process.env.S3_KEY_SECRET;
  config.env.ui = process.env.UI;
  config.env.extraEnvName = process.env.EXTRAENV_NAME;
  config.env.extraEnvValue = process.env.EXTRAENV_VALUE;

  return config;
};
