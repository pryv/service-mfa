/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

/**
 * Middleware that checks if a session corresponding to the provided MFA token exists.
 * @param {Service} mfaService
 */
module.exports = (mfaService) => {
  /**
   * @param {express$Request} req
   * @param {express$Response} res
   * @param {express$NextFunction} next
   */
  return async (req, res, next) => {
    const mfaSession = mfaService.getSession(req.context.auth);
    if (mfaSession == null) {
      return next(errorsFactory.unauthorized('Invalid MFA session token.'));
    }
    req.context = Object.assign({}, req.context, { session: mfaSession });
    next();
  };
};
