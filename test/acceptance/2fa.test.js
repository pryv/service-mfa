// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;

describe('GET /2fa', function () {

  it('ok', async () => {
    const auth = 'auth';

    const res = await request
      .get('/2fa')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);
  });
});
