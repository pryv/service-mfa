// @flow
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

class Profile {

  content: mixed;
  recoveryCodes: Array<string>;
  
  constructor(content: mixed = {}, recoveryCodes: Array<string> = []) {
    this.recoveryCodes = recoveryCodes;
    this.content = content;
  }

  isActive() {
    return  ! _.isEmpty(this.content);
  }

  generateRecoveryCodes () {
    this.recoveryCodes = new Array(10).fill().map(() => {return uuidv4();});
  }

  getRecoveryCodes () {
    return this.recoveryCodes;
  }
}

module.exports = Profile;
