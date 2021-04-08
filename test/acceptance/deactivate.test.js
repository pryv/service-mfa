// @flow

/*global describe, it, before */

describe('POST /mfa/deactivate', function () {
  let settings, coreEndpoint, request;
  const username = 'testuser';
  const pryvToken = 'validToken';

  before(async () => {
    await app.init();
    settings = app.settings;
    coreEndpoint = `${settings.get('core:url')}/${username}`;
    request = supertest(app.express);
  });

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
