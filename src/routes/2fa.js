// @flow

const errorsFactory = require('../utils/errorsHandling').factory;
const middlewares = require('../middlewares');
const request = require('superagent');
const PryvConnection = require('../business/pryv/Connection');
const MFAProfile = require('../business/mfa/Profile');

import type MFAService from '../business/mfa/Service';

module.exports = function (expressApp: express$Application, settings: Object, mfaService: MFAService) {

  // POST /:username/2fa/activate: activate 2fa
  expressApp.post('/:username/2fa/activate',
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const username = req.params.username;
        const pryvToken = req.header('Authorization') || req.query.auth;
        const pryvConnection = new PryvConnection(settings, username, pryvToken);
        await pryvConnection.checkAccess();

        const phoneNumber = req.body.value;
        await mfaService.challenge(phoneNumber);

        const mfaProfile = new MFAProfile('sms', phoneNumber);

        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);

        res.status(302).send(`MFA required: ${mfaToken}`);
      } catch(err) {
        next(err);
      }
    }
  );

    // POST /:username/2fa/confirm: confirm 2fa activation
  expressApp.post('/:username/2fa/confirm',
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

  // POST /:username/2fa/challenge: performs 2fa challenge
  expressApp.post('/:username/2fa/challenge',
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

  // POST /:username/2fa/verify: verify 2fa
  expressApp.post('/:username/2fa/verify',
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

  // POST /login: proxied Pryv login
  expressApp.post('/:username/login',
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const username = req.params.username;
        const pryvConnection = new PryvConnection(settings, username, null);
        await pryvConnection.login(req.body.password, req.body.appId);
        const mfaProfile = await pryvConnection.fetchProfile();

        if (!mfaProfile.isActive()) {
          return res.status(200).send({token: pryvConnection.token});
        }

        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);

        res.status(302).send(`MFA required: ${mfaToken}`);
      } catch (err) {
        next(err);
      }
    }
  );
};
