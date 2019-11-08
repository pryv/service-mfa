// @flow

const express = require('express');
const middlewares = require('./middlewares');
const nconfSettings = require('./settings');
const MFAService = require('../business/mfa/Service');

class Application {
  express: express$Application;
  settings: Object;
  mfaService: MFAService;

  constructor() {
    this.settings = nconfSettings;
    this.express = this.setupExpressApp();
    this.mfaService = new MFAService(this.settings);
  }

  setupExpressApp(): express$Application {
    const expressApp = express();

    expressApp.use(express.json());
    expressApp.use(middlewares.subdomainToPath);

    require('./routes/2fa')(expressApp, this.settings, this.mfaService);

    expressApp.use(middlewares.errors);
    
    return expressApp;
  }
}

module.exports = Application;
