/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

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
  Application: Application,
  app: new Application(),
  Mock: require('./fixture/Mock'),
  DummySession: require('./fixture/DummySession'),
  supertest: require('supertest'),
  getConfig,
  single: require('./fixture/singleMode'),
  replaceRecursively: require('../src/utils/replaceRecursively'),
  compareHeaders,
});

