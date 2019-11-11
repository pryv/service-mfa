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
const endpointVerify = settings.get('sms:endpoints:verify');
const endpointChallenge = settings.get('sms:endpoints:challenge');
let mfaToken;

describe('POST /:username/2fa/activate', function () {

  let authReq, challengeReq;
  before(async () => {
    nock(coreEndpoint)
      .get('/access-info')
      .reply(function () {
        authReq = this.req;
        return [200, {}];
      });
    nock(endpointChallenge)
      .post('')
      .reply(function (uri, requestBody) {
        challengeReq = this.req;
        challengeReq.body = requestBody;
        return [200, {}];
      });
  });

  it('proceeds to the activation of 2FA for current user', async () => {
    const res = await request
      .post(`/${username}/2fa/activate`)
      .set('Authorization', 'pryvToken')
      .send({
        phone: '1234'
      });

    assert.isDefined(authReq);
    assert.strictEqual(authReq.headers['authorization'], 'pryvToken');

    assert.isDefined(challengeReq);
    assert.strictEqual(challengeReq.body['phone_number'], '1234');
    assert.strictEqual(challengeReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);

    assert.strictEqual(res.status, 302);
    mfaToken = res.text;

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

describe('POST /:username/2fa/confirm', function () {
  let verifyReq, profileReq;
  before(async () => {
    nock(endpointVerify)
      .post('')
      .reply(function (uri, requestBody) {
        verifyReq = this.req;
        verifyReq.body = requestBody;
        return [200, {}];
      });
    nock(coreEndpoint)
      .put('/profile/private')
      .reply(function (uri, requestBody) {
        profileReq = this.req;
        profileReq.body = requestBody;
        return [200, {}];
      });
  });

  it('confirms the activation of 2FA for current user', async () => {
    const res = await request
      .post(`/${username}/2fa/confirm`)
      .set('Authorization', mfaToken)
      .send({
        code: '5678',
      });

    assert.isDefined(verifyReq);
    assert.strictEqual(verifyReq.body['phone_number'], '1234');
    assert.strictEqual(verifyReq.body['code'], '5678');
    assert.strictEqual(verifyReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);

    assert.isDefined(profileReq);
    assert.strictEqual(profileReq.headers['authorization'], 'pryvToken');
    assert.deepEqual(profileReq.body.mfa, {
      id: 'sms',
      factor: '1234',
    });

    const session = app.mfaService.getSession(mfaToken);
    assert.isUndefined(session);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'MFA activated.');
  });
});
