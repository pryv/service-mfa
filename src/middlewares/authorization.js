// @flow

const errorsFactory = require('../utils/errorsHandling').factory;

// Middleware that authenticates requesting clients
// 
module.exports = (settings: Object) => {
  return (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const auth = req.headers.authorization || req.query.auth;
    if (auth == null) {
      return next(errorsFactory.unauthorized("Missing 'Authorization' header or 'auth' query parameter."));
    }

    // Set auth token in the context
    req.context = Object.assign({}, req.context, {token: auth});

    next();
  };
};
