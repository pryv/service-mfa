const fs = require('fs');
const path = require('path');
const ZSchema = require("z-schema");
const validator = new ZSchema();
const YAML = require('yaml');
const schema = YAML.parse(
  fs.readFileSync(
    path.resolve(__dirname, './schema/schema.yml'),
    { encoding: 'utf-8'})
);

module.exports = {
  load: (config) => {
    const isValid = validator.validate(config.get('sms'), schema);
    if (! isValid) {
      const errors = validator.getLastErrors();
      throw new Error('invalid configuration: ' + JSON.stringify(errors, null, 2));
    }
  }
}
