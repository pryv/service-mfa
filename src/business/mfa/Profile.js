// @flow
const uuidv4 = require('uuid/v4');

class Profile {

  body: mixed;
  query: mixed;
  headers: mixed;
  recoveryCodes: Array<string>;
  
  constructor(body: mixed = {}, query: mixed = {}, headers: mixed = {}, recoveryCodes: ?Array<string>) {
    this.recoveryCodes = recoveryCodes || [];
    this.body = body;
    this.query = query;
    this.headers = headers;
  }

  isActive() {
    return this.body != null ||
      this.query != null ||
      this.headers != null;
  }

  generateRecoveryCodes () {
    this.recoveryCodes = new Array(10).fill().map(() => {return uuidv4();});
  }

  getRecoveryCodes () {
    return this.recoveryCodes;
  }
}

module.exports = Profile;
