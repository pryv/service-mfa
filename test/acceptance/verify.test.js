// @flow

describe('POST /mfa/verify', function () {
  const username = 'testuser';
  const body = {code: '5678'};

  let settings, verifyEndpoint, request;

  describe('mode="challenge/verify"', () => {
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
      assert.deepEqual(verifyReq.body, Object.assign(body, session.profile.body));
      assert.equal(verifyReq.headers['authorization'], settings.get('sms:auth'));
    });
  
    it('clears the MFA session', async () => {
      assert.isFalse(app.mfaService.hasSession(session.id), 'MFA session is still set');
    });
  
    it('answers 200 with the Pryv token', async () => {
      assert.equal(res.status, 200);
      assert.equal(res.body.token, session.pryvConnection.token);
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
        assert.equal(res.status, 404);
        assert.equal(res.body.error.message, serviceError.error.message);
      });
    });
  });

  describe('mode="single"', () => {

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
      session = new DummySession(app, username, single.profile);
      app.mfaService.setCode(username, body.code, 1000);
      new Mock(coreEndpoint, '/profile/private', 'PUT', 200, {}, (req) => profileReq = req);
  
      res = await request
        .post(`/${username}/mfa/verify`)
        .set('Authorization', session.mfaToken)
        .send(body);
    });
    
    it('verifies the challenge by the MFA external service', async () => {
      assert.equal(res.status, 200, 'MFA confirmation was unsuccessful');
    });
  
    it('clears the MFA session', async () => {
      assert.isFalse(app.mfaService.hasSession(session.id), 'MFA session is still set');
    });
  
    it('answers 200 with the Pryv token', async () => {
      assert.equal(res.status, 200);
      assert.equal(res.body.token, session.pryvConnection.token);
    });
  
    describe('when the MFA verification fails', function () {
  
      const code = 'invalidCode';
      let res;
      before(async () => {
        const mfaToken = new DummySession(app, username).mfaToken;
        res = await request
          .post(`/${username}/mfa/verify`)
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
        .post(`/${username}/mfa/verify`)
        .set('Authorization', 'invalidMfaToken')
        .send(body);
    });

    it('returns an error', async () => {
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.message, 'Invalid MFA session token.');
    });
  });
});
