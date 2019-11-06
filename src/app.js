// @flow

const express = require('express');
const middlewares = require('./middlewares');
const nconfSettings = require('./settings');

class Application {
  express: express$Application;
  settings: Object;

  constructor() {
    this.settings = nconfSettings;
    this.express = this.setupExpressApp(this.settings);
  }

  setupExpressApp(settings: Object): express$Application {
    const expressApp = express();
    const cache = {};

    expressApp.use(express.json());

    require('./routes/2fa')(expressApp, settings, cache);

    expressApp.use(middlewares.errors);
    
    return expressApp;
  }
}

module.exports = Application;
