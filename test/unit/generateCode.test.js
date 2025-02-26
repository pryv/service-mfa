/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const assert = require('chai').assert;

const generateCode = require('../../src/business/mfa/generateCode');

describe('generateCode', () => {
  it('must adapt for smaller length', async () => {
    const length = 3;
    const code = await generateCode(length);
    assert.lengthOf(code, length);
    const num = parseInt(code);

    assert.isNumber(num);
  });
  it('must adapt for longer length', async () => {
    const length = 1000;
    const code = await generateCode(length);
    assert.lengthOf(code, length);
    const num = parseInt(code);
    assert.isNumber(num);
  });
});
