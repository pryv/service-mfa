// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const Mock = require('../fixture/Mock');
const DummySession = require('../fixture/DummySession');

describe('POST /mfa/confirm', function () {
  const username = 'testuser';
  const verifyEndpoint = settings.get('sms:endpoints:verify');
  const coreEndpoint = `${settings.get('core:url')}/${username}`;
  const body = {code: '5678'};

  let verifyReq, profileReq, res, session;
  before(async () => {
    session = new DummySession(app, username);

    new Mock(verifyEndpoint, '', 'POST', 200, {}, (req) => verifyReq = req);
    new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => profileReq = req);

    res = await request
      .post(`/${username}/mfa/confirm`)
      .set('Authorization', session.mfaToken)
      .send(body);
  });

  it('verifies the MFA challenge', async () => {
    assert.isDefined(verifyReq);
    assert.deepEqual(verifyReq.body, Object.assign(body, session.profile.content));
    assert.strictEqual(verifyReq.headers['authorization'], settings.get('sms:auth'));
  });

  it('updates the Pryv profile with the MFA parameters', async () => {
    assert.isDefined(profileReq);
    assert.strictEqual(profileReq.headers['authorization'], session.pryvConnection.token);
    assert.deepEqual(profileReq.body.mfa, session.profile.content);
  });

  it('clears the MFA session', async () => {
    const retrievedSession = app.mfaService.getSession(session.mfaToken);
    assert.isUndefined(retrievedSession);
  });

  it('answers 200 and confirms that MFA is activated', async () => {
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'MFA activated.');
  });

  describe('when the MFA session token is invalid', function () {

    let res;
    before(async () => {
      res = await request
        .post(`/${username}/mfa/confirm`)
        .set('Authorization', 'invalidMfaToken')
        .send({body});
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
        .post(`/${username}/mfa/confirm`)
        .set('Authorization', mfaToken)
        .send({code: 'invalidCode'});
    });

    it('returns the MFA external service error', async () => {
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error.message, serviceError.error.message);
    });
  });
});
