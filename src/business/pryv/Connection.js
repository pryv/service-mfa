/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const request = require('superagent');
const Profile = require('../mfa/Profile');
const { factory } = require('../../utils/errorsHandling');
const PERSONAL_ACCESS_TYPE = 'personal';

class Connection {
  /**
   * @type {string}
   */
  token = undefined;
  /**
   * @type {string}
   */
  username = undefined;
  /**
   * @type {string}
   */
  coreUrl = undefined;
  /**
   * @type {object}
   */
  content = undefined;

  /**
   * @param {*} settings
   * @param {string} username
   * @param {string|null} token
   */
  constructor (settings, username, token) {
    this.username = username;
    this.coreUrl = settings.get('core:url');
    this.token = token;
    this.content = null;
  }

  /**
   * @param {express$Request} req
   * @returns {Promise<void>}
   */
  async login (req) {
    const res = await request
      .post(`${this.coreUrl}/${this.username}/auth/login`)
      .set(allowedHeaders(req.headers))
      .send(req.body);
    this.token = res.body.token;
    this.content = res.body;
  }

  /**
   * @param {express$Request} req
   * @returns {Promise<any>}
   */
  async fetchProfile (req) {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
    const pryvProfile = res.body.profile;
    const mfaProfile = pryvProfile.mfa;
    if (mfaProfile == null) return new Profile();
    return new Profile(mfaProfile.content, mfaProfile.recoveryCodes);
  }

  /**
   * @param {Map<string, string>} reqHeaders
   * @param {Profile | null} profile
   * @returns {Promise<void>}
   */
  async updateProfile (reqHeaders, profile) {
    let update = null;
    if (profile != null) {
      update = {
        content: profile.content,
        recoveryCodes: profile.recoveryCodes
      };
    }
    await request
      .put(`${this.coreUrl}/${this.username}/profile/private`)
      .set(allowedHeaders(reqHeaders))
      .set('Authorization', this.token)
      .send({ mfa: update });
  }

  /**
   * @param {express$Request} req
   * @returns {Promise<void>}
   */
  async checkAccess (req) {
    const res = await request
      .get(`${this.coreUrl}/${this.username}/access-info`)
      .set(allowedHeaders(req.headers))
      .set('Authorization', this.token);
    if (res.body.type !== PERSONAL_ACCESS_TYPE) {
      const error = factory.unauthorized(
        'You cannot access this resource using the given access token.'
      );
      throw error;
    }
  }
}
module.exports = Connection;

/**
 * @param {any} headers
 * @returns {unknown}
 */
function allowedHeaders (headers) {
  const allowed = ['origin', 'Origin', 'referer', 'Referer', 'host', 'Host'];
  const filtered = Object.keys(headers)
    .filter((key) => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = headers[key];
      return obj;
    }, {});
  return filtered;
}
