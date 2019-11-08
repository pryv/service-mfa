// @flow

class Profile {

  id: ?string;
  factor: ?string;

  constructor(id: ?string, factor: ?string) {
    this.id = id;
    this.factor = factor;
  }

  isActive() {
    return this.id != null && this.factor != null;
  }
}

module.exports = Profile;
