// @flow

const nock = require('nock');
const settings = require('../../src/settings');

module.exports = function (): void {
  nock(settings.get('sms:url'))
    .post('/verify')
    .reply(function () {
      const auth = this.req.headers.authorization;
      let status, result;
      if (auth != null) {
        status = 200;
        result = 'OK';
      }
      else {
        status = 403;
        result = 'Unauthorized.';
      }
      return [status, result];
    });
};
