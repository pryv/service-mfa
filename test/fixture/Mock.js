// @flow

const nock = require('nock');

class Mock {

  constructor(endpoint: string, path: string, method: string, status: number, res: Object, cb?: (Object) => void) {
    nock(endpoint)
      .intercept(path, method)
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, this.req, {body: requestBody}));
        }
        return [status, res];
      });
  }
}

module.exports = Mock;
