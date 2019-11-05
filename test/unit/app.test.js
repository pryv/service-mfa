// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');

describe('Application', function () {

  it('starts', async () => {
    const app = new Application();
  });
});
