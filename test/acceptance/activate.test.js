// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const nock = require('nock');

describe('POST /mfa/activate', function () {

  const username = 'testuser';
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const endpointChallenge = settings.get('sms:endpoints:challenge');
  const pryvToken = 'pryvToken';
  const mfaProfile = {
    id: 'sms',
    factor: '1234',
  };

  let authReq, challengeReq, res;
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
    res = await request
      .post(`/${username}/mfa/activate`)
      .set('Authorization', pryvToken)
      .send({
        phone: mfaProfile.factor,
      });
  });

  it('checks the validity of the provided Pryv token', async () => {
    assert.isDefined(authReq);
    assert.strictEqual(authReq.headers['authorization'], pryvToken);
  });

  it('triggers the MFA challenge', async () => {
    assert.isDefined(challengeReq);
    assert.strictEqual(challengeReq.body['phone_number'], mfaProfile.factor);
    assert.strictEqual(challengeReq.headers['authorization'], `Bearer ${settings.get('sms:auth')}`);
  });

  it('answers 302 with a generated MFA session token', async () => {
    assert.strictEqual(res.status, 302);
    assert.isDefined(res.body.mfaToken);
  });
});