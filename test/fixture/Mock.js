/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const nock = require('nock');
const querystring = require('querystring');

class Mock {

  constructor(endpoint: string, path: string, method: string, status: number, res: Object, cb?: (Object) => void, query?: mixed, times: number =1) {
    nock(endpoint)
      .intercept(path, method)
      .query(query)
      .times(times)
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, 
            this.req,
            {body: requestBody},
            {query: parseQueryString(this.req.path)},
          ));
        }
        return [status, res];
      });
  }
}
module.exports = Mock;

function parseQueryString(path) {
  const query = path.split('?')[1];
  if (query == null) return {};
  return querystring.parse(query);
}
