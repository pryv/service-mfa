// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;

describe('POST /:username/2fa/login', function () {
  describe('When 2FA is not activated', function () {
    it('returns the Pryv token', async () => {
    });
  });
  describe('When 2FA is activated', function () {
    it('proceeds to the 2FA challenge', async () => {
    });
  });
});

describe('POST /:username/2fa/verify', function () {
  it('proceeds to the 2FA verification', async () => {
  });
});
