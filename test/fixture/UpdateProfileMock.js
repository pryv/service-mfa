// @flow

const nock = require('nock');

class UpdateProfileMock {

  constructor(settings: Object, username: string, cb: (Object) => void) {
    nock(`${settings.get('core:url')}/${username}`)
      .put('/profile/private')
      .reply(function (uri, requestBody) {
        if (typeof cb === 'function') {
          cb(Object.assign({}, this.req, {body: requestBody}));
        }
        return [200, {}];
      });
  }
}

module.exports = UpdateProfileMock;
