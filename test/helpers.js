/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

const { getConfig } = require('@pryv/boiler');
const Application = require('../src/app');
const assert = require('chai').assert;
const _ = require('lodash');

function compareHeaders (allHeaders, headersToFind) {
  assert.deepEqual(
    _.pick(allHeaders, Object.keys(headersToFind)),
    headersToFind
  );
}

Object.assign(global, {
  _,
  assert,
  Application,
  app: new Application(),
  mock: require('./fixture/mock'),
  DummySession: require('./fixture/DummySession'),
  supertest: require('supertest'),
  getConfig,
  single: require('./fixture/singleMode'),
  replaceRecursively: require('../src/utils/replaceRecursively'),
  compareHeaders
});
