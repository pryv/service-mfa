// @flow

const nock = require('nock');

class GetProfileMock {

  constructor(settings: Object, username: string, profile: Object, cb: (Object) => void) {
    nock(`${settings.get('core:url')}/${username}`)
      .get('/profile/private')
      .reply(function () {
        if (typeof cb === 'function') cb(this.req);
        return [200, {
          profile: {mfa: profile},
        }];
      });
  }
}

module.exports = GetProfileMock;
