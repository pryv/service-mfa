/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const nock = require('nock');
const querystring = require('querystring');

/**
 * @param {string} endpoint
 * @param {string} path
 * @param {string} method
 * @param {number} status
 * @param {*} res
 * @param {(a: any) => void} cb
 * @param {*} query
 * @param {number} times
 */
module.exports = function mock (endpoint, path, method, status, res, cb, query, times = 1) {
  nock(endpoint)
    .intercept(path, method)
    .query(query)
    .times(times)
    .reply(function (uri, requestBody) {
      if (typeof cb === 'function') {
        cb(
          Object.assign(
            {},
            this.req,
            { body: requestBody },
            { query: parseQueryString(this.req.path) }
          )
        );
      }
      return [status, res];
    });
};

/**
 * @returns {any}
 */
function parseQueryString (path) {
  const query = path.split('?')[1];
  if (query == null) return {};
  return querystring.parse(query);
}
