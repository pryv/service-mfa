// @flow

const uuidv1 = require('uuid/v1');

import type PryvConnection from '../pryv/Connection';
import type Profile from './Profile';

class Session {
  id: string;
  profile: Profile;
  pryvConnection: PryvConnection;

  constructor(profile: Profile, pryvConnection: PryvConnection) {
    this.id = uuidv1();
    this.profile = profile;
    this.pryvConnection = pryvConnection;
  }
}

module.exports = Session;
