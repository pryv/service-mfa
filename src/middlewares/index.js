/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errors = require('./errors');
const session = require('./session');
const subdomainToPath = require('./subdomainToPath');
const authorization = require('./authorization');
const commonHeaders = require('./commonHeaders');
module.exports = {
  errors: errors,
  mfaSession: session,
  subdomainToPath: subdomainToPath,
  authorization: authorization,
  commonHeaders: commonHeaders
};
