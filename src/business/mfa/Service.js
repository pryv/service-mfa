// @flow

const request = require('superagent');
const Session = require('./Session');

import type PryvConnection from '../pryv/Connection';
import type Profile from './Profile';

class Service {

  ttlMilliseconds: number;
  sessions: Map<string, Session>;

  constructor(settings: Object) {
    this.ttlMilliseconds = settings.get('sessions:ttlSeconds') * 1000;
    this.sessions = new Map();
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
    }, this.ttlMilliseconds);
    return newSession.id;
  }

  clearSession(id: string): boolean {
    return this.sessions.delete(id);
  }

}

module.exports = Service;
