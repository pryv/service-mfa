/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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