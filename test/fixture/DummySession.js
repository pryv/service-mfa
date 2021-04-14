// @flow

import type Application from '../../src/app';

const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

class DummySession {

  profile: MFAProfile;
  pryvConnection: PryvConnection;
  mfaToken: string;

  constructor(app: Application, username: string, profile: mixed = { body: { phone: '1234' } }) {
    this.profile = new MFAProfile(profile.body, profile.query, profile.headers);
    this.pryvConnection = new PryvConnection(app.settings, username, 'pryvToken');
    this.mfaToken = app.mfaService.saveSession(this.profile, this.pryvConnection);
  }
}

module.exports = DummySession;
