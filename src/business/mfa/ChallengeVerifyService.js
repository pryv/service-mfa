/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
// @flow

const request = require('superagent');

const Service = require('./Service');
const replaceRecursively = require('../../utils/replaceRecursively');
const replaceAll = require('../../utils/replaceAll');
import type Profile from './Profile';

class ChallengeVerifyService extends Service {

  challengeUrl: string;
  challengeMethod: string;
  challengeHeaders: Map<string, string>;
  challengeBody: string;
  verifyUrl: string;
  verifyMethod: string;
  verifyHeaders: Map<string, string>;
  verifyBody: string;

  constructor(settings: Object) {
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

  async challenge(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const replacements: Map<string, string>  = profile.content;
    let url: string = this.challengeUrl;
    let headers: Map<string, string> = this.challengeHeaders;
    let body: string = this.challengeBody;
    for (const [key, value] of Object.entries(replacements)) {
      headers = replaceRecursively(headers, `{{ ${key} }}`, value);
      body = replaceAll(body, `{{ ${key} }}`, value);
      url = replaceAll(url, `{{ ${key} }}`, value);
    }
    await this._makeRequest(this.challengeMethod, url, headers, body);
  }

  async verify(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const replacements: Map<string, string>  = Object.assign({}, clientRequest.body, profile.content);

    let url: string = this.verifyUrl;
    let headers: Map<string, string> = this.verifyHeaders;
    let body: string = this.verifyBody;
    for (const [key, value] of Object.entries(replacements)) {
      headers = replaceRecursively(headers, `{{ ${key} }}`, value);
      body = replaceAll(body, `{{ ${key} }}`, value);
      url = replaceAll(url, `{{ ${key} }}`, value);
    }
    
    await this._makeRequest(this.verifyMethod, url, headers, body);
  }

}

module.exports = ChallengeVerifyService;
