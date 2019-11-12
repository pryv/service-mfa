// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');
const Mock = require('../fixture/Mock');

describe('POST /mfa/confirm', function () {
  const username = 'testuser';
  const verifyEndpoint = settings.get('sms:endpoints:verify');
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const mfaCode = '5678';
  const mfaProfile = {
    id: 'sms',
    factor: '1234',
  };
  const pryvToken = 'pryvToken';

  let verifyReq, profileReq, mfaToken, res;
  before(async () => {
    const profile = new MFAProfile(mfaProfile.id, mfaProfile.factor);
    const pryvConnection = new PryvConnection(settings, username, pryvToken);
    mfaToken = app.mfaService.saveSession(profile, pryvConnection);

    new Mock(verifyEndpoint, '', 'POST', 200, {}, (req) => verifyReq = req);
    new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => profileReq = req);

    res = await request
      .post(`/${username}/mfa/confirm`)
      .set('Authorization', mfaToken)
      .send({code: mfaCode});
  });

  it('verifies the MFA challenge', async () => {
    assert.isDefined(verifyReq);
    assert.strictEqual(verifyReq.body['phone_number'], mfaProfile.factor);
    assert.strictEqual(verifyReq.body['code'], mfaCode);
    assert.strictEqual(verifyReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);
  });

  it('updates the Pryv profile with the MFA parameters', async () => {
    assert.isDefined(profileReq);
    assert.strictEqual(profileReq.headers['authorization'], pryvToken);
    assert.deepEqual(profileReq.body.mfa, mfaProfile);
  });

  it('clears the MFA session', async () => {
    const session = app.mfaService.getSession(mfaToken);
    assert.isUndefined(session);
  });

  it('answers 200 and confirms that MFA is activated', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'MFA activated.');
  });
});
