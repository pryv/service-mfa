// @flow

import type Application from '../../src/app';

const MFAProfile = require('../../src/business/mfa/Profile');
const PryvConnection = require('../../src/business/pryv/Connection');

class DummySession {

  profile: MFAProfile;
  connection: PryvConnection;
  mfaToken: string;


  constructor(app: Application, username: string) {
    this.profile = new MFAProfile('sms', '1234');
    this.connection = new PryvConnection(app.settings, username, 'pryvToken');
    this.mfaToken = app.mfaService.saveSession(this.profile, this.connection);
  }
}

module.exports = DummySession;
