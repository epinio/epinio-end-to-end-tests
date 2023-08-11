/// <reference types="cypress" />
require('dotenv').config();

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const url = process.env.RANCHER_URL || 'https://localhost:8005';

  config.baseUrl = url.replace(/\/$/, '');

  config.env.username = process.env.RANCHER_USER;
  config.env.password = process.env.RANCHER_PASSWORD;
  config.env.cluster = process.env.CLUSTER_NAME;
  config.env.system_domain = process.env.SYSTEM_DOMAIN;
  config.env.cors = process.env.CORS;
  config.env.cache_session = process.env.CACHE_SESSION || false;
  config.env.s3Storage = process.env.S3_STORE_TYPE;
  config.env.external_reg_username = process.env.EXT_REG_USER;
  config.env.external_reg_password = process.env.EXT_REG_PASSWORD;
  config.env.s3_key_id = process.env.S3_KEY_ID;
  config.env.s3_key_secret = process.env.S3_KEY_SECRET;
  config.env.ui = process.env.UI;
  config.env.extraEnvName = process.env.EXTRAENV_NAME;
  config.env.extraEnvValue = process.env.EXTRAENV_VALUE;
  config.env.experimental_chart_branch = process.env.EXPERIMENTAL_CHART_BRANCH;
  config.env.grep = process.env.GREP;
  config.env.grepTags = process.env.GREPTAGS;

  return config;
};
