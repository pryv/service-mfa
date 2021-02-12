// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const DummySession = require('../fixture/DummySession');
const Mock = require('../fixture/Mock');
const supertest = require('supertest');

describe('POST /mfa/verify', function () {
  const username = 'testuser';
  const body = {code: '5678'};

  let settings, verifyEndpoint, request;

  before(async () => {
    await app.init();
    settings = app.settings;
    verifyEndpoint = settings.get('sms:endpoints:verify');
    request = supertest(app.express);
  });

  let verifyReq, res, session;
  before(async () => {
    session = new DummySession(app, username);
    new Mock(verifyEndpoint, '', 'POST', 200, {}, (req) => verifyReq = req);
    res = await request
      .post(`/${username}/mfa/verify`)
      .set('Authorization', session.mfaToken)
      .send(body);
  });
  
  it('verifies the challenge by the MFA external service', async () => {
    assert.isDefined(verifyReq);
    assert.deepEqual(verifyReq.body, Object.assign(body, session.profile.content));
    assert.strictEqual(verifyReq.headers['authorization'], settings.get('sms:auth'));
  });

  it('clears the MFA session', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.token, session.pryvConnection.token);
  });

  it('answers 200 with the Pryv token', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.token, session.pryvConnection.token);
  });

  describe('when the MFA session token is invalid', function () {

    let res;
    before(async () => {

      res = await request
        .post(`/${username}/mfa/verify`)
        .set('Authorization', 'invalidMfaToken')
        .send(body);
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, 'Invalid MFA session token.');
    });
  });

  describe('when the MFA verification fails', function () {
    const serviceError = { error: {
      id: 'invalid-code',
      message: 'Invalid MFA code.'}
    };

    let res;
    before(async () => {
      const mfaToken = new DummySession(app, username).mfaToken;
      new Mock(verifyEndpoint, '', 'POST', 404, serviceError);
      res = await request
        .post(`/${username}/mfa/verify`)
        .set('Authorization', mfaToken)
        .send({code: 'invalidCode'});
    });

    it('returns the MFA external service error', async () => {
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error.message, serviceError.error.message);
    });
  });
});
