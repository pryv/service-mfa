/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const _ = require('lodash');
const request = require('superagent');
const Service = require('./Service');
const generateCode = require('./generateCode');
const replaceRecursively = require('../../utils/replaceRecursively');
const replaceAll = require('../../utils/replaceAll');
const CODE_LENGTH = 4;
const CODE = 'code';

/**
 * @extends Service
 */
class SingleService extends Service {
  /**
   * @type {string}
   */
  url = undefined;
  /**
   * @type {string}
   */
  apiMethod = undefined;
  /**
   * @type {Map<string, string>}
   */
  headers = undefined;
  /**
   * @type {string}
   */
  body = undefined;
  /**
   * username -> code
   * @type {Map<string, string>}
   */
  codes = undefined;
  /**
   * @type {Map<string, Timeout>}
   */
  timeouts = undefined;

  constructor(settings) {
    super(settings);
    this.url = settings.get('sms:endpoints:single:url');
    this.apiMethod = settings.get('sms:endpoints:single:method');
    this.headers = settings.get('sms:endpoints:single:headers');
    this.body = settings.get('sms:endpoints:single:body');
    /**
     * username -> code
     */
    this.codes = new Map();
    /**
     * username -> timeout
     */
    this.timeouts = new Map();
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async challenge(username, profile, clientRequest) {
    const code = await generateCode(CODE_LENGTH);
    this.setCode(username, code);
    const bodyWithToken = replaceRecursively(
      _.cloneDeep(profile.content),
      `{{ ${CODE} }}`,
      code
    );
    const replacements = _.extend(bodyWithToken, { [CODE]: code });
    let url = this.url;
    let headers = this.headers;
    let body = this.body;
    for (const [key, value] of Object.entries(replacements)) {
      headers = replaceRecursively(headers, `{{ ${key} }}`, value);
      body = replaceAll(body, `{{ ${key} }}`, value);
      url = replaceAll(url, `{{ ${key} }}`, value);
    }
    await this._makeRequest(this.apiMethod, url, headers, body);
  }

  /**
   * @param {string} username
   * @param {Profile} profile
   * @param {express$Request} clientRequest
   * @returns {Promise<void>}
   */
  async verify(username, profile, clientRequest) {
    const code = this.codes.get(username);
    if (code !== clientRequest.body.code) {
      const error = new Error(
        'The provided code is invalid: ' + clientRequest.body.code
      );
      error.status = 400;
      error.id = 'invalid-code';
      throw error;
    } else {
      this.clearCode(username);
    }
  }

  /**
   * @param {string} username
   * @param {string} code
   * @returns {void}
   */
  setCode(username, code) {
    this.codes.set(username, code);
    this.timeouts.set(
      username,
      setTimeout(() => {
        this.clearCode(username);
      }, this.ttlMilliseconds)
    );
  }

  /**
   * @param {string} username
   * @returns {void}
   */
  clearCode(username) {
    this.codes.delete(username);
    clearTimeout(this.timeouts.get(username));
  }
}
SingleService.CODE = CODE;
module.exports = SingleService;
