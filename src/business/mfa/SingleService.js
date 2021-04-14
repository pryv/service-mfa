// @flow

const _ = require('lodash');
const request = require('superagent');

const Service = require('./Service');
const generateCode = require('./generateCode');
const replaceRecursively = require('../../utils/replaceRecursively');
import type Profile from './Profile';

const CODE_LENGTH = 4;
const CODE_TTL_MS = 60000;

class SingleService extends Service {

  headers: Map<string, string>;
  singleUrl: string;
  endpointVerify: string;
  apiMethod: string;
  token: string;
  replacements: Map<string, string>;
  /**
   * username -> code
   */
  codes: Map<string, string>
  timeouts: Map<string, Timeout>

  constructor(settings: Object) {
    super(settings);
    this.headers = settings.get('sms:endpoints:single:headers');
    this.singleUrl = settings.get('sms:endpoints:single:url');
    this.apiMethod = settings.get('sms:endpoints:single:method');
    this.token = settings.get('sms:token');
    this.replacements = settings.get('sms:variables');
    this.codes = new Map();
    this.timeouts = new Map();
  }

  async challenge(username: string, profile: Profile, clientRequest: express$Request): Promise<void> {
    const code: string = await generateCode(CODE_LENGTH);
    this.setCode(username, code);
    const replacements: Map<string, string> = _.extend(this.replacements, { [this.token]: code });

    for (const [key, value] of Object.entries(replacements)) {
      profile.body = replaceRecursively(profile.body, key, value);
      profile.query = replaceRecursively(profile.query, key, value);
      profile.headers = replaceRecursively(profile.headers, key, value);
    }

    await makeRequest(this.apiMethod, this.singleUrl, profile.headers, profile.body, profile.query);
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

  setCode(username: string, code: string, ttlMilliseconds: number = CODE_TTL_MS): void {
    this.codes.set(username, code);
    this.timeouts.set(username, setTimeout(() => {
      this.clearCode(username);
    }, ttlMilliseconds)
    );
  }

  clearCode(username: string): void {
    this.codes.delete(username);
    clearTimeout(this.timeouts.get(username));
  }

}

async function makeRequest(method: string, url: string, headers: Map<string, string>, body: {}, query: mixed): Promise<void> {
  if (method === 'POST') {
    return await request
      .post(url)
      .set(headers)
      .query(query)
      .send(body);
  } else { // GET
    return request
      .get(url)
      .set(headers)
      .query(query);
  }
}



module.exports = SingleService;
