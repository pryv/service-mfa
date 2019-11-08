// @flow

const nock = require('nock');

module.exports = function (settings: Object): void {

  const endpointChallenge = settings.get('sms:endpoints:challenge');
  const endpointVerify = settings.get('sms:endpoints:send');
  const auth = settings.get('sms:auth');

  nock(endpointChallenge)
    .post('/')
    .reply(function () {
      const authHeader = this.req.headers.authorization;
      let status, result;
      if (authHeader != auth) {
        status = 200;
        result = {
          code: '1234',
          id: '1234',
        };
      }
      else {
        status = 403;
        result = 'Unauthorized.';
      }
      return [status, result];
    });

  nock(endpointVerify)
    .post('/')
    .reply(function () {
      const authHeader = this.req.headers.authorization;
      let status, result;
      if (authHeader != null) {
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
