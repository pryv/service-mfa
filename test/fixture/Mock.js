/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const nock = require('nock');
const querystring = require('querystring');

class Mock {
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
  constructor(endpoint, path, method, status, res, cb, query, times = 1) {
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
  }
}
module.exports = Mock;

/**
 * @returns {any}
 */
function parseQueryString(path) {
  const query = path.split('?')[1];
  if (query == null) return {};
  return querystring.parse(query);
}
