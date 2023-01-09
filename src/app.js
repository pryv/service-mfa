/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const path = require('path');
const { getConfig } = require('@pryv/boiler').init({
  appName: 'service-mfa',
  baseConfigDir: path.resolve(__dirname, '../config/'),
  extraConfigs: [
    {
      scope: 'validation',
      plugin: require(path.resolve(__dirname, '../config/validation.js'))
    }
  ]
});
const express = require('express');
const middlewares = require('./middlewares');
const ChallengeVerifyService = require('./business/mfa/ChallengeVerifyService');
const SingleService = require('./business/mfa/SingleService');

class Application {
  /**
   * @type {express$Application}
   */
  express = undefined;
  /**
   * @type {Object}
   */
  settings = undefined;
  /**
   * @type {Service}
   */
  mfaService = undefined;

  /**
   * @returns {Promise<this>}
   */
  async init () {
    this.settings = await getConfig();
    this.mfaService = bootCorrectMfaService(this.settings);
    this.express = this.setupExpressApp();
    return this;
  }

  /**
   * @returns {any}
   */
  setupExpressApp () {
    const expressApp = express();
    expressApp.disable('x-powered-by');
    expressApp.use(express.json());
    expressApp.use(middlewares.subdomainToPath);
    expressApp.use(middlewares.commonHeaders);
    require('./routes/login')(expressApp, this.settings, this.mfaService);
    require('./routes/mfa')(expressApp, this.settings, this.mfaService);
    expressApp.use(middlewares.errors);
    return expressApp;
  }
}
module.exports = Application;

/**
 * @param {{}} settings
 * @returns {any}
 */
function bootCorrectMfaService (settings) {
  const mode = settings.get('sms:mode');
  if (mode === 'challenge-verify') return new ChallengeVerifyService(settings);
  if (mode === 'single') return new SingleService(settings);
}
