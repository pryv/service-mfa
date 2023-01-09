/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const assert = require('chai').assert;

const replaceRecursively = require('../../src/utils/replaceRecursively');

describe('replaceRecursively', () => {
  it('must replace it for all occurences', () => {
    const token = '{{ code }}';
    const code = '123';
    const object = {
      a: 'blabla ' + code,
      b: {
        c: 'blibli ' + code,
        d: 1
      },
      e: 2
    };
    const replaced = replaceRecursively(object, token, code);
    assert.equal(replaced.a, object.a.replace(token, code));
    assert.equal(replaced.b.c, object.b.c.replace(token, code));
    assert.equal(replaced.b.d, object.b.d);
    assert.equal(replaced.e, object.e);
  });
  it('must accept undefined', () => {
    assert.deepEqual(replaceRecursively(), {});
  });
});
