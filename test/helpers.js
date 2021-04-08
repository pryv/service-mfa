
const { getConfig } = require('@pryv/boiler');
const { 
  singleUrl,
  singleConfig,
  singleMessage,
  singleToken,
  lettersToToken,
} = require('./fixture/singleMode');
const Application = require('../src/app');

Object.assign(global, {
  _: require('lodash'),
  assert: require('chai').assert,
  app: new Application(),
  Mock: require('./fixture/Mock'),
  DummySession: require('./fixture/DummySession'),
  supertest: require('supertest'),
  getConfig,
  singleUrl,
  singleConfig,
  singleMessage,
  singleToken,
  lettersToToken,
});

