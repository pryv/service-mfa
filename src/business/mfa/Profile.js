/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const uuidv4 = require('uuid/v4');
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
