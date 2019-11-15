// @flow

const nconf = require('nconf');

// 1. `process.env`
// 2. `process.argv`
//
nconf.env().argv();

// 3. Values in `config.json`
//
const configFile = nconf.get('config') || 'dev-config.json';
nconf.file({ file: configFile});

// 4. Any default values
//
nconf.defaults({
  http: {
    port: 7000,
    ip: '127.0.0.1',
  },
  logs: {
    prefix: 'service-mfa',
    console: {
      active: true,
      level: 'info',
      colorize: true
    },
    file: {
      active: false
    },
  },
  // Pryv.io core to which the login calls will be forwarded
  core: {
    url: 'http://core:9000'
  },
  // API to send MFA challenge by SMS
  sms: {
    endpoints: {
      challenge: '', // Endpoint that triggers the MFA challenge
      verify: '', // Endpoint that verifies the MFA challenge
    },
    auth: '' // API key
  },
  // Sessions are used to cache the state of MFA processes in progress
  sessions: {
    ttlSeconds: 60 // Duration in seconds after which sessions are destroyed
  }
});

module.exports = nconf;
