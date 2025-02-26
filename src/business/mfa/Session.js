/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
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
