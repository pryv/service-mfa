// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const AccessInfoMock = require('../fixture/AccessInfoMock');
const ChallengeMock = require('../fixture/ChallengeMock');

describe('POST /mfa/activate', function () {

  const username = 'testuser';
  const pryvToken = 'validToken';
  const mfaProfile = {
    id: 'sms',
    factor: '1234',
  };

  let authReq, challengeReq, res;
  before(async () => {
    new AccessInfoMock(settings, username, (req) => authReq = req);
    new ChallengeMock(settings, (req) => challengeReq = req);
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

  describe('when the Pryv connection is invalid', function () {

    let res;
    before(async () => {
      new AccessInfoMock(settings, username);
      res = await request
        .post(`/${username}/mfa/activate`)
        .set('Authorization', 'invalidToken')
        .send({
          phone: mfaProfile.factor,
        });
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, 'Cannot find access from token.');
    });
  });
});