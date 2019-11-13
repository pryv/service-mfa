// @flow

const request = require('superagent');
const Profile = require('../mfa/Profile');

type loginRequestBody = {
  username: string,
  password: string,
  appId: string,
};

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

  async login(requestBody: loginRequestBody, headers: Object): Promise<void> {
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
    const mfaProfile = pryvProfile.mfa;
    if (mfaProfile == null) return new Profile(null, null);
    return new Profile(mfaProfile.id, mfaProfile.factor);
  }

  async updateProfile(profile: Profile): Promise<void> {
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl)
      .send({
        mfa: {
          id: profile.id,
          factor: profile.factor,
        }
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
