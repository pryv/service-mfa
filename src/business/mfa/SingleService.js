/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const _ = require('lodash');
const request = require('superagent');

const Service = require('./Service');
const generateCode = require('./generateCode');
const replaceRecursively = require('../../utils/replaceRecursively');
const replaceAll = require('../../utils/replaceAll');
import type Profile from './Profile';

const CODE_LENGTH = 4;
const CODE = 'code';

class SingleService extends Service {

  url: string;
  apiMethod: string;
  headers: Map<string, string>;
  body: string;
  /**
   * username -> code
   */
  codes: Map<string, string>
  timeouts: Map<string, Timeout>

  constructor(settings: Object) {
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

  async challenge(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const code: string = await generateCode(CODE_LENGTH);
    this.setCode(username, code);
    const bodyWithToken = replaceRecursively(_.cloneDeep(profile.content), `{{ ${CODE} }}`, code);
    const replacements: Map<string, string> = _.extend(bodyWithToken, { [CODE]: code });
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

  async verify(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const code = this.codes.get(username);
    if (code !== clientRequest.body.code) {
      const error = new Error('The provided code is invalid: ' + clientRequest.body.code);
      error.status = 400;
      error.id = 'invalid-code';
      throw error;
    } else {
      this.clearCode(username);
    }
  }

  setCode(username: string, code: string): void {
    this.codes.set(username, code);
    this.timeouts.set(username, setTimeout(() => {
      this.clearCode(username);
    }, this.ttlMilliseconds)
    );
  }

  clearCode(username: string): void {
    this.codes.delete(username);
    clearTimeout(this.timeouts.get(username));
  }
}

SingleService.CODE = CODE;

module.exports = SingleService;
