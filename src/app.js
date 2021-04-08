// @flow
const path = require('path');
const { getConfig } = require('@pryv/boiler').init({
  appName: 'service-mfa',
  baseConfigDir: path.resolve(__dirname, '../config/')
});


const express = require('express');
const middlewares = require('./middlewares');
const ChallengeVerifyService = require('./business/mfa/ChallengeVerifyService');
const SingleService = require('./business/mfa/SingleService');

import type Service from './business/mfa/Service';

class Application {
  express: express$Application;
  settings: {};
  mfaService: Service;

  constructor() {}

  async init() {
    this.settings = await getConfig();
    this.mfaService = bootCorrectMfaService(this.settings);
    this.express = this.setupExpressApp();
    return this;
  }

  setupExpressApp(): express$Application {
    const expressApp = express();

    expressApp.use(express.json());
    expressApp.use(middlewares.subdomainToPath);
    expressApp.use(middlewares.commonHeaders);
    
    require('./routes/login')(expressApp, this.settings, this.mfaService);
    require('./routes/mfa')(expressApp, this.settings, this.mfaService);

    expressApp.use(middlewares.errors);
    
    return expressApp;
  }
}

function bootCorrectMfaService(settings: {}): Service {
  const mode = settings.get('sms:mode');
  if (mode === 'challenge-verify') return new ChallengeVerifyService(settings);
  if (mode === 'single') return new SingleService(settings);
}

module.exports = Application;
