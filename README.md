# Service-mfa

A service for adding multi-factor authentication on top of Pryv.io login calls.

Prerequisites: Node v8+, Yarn v1+

## How to?

| Task                              | Command                        |
| --------------------------------- | ------------------------------ |
| Setup                             | `yarn install`                 |
| Run API server                    | `yarn start`                   |
| Run Tests                         | `yarn test`                    |
| Create Distribution               | `yarn release`                 |

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
    ttl: 60 // Duration in seconds after which sessions are destroyed
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
  - if MFA not activated: 200 {token, 'pryvPersonalToken'}

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
