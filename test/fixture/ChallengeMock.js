// @flow

const nock = require('nock');

class ChallengeMock {

  constructor(settings: Object, cb: (Object) => void) {
    nock(settings.get('sms:endpoints:challenge'))
      .post('')
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, this.req, {body: requestBody}));
        }
        return [200, {}];
      });
  }
}

module.exports = ChallengeMock;
