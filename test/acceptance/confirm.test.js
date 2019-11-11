// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const nock = require('nock');
const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

const username = 'testuser';
const coreEndpoint = `${settings.get('core:url')}/${username}`;
const endpointVerify = settings.get('sms:endpoints:verify');

describe('POST /:username/2fa/confirm', function () {

  let verifyReq, profileReq, mfaToken;
  before(async () => {
    const mfaProfile = new MFAProfile('sms', '1234');
    const pryvConnection = new PryvConnection(settings, username, 'pryvToken');
    mfaToken = app.mfaService.saveSession(mfaProfile, pryvConnection);

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
