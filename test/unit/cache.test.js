// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const settings = app.settings;
const DummySession = require('../fixture/DummySession');

describe('Cache for MFA sessions', function () {
  const ttl = settings.get('sessions:ttl');
  const maxTime = (ttl+0.1) * 1000;
  this.timeout((ttl+0.2) * 1000);
  
  it('destroy the session after TTL', (done) => {
    assert.strictEqual(app.mfaService.sessionsTTL, ttl*1000);
    const mfaToken = new DummySession(app, 'testuser').mfaToken;
    setTimeout(() => {
      assert.isUndefined(app.mfaService.getSession(mfaToken));
      done();
    }, maxTime);
  });

  it('does not throw an error when trying to clear a cleared session', async () => {
    const mfaToken = new DummySession(app, 'testuser').mfaToken;
    app.mfaService.clearSession(mfaToken);
    app.mfaService.clearSession(mfaToken);
  });
});
