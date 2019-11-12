// @flow

const nock = require('nock');

class LoginMock {

  constructor(settings: Object, username: string, pryvToken: string, cb?: (Object) => void) {
    nock(`${settings.get('core:url')}/${username}`)
      .post('/auth/login')
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, this.req, {body: requestBody}));
        }
        return [200, {token: pryvToken}];
      });
  }
}

module.exports = LoginMock;
