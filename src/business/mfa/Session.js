// @flow

const uuidv1 = require('uuid/v1');

import type Connection from '../pryv/Connection';
import type Profile from './Profile';

class Session {
  id: string;
  profile: Profile;
  connection: Connection;

  constructor(profile: Profile, connection: Connection) {
    this.id = uuidv1();
    this.profile = profile;
    this.connection = connection;
  }
}

module.exports = Session;
