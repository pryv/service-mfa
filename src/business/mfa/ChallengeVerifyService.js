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

  async challenge(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    await request
      .post(this.endpointChallenge)
      .set('Authorization', this.auth)
      .query(profile.query)
      .send(profile.content);
  }

  async verify(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const reqBody = Object.assign({}, clientRequest.body, profile.content);
    await request
      .post(this.endpointVerify)
      .set('Authorization', this.auth)
      .query(clientRequest.query)
      .send(reqBody);
  }

}

module.exports = ChallengeVerifyService;
