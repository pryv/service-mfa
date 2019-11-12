// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const settings = app.settings;
const request = require('supertest')(app.express);
const LoginMock = require('../fixture/LoginMock');
const GetProfileMock = require('../fixture/GetProfileMock');

describe('POST /mfa/login', function () {
  const username = 'testuser';
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

  describe('when MFA is not activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      new LoginMock(settings, username, pryvToken, (req) => loginReq = req);
      new GetProfileMock(settings, username, {}, (req) => profileReq = req);
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

  describe('when MFA is activated', function () {

    let loginReq, profileReq, res;
    before(async () => {
      new LoginMock(settings, username, pryvToken, (req) => loginReq = req);
      new GetProfileMock(settings, username, mfaProfile, (req) => profileReq = req);
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