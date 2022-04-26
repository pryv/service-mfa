# service-mfa

A service for adding multi-factor authentication on top of Pryv.io login calls.


## Installation

Prerequisites: [Node.js](https://nodejs.org/en/download/) 16, [just](https://github.com/casey/just#installation)

Then:
1. `just setup-dev-env`
2. `just install` to install node modules
3. `just compile-dev` for the initial code compilation into `dist`

Running `just` with no argument displays the available commands (defined in `justfile`).


## Flowtype transpilation

```
just compile-(release|dev|watch)
```
at least once before running the server or tests, to transpile the source code from Flowtype to pure JS (the compiled code is in `dist/`).
- `just compile-release` by default
- `just compile-dev` to include source maps
- `just compile-watch` to recompile all files after each saved change. Look out for compilation errors that might prevent the distribution from being updated.


## Testing

```
just test [...params]
```
- Extra parameters at the end are passed on to [Mocha](https://mochajs.org/) (default settings are defined in `.mocharc.js`)
- Replace `test` with `test-detailed`, `test-debug`, `test-cover` for common presets


## Configuration

Here is a documented default configuration for this service:

```yml
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
    url: 'http://core_router:1337'
  },
  // API to send MFA challenge by SMS
  sms: {
    endpoints: {
      challenge: '', // Endpoint that triggers the MFA challenge
      verify: '', // Endpoint that verifies the MFA challenge
    },
    auth: '' // API key, sent as 'Authorization' header
  },
  // Sessions are used to cache the state of MFA processes in progress
  sessions: {
    ttlSeconds: 1800 // Duration in seconds after which sessions are destroyed
  }
```


## API routes

### /:username/login

The proxied Pryv.io login call.

`Request body`:
  - username
  - password
  - appId

`Request headers`:
  - 'Origin'?

`Response`:
  - if MFA activated: 302 {mfaToken: 'mfaToken'}
  - if MFA not activated: 200 {token: 'pryvPersonalToken'}

### /:username/mfa/activate

Ask activation of MFA for current user.

`Request body`:
  - phone: the phone number that will receive the challenge code by SMS

`Request headers`:
  - 'Authorization': Pryv.io personal token

`Response`:
  - 302 {mfaToken: 'mfaToken'}

### /:username/mfa/confirm

Confirm activation of MFA for current user.

`Request body`:
  - code: the challenge code to be verified

`Request headers`:
  - 'Authorization': mfaToken

`Response`:
  - 200 'MFA activated.'

### /:username/mfa/challenge

Trigger the MFA challenge.

`Request headers`:
  - 'Authorization': mfaToken

`Response`:
  - 200 'Please verify MFA challenge.'

### /:username/mfa/verify

Verify the MFA challenge.

`Request body`:
  - code: the challenge code to be verified

`Request headers`:
  - 'Authorization': mfaToken

`Response`:
  - 200 {token: 'pryvPersonalToken'}


## License

[UNLICENSED](LICENSE)
