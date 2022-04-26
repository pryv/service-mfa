/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
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
