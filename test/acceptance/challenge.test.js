// @flow

/*global describe, it, before */

describe('POST /mfa/challenge', function () {
  const username = 'testuser';
  let settings, auth, challengeEndpoint, request;

  describe('mode="challenge-verify"', () => {
    before(async () => {
      await app.init();
      settings = app.settings;
      challengeEndpoint = settings.get('sms:endpoints:challenge');
      auth = settings.get('sms:auth');
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
      assert.deepEqual(challengeReq.body, session.profile.body);
      assert.strictEqual(challengeReq.headers['authorization'], auth);
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
  
    let challengeReq, res, profile, headers, query;
    before(async () => {
      session = new DummySession(app, username, single.profile);
      profile = session.profile;
      query = replaceRecursively(profile.query, single.authKey, single.authValue);
      headers = replaceRecursively(profile.headers, single.authKey, single.authValue);
      new Mock(single.url, '', 'POST', 200, {}, (req) => challengeReq = req, query);
      res = await request
        .post(`/${username}/mfa/challenge`)
        .set('Authorization', session.mfaToken)
        .send();
    });
  
    it('triggers the MFA challenge', async () => {
      assert.isDefined(challengeReq, 'challenge request was not sent');
      const body = challengeReq.body;
      assert.deepEqual(_.omit(body, ['message']), _.omit(profile.body, ['message']), 'activation content did not match');
      const number = body.message.substring(single.lettersToToken);
      assert.equal(
        profile.body.message.replace(single.token, number),
        body.message,
        'message with generated code did not match'
      );
      assert.deepEqual(
        _.pick(challengeReq.headers, Object.keys(headers)),
        single.profile.headers,
        'headers are not substituted'
      );
      assert.deepEqual(
        _.pick(challengeReq.query, Object.keys(query)),
        single.profile.query,
        'query params are not substituted'
      );
      assert.deepEqual(challengeReq.query, query);
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
