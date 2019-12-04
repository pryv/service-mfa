// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const DummySession = require('../fixture/DummySession');
const Mock = require('../fixture/Mock');

describe('POST /mfa/challenge', function () {
  const username = 'testuser';
  const challengeEndpoint = settings.get('sms:endpoints:challenge');
  const auth = settings.get('sms:auth');
  
  let challengeReq, res, session;
  before(async () => {
    session = new DummySession(app, username);
    new Mock(challengeEndpoint, '', 'POST', 200, {}, (req) => challengeReq = req);
    res = await request
      .post(`/${username}/mfa/challenge`)
      .set('Authorization', session.mfaToken)
      .send({});
  });

  it('triggers the MFA challenge', async () => {
    assert.isDefined(challengeReq);
    assert.deepEqual(challengeReq.body, session.profile.content);
    assert.strictEqual(challengeReq.headers['authorization'], auth);
  });

  it('answers 200 and asks to verify the MFA challenge', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'Please verify the MFA challenge.');
  });

  describe('when the MFA session token is invalid', function () {

    let res;
    before(async () => {
      res = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', 'invalidMfaToken')
        .send({});
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, 'Invalid MFA session token.');
    });
  });

  describe('when the MFA challenge fails', function () {
    const serviceError = { error: {
      id: 'unexpected',
      message: 'Could not trigger the challenge.'}
    };

    let res;
    before(async () => {
      const mfaToken = new DummySession(app, username).mfaToken;
      new Mock(challengeEndpoint, '', 'POST', 400, serviceError);
      res = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', mfaToken)
        .send({});
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.message, serviceError.error.message);
    });
  });
});
