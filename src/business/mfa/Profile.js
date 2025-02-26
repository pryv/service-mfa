/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

class Profile {
  content = undefined;
  /**
   * @type {Array<string>}
   */
  recoveryCodes = undefined;

  constructor (content = {}, recoveryCodes = []) {
    this.recoveryCodes = recoveryCodes;
    this.content = content;
  }

  /**
   * @returns {boolean}
   */
  isActive () {
    return !_.isEmpty(this.content);
  }

  /**
   * @returns {void}
   */
  generateRecoveryCodes () {
    this.recoveryCodes = new Array(10).fill().map(() => {
      return uuidv4();
    });
  }

  /**
   * @returns {string[]}
   */
  getRecoveryCodes () {
    return this.recoveryCodes;
  }
}
module.exports = Profile;
