// @flow

/*global describe, it, before */

describe('POST /mfa/challenge', function () {
  const username = 'testuser';
  let settings, challengeEndpoint, request;

  describe('mode="challenge-verify"', () => {
    before(async () => {
      await app.init();
      settings = app.settings;
      challengeEndpoint = settings.get('sms:endpoints:challenge:url');
      request = supertest(app.express);
    });
  
    
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
      compareHeaders(challengeReq.headers, settings.get('sms:endpoints:challenge:headers'));
    });
  
    it('answers 200 and asks to verify the MFA challenge', async () => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Please verify the MFA challenge.');
    });
  
    describe('when the MFA challenge could not be triggered', function () {
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
  
      it('returns the MFA external service error', async () => {
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.message, serviceError.error.message);
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
      request = supertest(app.express);
    });
    after(() => {
      config.injectTestConfig({});
    });
  
    let challengeReqs = [], res, res2, codes = [], session;

    const profile = single.profile;
    const query = single.query;
    const headers = single.config.sms.endpoints.single.headers;
    before(async () => {
      session = new DummySession(app, username, profile);
      new Mock(single.url, '', 'POST', 200, {}, (req) => challengeReqs.push(req), query, 2);
      res = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', session.mfaToken)
        .send();
      res2 = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', session.mfaToken)
        .send();
    });
  
    it('triggers the MFA challenge', () => {
      assert.isDefined(challengeReqs[0], 'challenge request was not sent');
      const body = challengeReqs[0].body;
      const code = single.extractCodeFromBody(body);
      codes.push(code);
      assert.deepEqual(body, single.bodyWithCode(code));
      compareHeaders(challengeReqs[0].headers, headers);
    });
    it('answers 200 and asks to verify the MFA challenge', () => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Please verify the MFA challenge.');
    });
    it('generates different codes', () => {
      const body = challengeReqs[1].body;
      const code = single.extractCodeFromBody(body);
      assert.notEqual(code, codes[0]);
    });
    it('accepts them', async () => {
      challengeReqs = challengeReqs.map(req => single.extractCodeFromBody(req.body));
      const res3 = await request
        .post(`/${username}/mfa/verify`)
        .set('Authorization', session.mfaToken)
        .send({ code: challengeReqs[challengeReqs.length - 1]});
      assert.equal(res3.status, 200);
    });
  
    describe('when the MFA challenge could not be triggered', function () {
      const serviceError = { error: {
        id: 'unexpected',
        message: 'Could not trigger the challenge.'}
      };
  
      let res;
      before(async () => {
        const mfaToken = new DummySession(app, username, single.profile).mfaToken;
        new Mock(single.url, '', 'POST', 400, serviceError, null, query);
        res = await request
          .post(`/${username}/mfa/challenge`)
          .set('Authorization', mfaToken)
          .send({});
      });
  
      it('returns the MFA external service error', async () => {
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.message, serviceError.error.message);
      });
    });
  });

  describe('mode="single" and method="GET"', () => {
    let config;
    before(async () => {
      config = await getConfig();
      const configWithGet = _.cloneDeep(single.config);
      configWithGet.sms.endpoints.single.method = 'GET';
      config.injectTestConfig(configWithGet);
      await app.init();
      settings = app.settings;
      request = supertest(app.express);
    });
    after(() => {
      config.injectTestConfig({});
    });
  
    let challengeReq, res;

    const profile = single.profile;
    const query = single.query;
    const headers = single.config.sms.endpoints.single.headers;
    before(async () => {
      session = new DummySession(app, username, profile);
      new Mock(single.url, '', 'GET', 200, {}, (req) => challengeReq = req, query);
      res = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', session.mfaToken)
        .send();
    });
  
    it('triggers the MFA challenge', async () => {
      assert.isDefined(challengeReq, 'challenge request was not sent');
      compareHeaders(challengeReq.headers, headers);
    });
  
    it('answers 200 and asks to verify the MFA challenge', async () => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Please verify the MFA challenge.');
    });
  
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
});
