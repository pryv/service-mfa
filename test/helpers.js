
const { getConfig } = require('@pryv/boiler');
const Application = require('../src/app');
const assert = require('chai').assert;
const _ = require('lodash');

function compareHeaders (allHeaders, headersToFind) {
  assert.deepEqual(
    _.pick(allHeaders, Object.keys(headersToFind)),
    headersToFind,
  );
}

Object.assign(global, {
  _,
  assert,
  app: new Application(),
  Mock: require('./fixture/Mock'),
  DummySession: require('./fixture/DummySession'),
  supertest: require('supertest'),
  getConfig,
  single: require('./fixture/singleMode'),
  replaceRecursively: require('../src/utils/replaceRecursively'),
  compareHeaders,
});

