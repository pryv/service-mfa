// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const Mock = require('../fixture/Mock');

describe('POST /mfa/deactivate', function () {
  const username = 'testuser';
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const pryvToken = 'validToken';

  let profileReq, res;
  before(async () => {

    new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => profileReq = req);

    res = await request
      .post(`/${username}/mfa/deactivate`)
      .set('Authorization', pryvToken)
      .send();
  });

  it('clears the MFA field in the Pryv profile', async () => {
    assert.isDefined(profileReq);
    assert.deepEqual(profileReq.body, {mfa: null});
    assert.strictEqual(profileReq.headers['authorization'], pryvToken);
  });

  it('answers 200 and confirms that MFA is deactivated', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'MFA deactivated.');
  });

  describe('when the Pryv connection is invalid', function () {
    const pryvError = { error: {
      id: 'invalid-access-token',
      message: 'Cannot find access from token.'}
    };

    let res;
    before(async () => {
      new Mock(coreEndpoint, '/profile/private', 'PUT', 403, pryvError);
      res = await request
        .post(`/${username}/mfa/deactivate`)
        .set('Authorization', 'invalidToken')
        .send();
    });

    it('returns the Pryv error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, pryvError.error.message);
    });
  });
});
