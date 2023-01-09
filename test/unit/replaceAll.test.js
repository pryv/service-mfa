/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
