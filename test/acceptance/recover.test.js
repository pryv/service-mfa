// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const Mock = require('../fixture/Mock');
const supertest = require('supertest');

describe('POST /mfa/recover', function () {
  let settings, coreEndpoint, request, loginHeaders;
  const username = 'testuser';
 
  before(async () => {
    await app.init();
    settings = app.settings;
    coreEndpoint = `${settings.get('core:url')}/${username}`;
    request = supertest(app.express);
    loginHeaders = {
      origin: coreEndpoint,
    };
  });

  const pryvToken = 'validToken';
  const recoveryCode = 'validCode';
  const loginParams = {
    username: username,
    password: 'testpassword',
    appId: 'pryv-test',
  };

  let loginReq, fetchProfileReq, updateProfileReq, res;
  before(async () => {

    new Mock(coreEndpoint, '/auth/login', 'POST', 200, {token: pryvToken}, (req) => loginReq = req);
    new Mock(coreEndpoint, '/profile/private', 'GET', 200, {profile: {mfa: {recoveryCodes: [recoveryCode]}}}, (req) => fetchProfileReq = req);
    new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => updateProfileReq = req);

    res = await request
      .post(`/${username}/mfa/recover`)
      .set(loginHeaders)
      .send(Object.assign({}, loginParams, {recoveryCode: recoveryCode}));
  });

  it('forwards the login call to Pryv', async () => {
    assert.isDefined(loginReq);
    assert.deepEqual(loginReq.body, loginParams);
    assert.strictEqual(loginReq.headers.origin, loginHeaders.origin);
  });

  it('retrieves the Pryv private profile', async () => {
    assert.isDefined(fetchProfileReq);
    assert.strictEqual(fetchProfileReq.headers['authorization'], pryvToken);
  });

  it('clears the MFA field in the Pryv profile', async () => {
    assert.isDefined(updateProfileReq);
    assert.deepEqual(updateProfileReq.body, {mfa: null});
    assert.strictEqual(updateProfileReq.headers['authorization'], pryvToken);
  });

  it('answers 200 and confirms that MFA is deactivated', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'MFA deactivated.');
  });

  describe('when the recovery code is missing', function () {
    let res;
    before(async () => {
      res = await request
        .post(`/${username}/mfa/recover`)
        .set(loginHeaders)
        .send(loginParams);
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.message, 'Missing parameter: recoveryCode.');
    });
  });

  describe('when the recovery code is invalid', function () {
    let res;
    before(async () => {
      new Mock(coreEndpoint, '/auth/login', 'POST', 200, {token: pryvToken}, (req) => loginReq = req);
      new Mock(coreEndpoint, '/profile/private', 'GET', 200, {profile: {mfa: {recoveryCodes: [recoveryCode]}}}, (req) => fetchProfileReq = req);

      res = await request
        .post(`/${username}/mfa/recover`)
        .set(loginHeaders)
        .send(Object.assign({}, loginParams, {recoveryCode: 'invalidCode'}));
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.message, 'Invalid recovery code.');
    });
  });

  describe('when the Pryv connection is invalid', function () {
    const pryvError = { error: {
      id: 'invalid-credentials',
      message: 'The given username/password pair is invalid.'}
    };
    
    let res;
    before(async () => {
      new Mock(coreEndpoint, '/auth/login', 'POST', 401, pryvError);
      res = await request
        .post(`/${username}/mfa/recover`)
        .send(Object.assign({}, loginParams, {recoveryCode: recoveryCode}));
    });

    it('returns the Pryv error', async () => {
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.error.message, pryvError.error.message);
    });
  });
});
