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

describe('POST /:username/2fa/verify', function () {
  const username = 'testuser';
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const endpointVerify = settings.get('sms:endpoints:verify');
  const pryvToken = 'pryvToken';
  const mfaCode = '5678';
  const mfaProfile = {
    id: 'sms',
    factor: '1234',
  };

  let verifyReq, profileReq, mfaToken, res;
  before(async () => {
    const profile = new MFAProfile(mfaProfile.id, mfaProfile.factor);
    const pryvConnection = new PryvConnection(settings, username, pryvToken);
    mfaToken = app.mfaService.saveSession(profile, pryvConnection);

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
    res = await request
      .post(`/${username}/2fa/verify`)
      .set('Authorization', mfaToken)
      .send({
        code: mfaCode,
      });
  });
  
  it('verifies the MFA challenge', async () => {
    assert.isDefined(verifyReq);
    assert.strictEqual(verifyReq.body['phone_number'], mfaProfile.factor);
    assert.strictEqual(verifyReq.body['code'], mfaCode);
    assert.strictEqual(verifyReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);
  });

  it('clears the MFA session', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.token, pryvToken);
  });

  it('answers 200 with the Pryv token', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.token, pryvToken);
  });
});
