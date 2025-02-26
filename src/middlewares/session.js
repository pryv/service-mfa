/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
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
