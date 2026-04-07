# service-mfa

> **ARCHIVED — 2026-04-07.**
>
> This standalone service has been merged into **service-core** as part of
> **Plan 26**. MFA is now a native feature of service-core with canonical
> `mfa.*` API methods (`mfa.activate`, `mfa.confirm`, `mfa.challenge`,
> `mfa.verify`, `mfa.deactivate`, `mfa.recover`) — the Pryv JS SDK already
> speaks these.
>
> - **Merge commit** (service-core `refactor/pre-v2`): [`aa9abcee`](https://github.com/pryv/service-core/commit/aa9abcee)
> - **Business logic**: `service-core/components/business/src/mfa/`
> - **API methods**: `service-core/components/api-server/src/methods/mfa.js`
> - **HTTP routes**: `service-core/components/api-server/src/routes/mfa.js`
> - **Config schema**: new `services.mfa` block in `service-core/config/default-config.yml`
>   (default `mode: disabled` — fully backwards-compatible)
> - **Acceptance tests**: `service-core/components/api-server/test/mfa-seq.test.js`
> - **CHANGELOG entries**: see `service-core/CHANGELOG-v2.md` and
>   `CHANGELOG-v2-back.md` under "Plan 26".
>
> No further work will happen on this repository. If you need to understand
> the historical design, read this file and then follow the pointers above.

---

A service for adding multi-factor authentication on top of Pryv.io login calls.


## Installation

Prerequisites: [Node.js](https://nodejs.org/en/download/) 16, [just](https://github.com/casey/just#installation)

Then:
1. `just setup-dev-env`
2. `just install` to install node modules

Running `just` with no argument displays the available commands (defined in `justfile`).


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
    prefix: 'mfa',
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

## Contributing

### Todo 
- update docker pryvio/base1.8.1 to base1.9.0 (or latest)
- realease github workflow has been archived in `archives` it needs to rewritten to publish on dockerHub

## License

[BSD-3-Clause](LICENSE)
