// @flow

const request = require('superagent');
const Profile = require('../mfa/Profile');

type loginRequestHeaders = {
  origin: ?string,
  referer: ?string,
}

class Connection {

  token: ?string;
  username: string;
  coreUrl: string;

  constructor(settings: Object, username: string, token: ?string) {
    this.username = username;
    this.coreUrl = settings.get('core:url');
    this.token = token;
  }

  async login(requestBody: mixed, headers: mixed): Promise<void> {
    const res = await request
      .post(`${this.coreUrl}/${this.username}/auth/login`)
      .set(prepareHeaders(headers))
      .send(requestBody);
    this.token = res.body.token;
  }

  async fetchProfile(): Promise<Profile> {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/profile/private`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl);
    const pryvProfile = res.body.profile;
    return new Profile(pryvProfile.mfa);
  }

  async updateProfile(profile: Profile): Promise<void> {
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl)
      .send({
        mfa: profile.content
      });
  }

  async checkAccess(): Promise<void> {
    await request
      .get(`${this.coreUrl}/${this.username}/access-info`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl);
  }
}

function prepareHeaders(headers: Object): loginRequestHeaders {
  const allowed = ['origin', 'Origin', 'referer', 'Referer'];
  const filtered = Object.keys(headers)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = headers[key];
      return obj;
    }, {});
  return filtered;
}

module.exports = Connection;
