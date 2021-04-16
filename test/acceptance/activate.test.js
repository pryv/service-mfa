// @flow

/*global describe, it, before */

describe('POST /mfa/activate', function() {
  let settings, coreEndpoint, challengeEndpoint, request;
  const username = 'testuser';
  const pryvToken = 'validToken';

  describe('mode="challenge-verify"', () => {
    const profileContent = {
      phone: '1234'
    };
    before(async () => {
      await app.init();
      settings = app.settings;
      coreEndpoint = `${settings.get('core:url')}/${username}`;
      challengeEndpoint = settings.get('sms:endpoints:challenge:url');
      request = supertest(app.express);
    });

    let accessInfoReq, challengeReq, res;
    before(async () => {
      new Mock(
        coreEndpoint,
        '/access-info',
        'GET',
        200,
        { token: pryvToken, type: 'personal' },
        req => (accessInfoReq = req)
      );
      new Mock(
        challengeEndpoint,
        '',
        'POST',
        200,
        {},
        req => (challengeReq = req)
      );
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
      assert.isDefined(challengeReq, 'challenge not sent');
      assert.deepEqual(challengeReq.body, profileContent);
      compareHeaders(challengeReq.headers, settings.get('sms:endpoints:challenge:headers'));
    });

    it('answers 302 with a generated MFA session token', async () => {
      assert.strictEqual(res.status, 302);
      assert.isDefined(res.body.mfaToken);
    });

    describe('when the Pryv connection is invalid', function() {
      const pryvError = {
        error: {
          id: 'invalid-access-token',
          message: 'Cannot find access from token.'
        }
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

    describe('when the MFA challenge could not be triggered', function() {
      const serviceError = {
        error: {
          id: 'unexpected',
          message: 'Could not trigger the challenge.'
        }
      };

      let res;
      before(async () => {
        new Mock(coreEndpoint, '/access-info', 'GET', 200, {
          token: pryvToken, type: 'personal',
        });
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

    const profile = single.profile;
    const query = single.query;
    const headers = single.config.sms.endpoints.single.headers;

    let accessInfoReq, challengeReq, res;
    before(async () => {
      new Mock(
        coreEndpoint,
        '/access-info',
        'GET',
        200,
        { token: pryvToken, type: 'personal' },
        req => (accessInfoReq = req)
      );
      new Mock(single.url, '', 'POST', 200, {}, req => { challengeReq = req}, query);
      res = await request
        .post(`/${username}/mfa/activate`)
        .set('Authorization', pryvToken)
        .send(profile);
    });

    it('checks the validity of the provided Pryv token', () => {
      assert.isDefined(accessInfoReq);
      assert.strictEqual(accessInfoReq.headers['authorization'], pryvToken);
    });

    it('forwards the information to the MFA service', () => {
      assert.isDefined(challengeReq, 'challenge request was not sent');
      const body = challengeReq.body;
      const number = single.extractCodeFromBody(body);
      assert.deepEqual(body, single.bodyWithCode(number));
      compareHeaders(challengeReq.headers, headers);
    });

    it('answers 302 with a generated MFA session token', () => {
      assert.strictEqual(res.status, 302);
      assert.isDefined(res.body.mfaToken);
    });

    describe('when the MFA challenge could not be triggered', function() {
      const serviceError = {
        error: {
          id: 'unexpected',
          message: 'Could not trigger the challenge.'
        }
      };

      let res;
      before(async () => {
        new Mock(coreEndpoint, '/access-info', 'GET', 200, {
          token: pryvToken, type: 'personal',
        });
        new Mock(single.url, '', 'POST', 400, serviceError, null, query);
        res = await request
          .post(`/${username}/mfa/activate`)
          .set('Authorization', pryvToken)
          .send(profile);
      });

      it('returns the MFA external service error', async () => {
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.message, serviceError.error.message);
      });
    });
  });

  describe('when the provide token is not personal', () => {
    before(async () => {
      await app.init();
    });

    let accessInfoReq, challengeReq, res;
    before(async () => {
      new Mock(
        coreEndpoint,
        '/access-info',
        'GET',
        200,
        { token: pryvToken, type: 'app' },
        req => (accessInfoReq = req)
      );
      res = await request
        .post(`/${username}/mfa/activate`)
        .set('Authorization', pryvToken)
        .send({});
    });

    it('checks the validity of the provided Pryv token', () => {
      assert.isDefined(accessInfoReq);
      assert.strictEqual(accessInfoReq.headers['authorization'], pryvToken);
    });
    it('returns a forbidden error', () => {
      assert.equal(res.status, 403);
      const body = res.body;
      assert.equal(body.error.id, 'forbidden');
      assert.equal(body.error.message, 'You cannot access this resource using the given access token.');
    });
  });
});
