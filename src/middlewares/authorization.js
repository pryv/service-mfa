/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errorsFactory = require('../utils/errorsHandling').factory;

/**
 * Middleware that verifies the presence of an authorization token
 * @param {express$Request} req
 * @param {express$Response} res
 * @param {express$NextFunction} next
 */
module.exports = (req, res, next) => {
  let authHeader = req.headers.authorization;
  const authQuery = req.query.auth;
  if (
    (authHeader == null || authHeader === '') &&
    (authQuery == null || authQuery === '')
  ) {
    return next(
      errorsFactory.unauthorized(
        "Missing 'Authorization' header or 'auth' query parameter."
      )
    );
  }
  // Basic auth support
  // See service-core/components/middleware/src/initContext.js for reference
  if (authHeader != null) {
    const authBasic = authHeader.split(' ');
    if (authBasic[0].toLowerCase() === 'basic' && authBasic[1] != null) {
      // Note: since our Basic scheme do not contain the username, the token is in first position
      // example: https://token@username.pryv.me/
      authHeader = Buffer.from(authBasic[1], 'base64')
        .toString('ascii')
        .split(':')[0];
    }
  }
  // Set authorization token in the context
  const auth = authHeader || authQuery;
  req.context = Object.assign({}, req.context, { auth });
  next();
};
