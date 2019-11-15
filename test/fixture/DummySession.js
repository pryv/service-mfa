// @flow

import type Application from '../../src/app';

const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

class DummySession {

  profile: MFAProfile;
  pryvConnection: PryvConnection;
  mfaToken: string;

  constructor(app: Application, username: string) {
    this.profile = new MFAProfile({phone: '1234'});
    this.pryvConnection = new PryvConnection(app.settings, username, 'pryvToken');
    this.mfaToken = app.mfaService.saveSession(this.profile, this.pryvConnection);
  }
}

module.exports = DummySession;
