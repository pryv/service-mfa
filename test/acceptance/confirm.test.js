// @flow

/*global describe, it, before */

describe('POST /mfa/confirm', function () {
  const username = 'testuser';
  let settings, coreEndpoint, verifyEndpoint, request;
  let verifyReq, profileReq, res, session;

  describe('mode="challenge-verify"', () => {
    const body = {code: '1234'};
    before(async () => {
      await app.init();
      settings = app.settings;
      coreEndpoint = `${settings.get('core:url')}/${username}`;
      verifyEndpoint = settings.get('sms:endpoints:verify:url');
      request = supertest(app.express);
    });
    
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
      assert.deepEqual(verifyReq.body, Object.assign(body, session.profile.content), 'verify payload not sent');
      compareHeaders(verifyReq.headers, settings.get('sms:endpoints:challenge:headers'));
    });
  
    it('updates the Pryv profile with the MFA parameters', async () => {
      assert.isDefined(profileReq);
      assert.strictEqual(profileReq.headers['authorization'], session.pryvConnection.token);
      assert.deepEqual(profileReq.body.mfa.content, session.profile.content, 'profile update not sent');
    });
  
    it('generates and saves MFA backup codes', async () => {
      assert.isTrue(Array.isArray(session.profile.recoveryCodes));
      assert.strictEqual(session.profile.recoveryCodes.length, 10);
      assert.deepEqual(profileReq.body.mfa.recoveryCodes, session.profile.recoveryCodes);
    });
  
    it('clears the MFA session', async () => {
      const retrievedSession = app.mfaService.getSession(session.mfaToken);
      assert.isUndefined(retrievedSession);
    });
  
    it('answers 200 and returns the MFA recovery codes', async () => {
      assert.strictEqual(res.status, 200);
      assert.deepEqual(res.body.recoveryCodes, session.profile.recoveryCodes);
    });
  
    describe('when the MFA verification returns an error', function () {
      const serviceError = { error: {
        id: 'invalid-code',
        message: 'Invalid MFA code.'}
      };
  
      let res;
      before(async () => {
        const mfaToken = new DummySession(app, username).mfaToken;
  
        new Mock(verifyEndpoint, '', 'POST', 400, serviceError);
        res = await request
          .post(`/${username}/mfa/confirm`)
          .set('Authorization', mfaToken)
          .send({code: 'invalidCode'});
      });

      it('returns a messaging service error', async () => {
        assert.strictEqual(res.status, 400);
        assert.equal(res.body.error.id, 'messaging-server-error')
      });
    });
  });

  describe('mode="single"', () => {

    const body = {code: '5678'};

    let config;
    before(async () => {
      config = await getConfig();
      config.injectTestConfig(single.config);
      await app.init();
      settings = app.settings;
      coreEndpoint = `${settings.get('core:url')}/${username}`;
      request = supertest(app.express);
    });
    after(() => {
      config.injectTestConfig({});
    });
    
    before(async () => {
      session = new DummySession(app, username);
      app.mfaService.setCode(username, body.code, 1000);
      new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => profileReq = req);
  
      res = await request
        .post(`/${username}/mfa/confirm`)
        .set('Authorization', session.mfaToken)
        .send(body);
    });
  
    it('verifies the MFA challenge', async () => {
      assert.equal(res.status, 200, 'MFA confirmation was unsuccessful');
    });
  
    it('updates the Pryv profile with the MFA parameters', async () => {
      assert.isDefined(profileReq);
      assert.equal(profileReq.headers['authorization'], session.pryvConnection.token);
      assert.deepEqual(profileReq.body.mfa.content, session.profile.content);
    });
  
    it('generates and saves MFA backup codes', async () => {
      assert.isArray(session.profile.recoveryCodes);
      assert.equal(session.profile.recoveryCodes.length, 10);
      assert.deepEqual(profileReq.body.mfa.recoveryCodes, session.profile.recoveryCodes);
    });
  
    it('clears the MFA session', async () => {
      const retrievedSession = app.mfaService.getSession(session.mfaToken);
      assert.isUndefined(retrievedSession);
    });
  
    it('answers 200 and returns the MFA recovery codes', async () => {
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.recoveryCodes, session.profile.recoveryCodes);
    });
  
    describe('when the MFA verification fails', function () {
  
      const code = 'invalidaCode';
      let res;
      before(async () => {
        const mfaToken = new DummySession(app, username).mfaToken;
        res = await request
          .post(`/${username}/mfa/confirm`)
          .set('Authorization', mfaToken)
          .send({code});
      });
  
      it('returns an invalid-code error', async () => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error.id, 'invalid-code');
        assert.strictEqual(res.body.error.message, 'The provided code is invalid: ' + code);
      });
    });
  });

  describe('when the MFA session token is invalid', function () {

    let res;
    before(async () => {
      res = await request
        .post(`/${username}/mfa/confirm`)
        .set('Authorization', 'invalidMfaToken')
        .send({anything: 'hi'});
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, 'Invalid MFA session token.');
    });
  });
});
