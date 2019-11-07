// @flow

const errorsFactory = require('../utils/errorsHandling').factory;
const middlewares = require('../middlewares');
const request = require('superagent');
const PryvConnection = require('../business/PryvConnection');
const SMSService = require('../business/SMSService');

module.exports = function (expressApp: express$Application, settings: Object, cache: Object) {

  // POST /2fa/activate: activate 2fa
  expressApp.post('/2fa/activate',
    middlewares.authorization(settings, cache, 'pryvToken'),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const phoneNumber = req.body.phone;
        const id = await new SMSService(settings).challenge(phoneNumber);

        res.status(302).send(id);
      } catch(err) {
        next(err);
      }
    }
  );

    // POST /2fa/confirm: confirm 2fa activation
  expressApp.post('/2fa/confirm',
    middlewares.authorization(settings, cache, 'pryvToken'),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const code = req.body.code;
        const phoneNumber = req.body.phone;

        const valid = await new SMSService(settings).verify(phoneNumber, code);

        if (valid) {
          req.context.pryvConnection.updateProfile({
            mfa: {
              method: 'sms',
              value: phoneNumber,
            }
          })
          res.status(200).send('MFA activated.');
        } else {
          next(errorsFactory.unauthorized('Invalid MFA code.'));
        }
      } catch(err) {
        next(err);
      }
    }
  );

  // POST /2fa/verify: verify 2fa
  expressApp.post('/2fa/verify',
    middlewares.authorization(settings, cache, 'mfaToken'),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const code = req.body.code;
        const phoneNumber = req.body.phone;

        const valid = await new SMSService(settings).verify(phoneNumber, code);

        if (valid) {
          res.status(200).send({token: pryvToken});
        } else {
          next(errorsFactory.unauthorized('Invalid MFA code.'));
        }
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /2fa/login: performs 2fa on top of a proxied Pryv login
  expressApp.post('/2fa/login',
    middlewares.authorization(settings, cache, 'pryvCredentials'),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const pryvConnection = req.context.pryvConnection;
        const profile = await pryvConnection.fetchProfile();

        if (profile.mfa == null || profile.mfa.method == null || profile.mfa.value == null) {
          return res.status(200).send({token: pryvConnection.token});
        }

        const phoneNumber = profile.mfa.value;

        const id = await new SMSService(settings).challenge(phoneNumber);

        cache[id] = {
          username: pryvConnection.username,
          token: pryvConnection.token,
        }

        res.status(302).send(id);
      } catch (err) {
        next(err);
      }
    }
  );
};
