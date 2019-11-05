// @flow

const errorsFactory = require('../utils/errorsHandling').factory;
const middlewares = require('../middlewares');

module.exports = function (expressApp: express$Application, settings: Object) {

  expressApp.all('/2fa', middlewares.authorization(settings));

  // GET /2fa: 2fa route
  expressApp.get('/2fa', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    try {
      res.status(200).send('ok');
    } catch (err) {
      next(err);
    }
  });
};
