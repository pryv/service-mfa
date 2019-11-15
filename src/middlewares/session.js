// @flow

const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

import type Service from '../business/mfa/Service';

// Middleware that checks if a session corresponding to the provided MFA token exists.
// 
module.exports = (mfaService: Service) => {
  return async (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const mfaSession = mfaService.getSession(req.context.auth);
    if (mfaSession == null) {
      return next(errorsFactory.unauthorized('Invalid MFA session token.'));
    }
    req.context = Object.assign({}, req.context, {session: mfaSession});
    next();
  };
};
