// @flow

/*global describe, it, beforeEach */

const settings = require('../../src/settings');
const middlewares = require('../../src/middlewares');
const authMiddleware = middlewares.authorization(settings);
const ApiError = require('../../src/utils/errorsHandling').ApiError;
const assert = require('chai').assert;

describe('Authorization middleware', function () {

  let req, res;
  beforeEach(async () => {
    req = {headers:{}, context:{}, query:{}};
    res = {};
  });

  it.skip('fails if auth is missing', async () => {
    const expectedErrorMsg = "Missing 'Authorization' header or 'auth' query parameter.";
    // FLOW: mocking req, res
    authMiddleware(req, res, expectAPIError(expectedErrorMsg, 403));
  });

  it.skip('succeeds if auth is provided', async () => {
    req.headers.authorization = 'auth';
    // FLOW: mocking req, res
    authMiddleware(req, res, (err) => {
      assert.isUndefined(err);
      assert.strictEqual(req.context.token, 'auth');
    });
  });

});

function expectAPIError(msg: string, status: number) {
  return (err) => {
    assert.isNotNull(err);
    assert.isTrue(err instanceof ApiError);
    // FLOW: err is not null
    const [errMsg, errStatus] = [err.message, err.httpStatus];
    assert.strictEqual(errMsg, msg);
    assert.strictEqual(errStatus, status);
  };
}