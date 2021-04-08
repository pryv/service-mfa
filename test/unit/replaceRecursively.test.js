const assert = require('chai').assert;

const replaceRecursively = require('../../src/utils/replaceRecursively');

describe('replaceRecursively', () => {

  it('must replace it for all occurences', () => {
    const token = '{{ code }}';
    const code = '123';
    const object = {
      a: 'blabla ' + token,
      b: {
        c: 'blibli ' + token,
        d: 1,
      },
      e: 2,
    };
    const replaced = replaceRecursively(object, token, code);
    assert.equal(replaced.a, object.a.replace(token, code));
    assert.equal(replaced.b.c, object.b.c.replace(token, code));
    assert.equal(replaced.b.d, object.b.d);
    assert.equal(replaced.e, object.e);
  });
});