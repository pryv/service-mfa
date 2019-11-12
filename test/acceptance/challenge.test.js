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

describe('POST /mfa/challenge', function () {
  const challengeEndpoint = settings.get('sms:endpoints:challenge');
  const username = 'testuser';
  const apiKey = settings.get('sms:auth');

  let challengeReq, mfaToken, res;
  before(async () => {
    const mfaProfile = new MFAProfile('sms', '1234');
    const pryvConnection = new PryvConnection(settings, username, 'pryvToken');
    mfaToken = app.mfaService.saveSession(mfaProfile, pryvConnection);

    new Mock(challengeEndpoint, '', 'POST', 200, {}, (req) => challengeReq = req);
    res = await request
      .post(`/${username}/mfa/challenge`)
      .set('Authorization', mfaToken)
      .send({});
  });

  it('triggers the MFA challenge', async () => {
    assert.isDefined(challengeReq);
    assert.strictEqual(challengeReq.body.phone_number, '1234');
    assert.strictEqual(challengeReq.headers['authorization'], `Bearer ${apiKey}`);
  });

  it('answers 200 and asks to verify the MFA challenge', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'Please verify MFA challenge.');
  });
});
