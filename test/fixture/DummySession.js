/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
  constructor(app, username, profileContent = { phone_number: '1234' }) {
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
