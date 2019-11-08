// @flow

const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

import type Service from '../business/mfa/Service';

// Auth middleware that checks if a session that corresponds to the provided mfaToken exists.
// 
module.exports = (mfaService: Service) => {
  return async (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const mfaToken = req.header('Authorization') || req.query.auth;
    const mfaSession = mfaService.getSession(mfaToken);
    if (mfaSession == null) {
      return next(errorsFactory.unauthorized('Invalid MFA authorization token.'));
    }
    req.context = Object.assign({}, req.context, {session: mfaSession});
    next();
  };
};
