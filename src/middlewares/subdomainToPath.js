/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errors = require('../utils/errorsHandling').factory;
/**
 * Middleware to translate the subdomain (i.e. username) in requests (if any) into the URL path
 * See service-core/components/middleware/src/subdomainToPath.js for reference
 * @param {express$Request} req
 * @param {express$Response} res
 * @param {express$NextFunction} next
 */
module.exports = function (req, res, next) {
  if (!req.headers.host) {
    return next(errors.missingHeader('Host'));
  }

  const hostChunks = req.headers.host.split('.');
  // check for subdomain, assuming we have structure '<subdomain>.<2nd level domain>.<tld>
  if (hostChunks.length < 3) return next();

  // For security reasons, don't allow inserting anything into path unless it
  // looks like a user name.
  const firstChunk = hostChunks[0];
  if (!looksLikeUsername(firstChunk)) return next();

  // Skip if it is already in the path.
  const pathPrefix = `/${firstChunk}`;
  if (req.url.startsWith(pathPrefix)) return next();

  req.url = pathPrefix + req.url;
  next();
};

const USERNAME_MIN_LENGTH = 5;
const USERNAME_MAX_LENGTH = 60;
const USERNAME_REGEXP_STR =
  '^[a-z0-9]' +
  '[a-z0-9-]{' +
  (USERNAME_MIN_LENGTH - 2) +
  ',' +
  (USERNAME_MAX_LENGTH - 2) +
  '}' +
  '[a-z0-9]$';

/**
 * @param {string} candidate
 * @returns {boolean}
 */
function looksLikeUsername(candidate) {
  const reUsername = new RegExp(USERNAME_REGEXP_STR);
  const lowercasedUsername = candidate.toLowerCase(); // for retro-compatibility
  return reUsername.test(lowercasedUsername);
}
