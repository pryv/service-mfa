// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const nock = require('nock');

describe('POST /:username/2fa/login', function () {
  const username = 'testuser';
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const loginParams = {
    username: 'testuser',
    password: 'testpassword',
    appId: 'pryv-test'
  };
  const pryvToken = 'pryvToken';
  const mfaProfile = {
    id: 'sms',
    factor: '1234',
  };

  describe('When 2FA is not activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      nock(coreEndpoint)
        .post('/auth/login')
        .reply(function (uri, requestBody) {
          loginReq = this.req;
          loginReq.body = requestBody;
          return [200, {token: pryvToken}];
        });
      nock(coreEndpoint)
        .get('/profile/private')
        .reply(function () {
          profileReq = this.req;
          return [200, {profile: {}}];
        });
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

    it('simply returns the Pryv token', async () => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.token, pryvToken);
    });
  });

  describe('When 2FA is activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      nock(coreEndpoint)
        .post('/auth/login')
        .reply(function (uri, requestBody) {
          loginReq = this.req;
          loginReq.body = requestBody;
          return [200, {token: pryvToken}];
        });
      nock(coreEndpoint)
        .get('/profile/private')
        .reply(function () {
          profileReq = this.req;
          return [200, {
            profile: {mfa: mfaProfile},
          }];
        });
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
      const connection = session.connection;
      assert.isDefined(profile);
      assert.isDefined(connection);
      assert.deepEqual(profile, mfaProfile);
      assert.strictEqual(connection.username, username);
      assert.strictEqual(connection.token, pryvToken);
    });
  });
});