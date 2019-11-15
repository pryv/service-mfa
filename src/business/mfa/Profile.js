// @flow

class Profile {

  content: ?mixed;

  constructor(content: ?mixed) {
    this.content = content;
  }

  isActive() {
    return this.content != null;
  }
}

module.exports = Profile;
