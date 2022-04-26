/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const request = require('superagent');

const Profile = require('../mfa/Profile');
const { factory } = require('../../utils/errorsHandling');

const PERSONAL_ACCESS_TYPE = 'personal';

class Connection {

  token: ?string;
  username: string;
  coreUrl: string;
  content: ?object;

  constructor(settings: Object, username: string, token: ?string) {
    this.username = username;
    this.coreUrl = settings.get('core:url');
    this.token = token;
    this.content = null;
  }

  async login(req: express$Request): Promise<void> {
    const res = await request
      .post(`${this.coreUrl}/${this.username}/auth/login`)
      .set(allowedHeaders(req.headers))
      .send(req.body);
    this.token = res.body.token;
    this.content = res.body;
  }

  async fetchProfile(req: express$Request): Promise<Profile> {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
    const pryvProfile = res.body.profile;
    const mfaProfile = pryvProfile.mfa;
    if (mfaProfile == null) return new Profile();
    return new Profile(mfaProfile.content, mfaProfile.recoveryCodes);
  }

  async updateProfile(reqHeaders: Map<string, string>, profile: ?Profile): Promise<void> {
    let update = null;
    if (profile != null) {
      update = {
        content: profile.content,
        recoveryCodes: profile.recoveryCodes,
      };
    }
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(reqHeaders))
      .set('Authorization', this.token)
      .send({mfa: update});
  }

  async checkAccess(req: express$Request): Promise<void> {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/access-info`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
    if (res.body.type !== PERSONAL_ACCESS_TYPE) {
      const error = factory.unauthorized('You cannot access this resource using the given access token.')
      throw error;
    }
  }
}

function allowedHeaders(headers: Object): mixed {
  const allowed = ['origin', 'Origin', 'referer', 'Referer', 'host', 'Host'];
  const filtered = Object.keys(headers)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = headers[key];
      return obj;
    }, {});
  return filtered;
}

module.exports = Connection;
