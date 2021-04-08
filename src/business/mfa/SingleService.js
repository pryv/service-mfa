// @flow

const _ = require('lodash');
const request = require('superagent');

const Service = require('./Service');
const generateCode = require('./generateCode');
const replaceRecursively = require('../../utils/replaceRecursively');
import type Profile from './Profile';

const CODE_LENGTH = 4;
const CODE_TOKEN = '{{ code }}';

class ChallengeVerifyService extends Service {

  headers: Map<string, string>;
  singleUrl: string;
  endpointVerify: string;
  apiMethod: string;
  /**
   * username -> code
   */
  codes: Map<string, string>;

  constructor(settings: Object) {
    super(settings);
    this.headers = settings.get('sms:endpoints:single:headers');
    this.singleUrl = settings.get('sms:endpoints:single:url');
    this.apiMethod = settings.get('sms:endpoints:single:method');
    this.codes = new Map();
  }

  async challenge(username: string, profile: Profile, query: mixed): Promise<void> {
    const code = await generateCode(CODE_LENGTH);
    this.codes.set(username, code);

    const payload = replaceRecursively(profile.content, CODE_TOKEN, code);

    await makeRequest(this.apiMethod, this.singleUrl, this.headers, payload, query);
  }

  async verify(username: string, profile: Profile, query: {}, body: {}): Promise<void> {
    const code = this.codes.get(username);
    if (code !== body.code) throw new Error('non-matching codes');
  }

}

async function makeRequest(method: string, url: string, headers: Map<string, string>, content: {}, query: mixed): Promise<void> {
  
  if (method === 'POST') {
    return await request
      .post(url)
      .set(headers)
      .query(query)
      .send(content);
  } else { // GET
    return request
      .get(url)
      .set(headers)
      .query(_.extend(content, query));
  }
}



module.exports = ChallengeVerifyService;
