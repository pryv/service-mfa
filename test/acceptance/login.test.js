// @flow

/*global describe, it, before */

describe('POST /auth/login', function () {
  const username = 'testuser';
  let settings, coreEndpoint, request, loginHeaders;

  before(async () => {
    await app.init();
    settings = app.settings;
    coreEndpoint = `${settings.get('core:url')}/${username}`;
    request = supertest(app.express);
    loginHeaders = {
      origin: coreEndpoint,
    };
  });

  const loginParams = {
    username: username,
    password: 'testpassword',
    appId: 'pryv-test',
  };
  const pryvToken = 'pryvToken';
  const profileContent = {
    phone_number: '1234'
  };

  describe('when MFA is not activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      new Mock(coreEndpoint, '/auth/login', 'POST', 200, {token: pryvToken, apiEndpoint: 'http://' + pryvToken + '@dummy/dummy', meta: { serial: '00000'}}, (req) => loginReq = req);
      new Mock(coreEndpoint, '/profile/private', 'GET', 200, {profile: {}}, (req) => profileReq = req);

      res = await request
        .post(`/${username}/login`)
        .set(loginHeaders)
        .send(loginParams);
    });

    it('forwards the login call to Pryv', async () => {
      assert.isDefined(loginReq);
      assert.deepEqual(loginReq.body, loginParams);
      assert.strictEqual(loginReq.headers.origin, loginHeaders.origin);
    });

    it('retrieves the Pryv private profile', async () => {
      assert.isDefined(profileReq);
      assert.strictEqual(profileReq.headers['authorization'], pryvToken);
    });

    it('simply returns the Pryv token', async () => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.token, pryvToken);
      assert.strictEqual(res.body.apiEndpoint, 'http://' + pryvToken + '@dummy/dummy');
      assert.exists(res.body.meta);
    });
  });

  describe('when MFA is activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      new Mock(coreEndpoint, '/auth/login', 'POST', 200, {token: pryvToken}, (req) => loginReq = req);
      new Mock(coreEndpoint, '/profile/private', 'GET', 200, {profile: {mfa: {content: profileContent}}}, (req) => profileReq = req);
      res = await request
        .post(`/${username}/login`)
        .send(loginParams);
    });

    it('forwards the login call to Pryv', async () => {
      assert.isDefined(loginReq);
      assert.deepEqual(loginReq.body, loginParams);
    });

    it('retrieves the Pryv private profile', async () => {
      assert.isDefined(profileReq);
      assert.strictEqual(profileReq.headers['authorization'], pryvToken);
    });

    it('answers 302 with a generated MFA session token', async () => {
      assert.strictEqual(res.status, 302);
      assert.isDefined(res.body.mfaToken);
    });

    it('saves the profile and Pryv connection in the MFA session', async () => {
      const session = app.mfaService.getSession(res.body.mfaToken);
      assert.isDefined(session);
      const profile = session.profile;
      const pryvConnection = session.pryvConnection;
      assert.isDefined(profile);
      assert.isDefined(pryvConnection);
      assert.deepEqual(profile.content, profileContent);
      assert.strictEqual(pryvConnection.username, username);
      assert.strictEqual(pryvConnection.token, pryvToken);
    });
  });

  describe('when the Pryv connection is invalid', function () {
    const pryvError = { 
      error: {
        id: 'invalid-credentials',
        message: 'The given username/password pair is invalid.'
      },
      meta: { 
        dummy: 'dummy'
      }
    };
    
    let res;
    before(async () => {
      new Mock(coreEndpoint, '/auth/login', 'POST', 401, pryvError);
      res = await request
        .post(`/${username}/login`)
        .send({});
    });

    it('returns the Pryv error', async () => {
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.error.message, pryvError.error.message);
      assert.strictEqual(res.body.error.id, pryvError.error.id);
      assert.exists(res.body.meta);
    });
  });
});
