// @flow

const request = require('superagent');
const Service = require('./Service');

import type Profile from './Profile';

class ChallengeVerifyService extends Service {

  auth: string;
  endpointChallenge: string;
  endpointVerify: string;

  constructor(settings: Object) {
    super(settings);
    this.auth = settings.get('sms:auth');
    this.endpointChallenge = settings.get('sms:endpoints:challenge');
    this.endpointVerify = settings.get('sms:endpoints:verify');
  }

  async challenge(username: string, profile: Profile, query: {}): Promise<void> {
    await request
      .post(this.endpointChallenge)
      .set('Authorization', this.auth)
      .query(query)
      .send(profile.content);
  }

  async verify(username: string, profile: Profile, query: {}, body: {}): Promise<void> {
    const reqBody = Object.assign({}, body, profile.content);
    await request
      .post(this.endpointVerify)
      .set('Authorization', this.auth)
      .query(query)
      .send(reqBody);
  }

}

module.exports = ChallengeVerifyService;
