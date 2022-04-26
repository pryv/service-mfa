/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const uuidv4 = require('uuid/v4');

import type PryvConnection from '../pryv/Connection';
import type Profile from './Profile';

class Session {
  id: string;
  profile: Profile;
  pryvConnection: PryvConnection;

  constructor(profile: Profile, pryvConnection: PryvConnection) {
    this.id = uuidv4();
    this.profile = profile;
    this.pryvConnection = pryvConnection;
  }
}

module.exports = Session;
