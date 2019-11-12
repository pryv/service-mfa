// @flow

const nock = require('nock');

class AccessInfoMock {

  constructor(settings: Object, username: string, cb: (Object) => void) {
    nock(`${settings.get('core:url')}/${username}`)
      .get('/access-info')
      .reply(function () {
        if (typeof cb === 'function') cb(this.req);
        const authHeader = this.req.headers.authorization;
        if (authHeader !== 'validToken') {
          return [403, {
            error: {
              id: 'invalid-access-token',
              message:'Cannot find access from token.'}}
          ];
        }
        return [200, {}];
      });
  }
}

module.exports = AccessInfoMock;
