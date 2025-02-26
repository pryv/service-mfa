/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const assert = require('chai').assert;

const replaceAll = require('../../src/utils/replaceAll');

describe('replaceAll', () => {
  it('must replace it for all occurences', () => {
    const replacements = {
      phoneNumber: '1234',
      message: 'Hi, here is your MFA code: 1432'
    };
    const original = JSON.stringify({
      phoneNumber: '{{ phoneNumber }}',
      message: '{{ message }}'
    });

    let replaced = original;
    for (const [key, value] of Object.entries(replacements)) {
      replaced = replaceAll(replaced, `{{ ${key} }}`, value);
    }
    assert.equal(
      replaced,
      JSON.stringify({
        phoneNumber: replacements.phoneNumber,
        message: replacements.message
      })
    );
  });
});
