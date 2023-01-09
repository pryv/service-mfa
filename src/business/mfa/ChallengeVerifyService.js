/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const Service = require('./Service');
const replaceRecursively = require('../../utils/replaceRecursively');
const replaceAll = require('../../utils/replaceAll');

/**
 * @extends Service
 */
class ChallengeVerifyService extends Service {
  /**
   * @type {string}
   */
  challengeUrl = undefined;
  /**
   * @type {string}
   */
  challengeMethod = undefined;
  /**
   * @type {Map<string, string>}
   */
  challengeHeaders = undefined;
  /**
   * @type {string}
   */
  challengeBody = undefined;
  /**
   * @type {string}
   */
  verifyUrl = undefined;
  /**
   * @type {string}
   */
  verifyMethod = undefined;
  /**
   * @type {Map<string, string>}
   */
  verifyHeaders = undefined;
  /**
   * @type {string}
   */
  verifyBody = undefined;

  constructor (settings) {
    super(settings);
    this.challengeUrl = settings.get('sms:endpoints:challenge:url');
    this.challengeMethod = settings.get('sms:endpoints:challenge:method');
    this.challengeHeaders = settings.get('sms:endpoints:challenge:headers');
    this.challengeBody = settings.get('sms:endpoints:challenge:body');
    this.verifyUrl = settings.get('sms:endpoints:verify:url');
    this.verifyMethod = settings.get('sms:endpoints:verify:method');
    this.verifyHeaders = settings.get('sms:endpoints:verify:headers');
    this.verifyBody = settings.get('sms:endpoints:verify:body');
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async challenge (username, profile, clientRequest) {
    const replacements = profile.content;
    let url = this.challengeUrl;
    let headers = this.challengeHeaders;
    let body = this.challengeBody;
    for (const [key, value] of Object.entries(replacements)) {
      headers = replaceRecursively(headers, `{{ ${key} }}`, value);
      body = replaceAll(body, `{{ ${key} }}`, value);
      url = replaceAll(url, `{{ ${key} }}`, value);
    }
    await this._makeRequest(this.challengeMethod, url, headers, body);
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async verify (username, profile, clientRequest) {
    const replacements = Object.assign({}, clientRequest.body, profile.content);
    let url = this.verifyUrl;
    let headers = this.verifyHeaders;
    let body = this.verifyBody;
    for (const [key, value] of Object.entries(replacements)) {
      headers = replaceRecursively(headers, `{{ ${key} }}`, value);
      body = replaceAll(body, `{{ ${key} }}`, value);
      url = replaceAll(url, `{{ ${key} }}`, value);
    }
    await this._makeRequest(this.verifyMethod, url, headers, body);
  }
}
module.exports = ChallengeVerifyService;
