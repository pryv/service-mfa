// @flow

const request = require('superagent');

class PryvConnection {

  token: ?string;
  username: string;
  coreUrl: string;

  constructor(settings: Object, username: string, token: ?string) {
    this.username = username;
    this.coreUrl = settings.get('core:url');
    this.token = token;
  }

  async login(password: string, appId: string): Promise<void> {
    const res = await request
      .post(`${this.coreUrl}/${this.username}/auth/login`)
      .set('Origin', this.coreUrl)
      .send({username: this.username, appId: appId, password: password});
    this.token = res.body.token;
  }

  async fetchProfile(): Promise<Object> {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/profile/private`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl);
    return res.body.profile;
  }

  async updateProfile(update: Object): Promise<void> {
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl)
      .send(update);
  }

  async checkAccess(): Promise<void> {
    await request
      .get(`${this.coreUrl}/${this.username}/access-info`)
      .set('Authorization', this.token)
      .set('Origin', this.coreUrl);
  }
}

module.exports = PryvConnection;
