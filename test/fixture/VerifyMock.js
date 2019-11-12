// @flow

const nock = require('nock');

class VerifyMock {

  constructor(settings: Object, username: string, cb: (Object) => void) {
    nock(settings.get('sms:endpoints:verify'))
      .post('')
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, this.req, {body: requestBody}));
        }
        return [200, {}];
      });
  }
}

module.exports = VerifyMock;
