// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const nock = require('nock');

const username = 'testuser';

describe('POST /:username/2fa/activate', function () {

  let authReq, challengeReq;
  before(async () => {
    const coreEndpoint = `${settings.get('core:url')}/${username}`;
    nock(coreEndpoint)
      .get('/access-info')
      .reply(function () {
        authReq = this.req;
        return [200, {}];
      });
    const endpointChallenge = settings.get('sms:endpoints:challenge');
    nock(endpointChallenge)
      .post('')
      .reply(function (uri, requestBody) {
        challengeReq = this.req;
        challengeReq.body = requestBody;
        return [200, {
          id: 'challengeId',
        }];
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

    assert.strictEqual(challengeReq.body['phone_number'], '1234');
    assert.strictEqual(challengeReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);

    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.text, 'challengeId');
  });
});

describe('POST /:username/2fa/confirm', function () {
  let authReq, verifyReq, profileReq;
  before(async () => {
    const coreEndpoint = `${settings.get('core:url')}/${username}`;
    nock(coreEndpoint)
      .get('/access-info')
      .reply(function () {
        authReq = this.req;
        return [200, {}];
      });
    const endpointVerify = settings.get('sms:endpoints:verify');
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
      .set('Authorization', 'pryvToken')
      .send({
        phone: '1234',
        code: '5678',
      });

    assert.isDefined(authReq);
    assert.strictEqual(authReq.headers['authorization'], 'pryvToken');

    assert.strictEqual(verifyReq.body['phone_number'], '1234');
    assert.strictEqual(verifyReq.body['code'], '5678');
    assert.strictEqual(verifyReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'MFA activated.');
  });
});
