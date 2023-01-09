/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const { v4: uuidv4 } = require('uuid');

class Session {
  /**
   * @type {string}
   */
  id = undefined;
  /**
   * @type {Profile}
   */
  profile = undefined;
  /**
   * @type {PryvConnection}
   */
  pryvConnection = undefined;

  /**
   * @param {Profile} profile
   * @param {PryvConnection} pryvConnection
   */
  constructor (profile, pryvConnection) {
    this.id = uuidv4();
    this.profile = profile;
    this.pryvConnection = pryvConnection;
  }
}
module.exports = Session;
