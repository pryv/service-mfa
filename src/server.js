// @flow

const Application = require('./app');
const logger = require('@pryv/boiler').getLogger('server');

(async () => {
  // Launch the app and server
  const app = await (new Application()).init();
  const settings = app.settings;
  const port = settings.get('http:port');
  const ip = settings.get('http:ip');

  app.express.listen(port, ip, () => {
    logger.info(`Server running on: ${ip}:${port}`);
  });
})();



