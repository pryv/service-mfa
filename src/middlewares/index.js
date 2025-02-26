/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const errors = require('./errors');
const session = require('./session');
const subdomainToPath = require('./subdomainToPath');
const authorization = require('./authorization');
const commonHeaders = require('./commonHeaders');
module.exports = {
  errors,
  mfaSession: session,
  subdomainToPath,
  authorization,
  commonHeaders
};
