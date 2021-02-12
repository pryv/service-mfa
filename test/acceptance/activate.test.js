// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const Mock = require('../fixture/Mock');
const supertest = require('supertest');

describe('POST /mfa/activate', function () {
  let settings, coreEndpoint, challengeEndpoint, request;
  const username = 'testuser';
  const pryvToken = 'validToken';
  const profileContent = {
    phone: '1234'
  };

  before(async () => {
    await app.init();
    settings = app.settings;
    coreEndpoint = `${settings.get('core:url')}/${username}`;
    challengeEndpoint = settings.get('sms:endpoints:challenge');
    request = supertest(app.express);
  });

  let accessInfoReq, challengeReq, res;
  before(async () => {
    new Mock(coreEndpoint, '/access-info', 'GET', 200, {token: pryvToken}, (req) => accessInfoReq = req);
    new Mock(challengeEndpoint, '', 'POST', 200, {}, (req) => challengeReq = req);
    res = await request
      .post(`/${username}/mfa/activate`)
      .set('Authorization', pryvToken)
      .send(profileContent);
  });

  it('checks the validity of the provided Pryv token', async () => {
    assert.isDefined(accessInfoReq);
    assert.strictEqual(accessInfoReq.headers['authorization'], pryvToken);
  });

  it('triggers the MFA challenge', async () => {
    assert.isDefined(challengeReq);
    assert.deepEqual(challengeReq.body, profileContent);
    assert.strictEqual(challengeReq.headers['authorization'], settings.get('sms:auth'));
  });

  it('answers 302 with a generated MFA session token', async () => {
    assert.strictEqual(res.status, 302);
    assert.isDefined(res.body.mfaToken);
  });

  describe('when the Pryv connection is invalid', function () {
    const pryvError = { error: {
      id: 'invalid-access-token',
      message: 'Cannot find access from token.'}
    };

    let res;
    before(async () => {
      new Mock(coreEndpoint, '/access-info', 'GET', 403, pryvError);
      res = await request
        .post(`/${username}/mfa/activate`)
        .set('Authorization', 'invalidToken')
        .send(profileContent);
    });

    it('returns the Pryv error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, pryvError.error.message);
    });
  });

  describe('when the MFA challenge could not be triggered', function () {
    const serviceError = { error: {
      id: 'unexpected',
      message: 'Could not trigger the challenge.'}
    };

    let res;
    before(async () => {
      new Mock(coreEndpoint, '/access-info', 'GET', 200, {token: pryvToken});
      new Mock(challengeEndpoint, '', 'POST', 400, serviceError);
      res = await request
        .post(`/${username}/mfa/activate`)
        .set('Authorization', pryvToken)
        .send(profileContent);
    });

    it('returns the MFA external service error', async () => {
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.message, serviceError.error.message);
    });
  });
});
