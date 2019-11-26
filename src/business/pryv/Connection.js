// @flow

const request = require('superagent');
const Profile = require('../mfa/Profile');

class Connection {

  token: ?string;
  username: string;
  coreUrl: string;

  constructor(settings: Object, username: string, token: ?string) {
    this.username = username;
    this.coreUrl = settings.get('core:url');
    this.token = token;
  }

  async login(req: express$Request): Promise<void> {
    const res = await request
      .post(`${this.coreUrl}/${this.username}/auth/login`)
      .set(allowedHeaders(req.headers))
      .send(req.body);
    this.token = res.body.token;
  }

  async fetchProfile(req: express$Request): Promise<Profile> {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
    const pryvProfile = res.body.profile;
    return new Profile(pryvProfile.mfa);
  }

  async updateProfile(req: express$Request, profile: Profile): Promise<void> {
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token)
      .send({
        mfa: profile.content
      });
  }

  async checkAccess(req: express$Request): Promise<void> {
    await request
      .get(`${this.coreUrl}/${this.username}/access-info`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
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
