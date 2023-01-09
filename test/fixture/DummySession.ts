/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import type Application from '../../src/app';

const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

class DummySession {

  profile: MFAProfile;
  pryvConnection: PryvConnection;
  mfaToken: string;

  constructor(app: Application, username: string, profileContent: unknown = { phone_number: '1234' }) {
    this.profile = new MFAProfile(profileContent);
    this.pryvConnection = new PryvConnection(app.settings, username, 'pryvToken');
    this.mfaToken = app.mfaService.saveSession(this.profile, this.pryvConnection);
  }
}

module.exports = DummySession;
