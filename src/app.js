// @flow

const express = require('express');
const middlewares = require('./middlewares');
const nconfSettings = require('./settings');
const MFAService = require('./business/mfa/Service');

class Application {
  express: express$Application;
  settings: Object;
  mfaService: MFAService;

  constructor() {
    this.settings = nconfSettings;
    this.mfaService = new MFAService(this.settings);
    this.express = this.setupExpressApp();
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

module.exports = Application;
