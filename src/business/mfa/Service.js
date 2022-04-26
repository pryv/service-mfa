/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const request = require('superagent');
const Session = require('./Session');

import type PryvConnection from '../pryv/Connection';
import type Profile from './Profile';
const {getLogger} = require('@pryv/boiler');
const { ApiError } = require('../../utils/errorsHandling');

class Service {

  logger: mixed;
  ttlMilliseconds: number;
  sessions: Map<string, Session>;

  constructor(settings: Object) {
    this.ttlMilliseconds = settings.get('sessions:ttlSeconds') * 1000;
    this.sessions = new Map();
    this.logger = getLogger('mfaService');
  }

  async challenge(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    throw new Error('override this method in a Service extension');
  }

  async verify(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    throw new Error('override this method in a Service extension');
  }

  hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  getSession(id: string): ?Session {
    return this.sessions.get(id);
  }

  saveSession(profile: Profile, pryvConnection: PryvConnection): string {
    this.logger.info('saving session for ' + pryvConnection.username)
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

  /**
   * Make a request POST or GET depending on "method"
   * 
   * @param {*} method 
   * @param {*} url 
   * @param {*} headers 
   * @param {*} body 
   */
  async _makeRequest(method: string, url: string, headers: Map<string, string>, body: string): Promise<void>{
    try {
      if (method === 'POST') {
        return await request
          .post(url)
          .set(headers)
          .send(body);
      } else { // GET
        return request
          .get(url)
          .set(headers);
      }
    } catch (error) {
      this.logger.error(`Error while sending ${method} request to ${url} with headers ${JSON.stringify(headers)} and body: ${JSON.stringify(body)}.`);
      if (error.response) this.logger.error(`Service response: ${JSON.stringify(error.response.body)}`);

      throw new ApiError(
        400,
        `Error from messaging service. Error message: "${error.message}"`,
        'messaging-server-error',
      );
    }
  }

}

module.exports = Service;
