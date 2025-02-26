/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const { promisify } = require('bluebird');
const randomBytes = promisify(require('crypto').randomBytes);
/**
 * generates random number between 0 and codeLength
 * @param {number} codeLength
 * @returns {Promise<string>}
 */
async function generateCode (codeLength) {
  const bytes = await randomBytes(4);
  const hex = bytes.toString('hex');
  const code = parseInt(hex, 16);
  return fixLength(code + '', codeLength);
  function fixLength (number, desiredLength) {
    const length = number.length;
    const pad = desiredLength - length;
    if (pad === 0) {
      return number;
    } else if (pad > 0) {
      return '0'.repeat(pad) + number;
    } else {
      // pad < 0
      return number.substr(0, length + pad);
    }
  }
}
module.exports = generateCode;
