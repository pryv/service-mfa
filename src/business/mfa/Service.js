// @flow

const request = require('superagent');
const Session = require('./Session');

import type PryvConnection from '../pryv/Connection';
import type Profile from './Profile';

class Service {

  auth: string;
  endpointChallenge: string;
  endpointVerify: string;
  sessionsTTL: number;
  sessions: Map<string, Session>;

  constructor(settings: Object) {
    this.auth = settings.get('sms:auth');
    this.endpointChallenge = settings.get('sms:endpoints:challenge');
    this.endpointVerify = settings.get('sms:endpoints:verify');
    this.sessionsTTL = settings.get('sessions:ttlSeconds') * 1000;
    this.sessions = new Map();
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

  hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  getSession(id: string): ?Session {
    return this.sessions.get(id);
  }

  saveSession(profile: Profile, pryvConnection: PryvConnection): string {
    const newSession = new Session(profile, pryvConnection);
    this.sessions.set(newSession.id, newSession);
    setTimeout(() => {
      this.clearSession(newSession.id);
    }, this.sessionsTTL);
    return newSession.id;
  }

  clearSession(id: string): boolean {
    return this.sessions.delete(id);
  }

}

module.exports = Service;
