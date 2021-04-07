// @flow

const request = require('superagent');
const Session = require('./Session');
const Service = require('./Service');

import type PryvConnection from '../pryv/Connection';
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

  async challenge(profile: Profile, req: express$Request): Promise<void> {
    await request
      .post(this.endpointChallenge)
      .set('Authorization', this.auth)
      .query(req.query)
      .send(profile.content);
  }

  async verify(profile: Profile, req: express$Request): Promise<void> {
    const body = Object.assign({}, req.body, profile.content);
    await request
      .post(this.endpointVerify)
      .set('Authorization', this.auth)
      .query(req.query)
      .send(body);
  }

}

module.exports = ChallengeVerifyService;
