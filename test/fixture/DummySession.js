/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

class DummySession {
  /**
   * @type {MFAProfile}
   */
  profile = undefined;
  /**
   * @type {PryvConnection}
   */
  pryvConnection = undefined;
  /**
   * @type {string}
   */
  mfaToken = undefined;

  /**
   * @param {Application} app
   * @param {string} username
   * @param {*} profileContent
   */
  constructor (app, username, profileContent = { phone_number: '1234' }) {
    this.profile = new MFAProfile(profileContent);
    this.pryvConnection = new PryvConnection(
      app.settings,
      username,
      'pryvToken'
    );
    this.mfaToken = app.mfaService.saveSession(
      this.profile,
      this.pryvConnection
    );
  }
}
module.exports = DummySession;
