// @flow
const path = require('path');
const { getConfig } = require('@pryv/boiler').init({
  appName: 'service-mfa',
  baseConfigDir: path.resolve(__dirname, '../config/')
});


const express = require('express');
const middlewares = require('./middlewares');
const MFAService = require('./business/mfa/Service');

class Application {
  express: express$Application;
  settings: Object;
  mfaService: MFAService;

  constructor() {

  }

  async init() {
    this.settings = await getConfig();
    this.mfaService = new MFAService(this.settings);
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

module.exports = Application;
