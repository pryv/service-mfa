
const { getConfig } = require('@pryv/boiler');
const Application = require('../src/app');

Object.assign(global, {
  _: require('lodash'),
  assert: require('chai').assert,
  app: new Application(),
  Mock: require('./fixture/Mock'),
  DummySession: require('./fixture/DummySession'),
  supertest: require('supertest'),
  getConfig,
  single: require('./fixture/singleMode'),
  replaceRecursively: require('../src/utils/replaceRecursively'),
});

