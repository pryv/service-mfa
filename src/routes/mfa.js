// @flow

const errorsFactory = require('../utils/errorsHandling').factory;
const middlewares = require('../middlewares');
const PryvConnection = require('../business/pryv/Connection');
const MFAProfile = require('../business/mfa/Profile');

import type MFAService from '../business/mfa/Service';

module.exports = function (expressApp: express$Application, settings: Object, mfaService: MFAService) {

  // POST /:username/mfa/activate: activate mfa
  expressApp.post('/:username/mfa/activate',
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const username = req.params.username;
        const pryvToken = req.header('Authorization') || req.query.auth;
        const pryvConnection = new PryvConnection(settings, username, pryvToken);
        await pryvConnection.checkAccess();

        const phoneNumber = req.body.phone;
        await mfaService.challenge(phoneNumber);

        const mfaProfile = new MFAProfile('sms', phoneNumber);

        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);

        res.status(302).send({mfaToken: mfaToken});
      } catch(err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/confirm: confirm mfa activation
  expressApp.post('/:username/mfa/confirm',
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        const code = req.body.code;
        const phoneNumber = mfaSession.profile.factor;

        const valid = await mfaService.verify(phoneNumber, code);

        if (valid) {
          mfaSession.connection.updateProfile(mfaSession.profile);
          mfaService.clearSession(mfaSession.id);
          res.status(200).send('MFA activated.');
        } else {
          next(errorsFactory.unauthorized('Invalid MFA code.'));
        }
      } catch(err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/challenge: performs mfa challenge
  expressApp.post('/:username/mfa/challenge',
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        const phoneNumber = mfaSession.profile.factor;
        await mfaService.challenge(phoneNumber);

        res.status(200).send('Please verify MFA challenge.');
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/verify: verify mfa
  expressApp.post('/:username/mfa/verify',
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        const code = req.body.code;
        const phoneNumber = mfaSession.profile.factor;
        const pryvToken = mfaSession.connection.token;

        const valid = await mfaService.verify(phoneNumber, code);

        if (valid) {
          mfaService.clearSession(mfaSession.id);
          res.status(200).send({token: pryvToken});
        } else {
          next(errorsFactory.unauthorized('Invalid MFA code.'));
        }
      } catch (err) {
        next(err);
      }
    }
  );
};
