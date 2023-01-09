/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const request = require('superagent');
const Session = require('./Session');
const { getLogger } = require('@pryv/boiler');
const { ApiError } = require('../../utils/errorsHandling');

class Service {
  logger = undefined;
  /**
   * @type {number}
   */
  ttlMilliseconds = undefined;
  /**
   * @type {Map<string, Session>}
   */
  sessions = undefined;

  constructor(settings) {
    this.ttlMilliseconds = settings.get('sessions:ttlSeconds') * 1000;
    this.sessions = new Map();
    this.logger = getLogger('mfaService');
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async challenge(username, profile, clientRequest) {
    throw new Error('override this method in a Service extension');
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async verify(username, profile, clientRequest) {
    throw new Error('override this method in a Service extension');
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  hasSession(id) {
    return this.sessions.has(id);
  }

  /**
   * @param {string} id
   * @returns {any}
   */
  getSession(id) {
    return this.sessions.get(id);
  }

  /**
   * @param {Profile} profile
   * @param {PryvConnection} pryvConnection
   * @returns {string}
   */
  saveSession(profile, pryvConnection) {
    this.logger.info('saving session for ' + pryvConnection.username);
    const newSession = new Session(profile, pryvConnection);
    this.sessions.set(newSession.id, newSession);
    setTimeout(() => {
      this.clearSession(newSession.id);
    }, this.ttlMilliseconds);
    return newSession.id;
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  clearSession(id) {
    return this.sessions.delete(id);
  }

  /**
   * Make a request POST or GET depending on "method"
   *
   * @param {string} method  undefined
   * @param {string} url  undefined
   * @param {Map<string, string>} headers  undefined
   * @param {string} body  undefined
   * @returns {Promise<void>}
   */
  async _makeRequest(method, url, headers, body) {
    try {
      if (method === 'POST') {
        return await request.post(url).set(headers).send(body);
      } else {
        // GET
        return request.get(url).set(headers);
      }
    } catch (error) {
      this.logger.error(
        `Error while sending ${method} request to ${url} with headers ${JSON.stringify(
          headers
        )} and body: ${JSON.stringify(body)}.`
      );
      if (error.response)
        this.logger.error(
          `Service response: ${JSON.stringify(error.response.body)}`
        );
      throw new ApiError(
        400,
        `Error from messaging service. Error message: "${error.message}"`,
        'messaging-server-error'
      );
    }
  }
}
module.exports = Service;
