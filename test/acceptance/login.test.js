// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const nock = require('nock');

const username = 'testuser';
const coreEndpoint = `${settings.get('core:url')}/${username}`;

describe('POST /:username/2fa/login', function () {

  describe('When 2FA is not activated', function () {

    let loginReq, profileReq;
    before(async () => {
      nock(coreEndpoint)
        .post('/auth/login')
        .reply(function (uri, requestBody) {
          loginReq = this.req;
          loginReq.body = requestBody;
          return [200, {token: 'pryvToken'}];
        });
      nock(coreEndpoint)
        .get('/profile/private')
        .reply(function () {
          profileReq = this.req;
          return [200, {profile: {}}];
        });
    });

    it('returns the Pryv token', async () => {
      const res = await request
        .post(`/${username}/login`)
        .send({
          username: 'testuser',
          password: 'testpassword',
          appId: 'pryv-test'
        });

      assert.isDefined(loginReq);
      assert.strictEqual(loginReq.body.username, 'testuser');
      assert.strictEqual(loginReq.body.password, 'testpassword');
      assert.strictEqual(loginReq.body.appId, 'pryv-test');

      assert.isDefined(profileReq);
      assert.strictEqual(profileReq.headers['authorization'], 'pryvToken');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.token, 'pryvToken');
    });
  });

  describe('When 2FA is activated', function () {

    let loginReq, profileReq;
    before(async () => {
      nock(coreEndpoint)
        .post('/auth/login')
        .reply(function (uri, requestBody) {
          loginReq = this.req;
          loginReq.body = requestBody;
          return [200, {token: 'pryvToken'}];
        });
      nock(coreEndpoint)
        .get('/profile/private')
        .reply(function () {
          profileReq = this.req;
          return [200, {
            profile: {
              mfa: {
                id: 'sms',
                factor: '1234',
              }
            }
          }];
        });
    });

    it('proceeds to the 2FA challenge', async () => {
      const res = await request
        .post(`/${username}/login`)
        .send({
          username: 'testuser',
          password: 'testpassword',
          appId: 'pryv-test'
        });

      assert.isDefined(loginReq);
      assert.strictEqual(loginReq.body.username, 'testuser');
      assert.strictEqual(loginReq.body.password, 'testpassword');
      assert.strictEqual(loginReq.body.appId, 'pryv-test');

      assert.isDefined(profileReq);
      assert.strictEqual(profileReq.headers['authorization'], 'pryvToken');

      assert.strictEqual(res.status, 302);
      const mfaToken = res.text;

      const session = app.mfaService.getSession(mfaToken);
      assert.isDefined(session);
      const profile = session.profile;
      const connection = session.connection;
      assert.isDefined(profile);
      assert.isDefined(connection);
      assert.strictEqual(profile.id, 'sms');
      assert.strictEqual(profile.factor, '1234');
      assert.strictEqual(connection.username, username);
      assert.strictEqual(connection.token, 'pryvToken');
    });
  });
});