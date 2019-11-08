// @flow

const NodeCache = require('node-cache');
const request = require('superagent');
const Session = require('./Session');

import type Connection from '../pryv/Connection';
import type Profile from './Profile';

class Service {

  auth: string;
  endpointChallenge: string;
  endpointVerify: string;
  sessions: NodeCache;

  constructor(settings: Object) {
    this.auth = settings.get('sms:auth');
    this.endpointChallenge = settings.get('sms:endpoints:challenge');
    this.endpointVerify = settings.get('sms:endpoints:verify');
    this.sessions = new NodeCache({
      stdTTL: settings.get('cache:ttl'),
      checkperiod: settings.get('cache:checkperiod'),
    });
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await request
      .post(this.endpointVerify)
      .set('Authorization', `Bearer ${this.auth}`)
      .send({
        phone_number: phoneNumber,
        code: code,
      });
    return verification.ok;
  }

  async challenge(phoneNumber: string): Promise<void> {
    await request
      .post(this.endpointChallenge)
      .set('Authorization', `Bearer ${this.auth}`)
      .send({
        phone_number: phoneNumber
      });
  }

  hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  getSession(id: string): ?Session {
    return this.sessions.get(id);
  }

  saveSession(profile: Profile, connection: Connection): string {
    const newSession = new Session(profile, connection);
    this.sessions.set(newSession.id, newSession);
    return newSession.id;
  }

  clearSession(id: string): boolean {
    return this.sessions.del(id);
  }

}

module.exports = Service;
