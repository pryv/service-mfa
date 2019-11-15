// @flow

const middlewares = require('../middlewares');
const PryvConnection = require('../business/pryv/Connection');
const MFAProfile = require('../business/mfa/Profile');

import type MFAService from '../business/mfa/Service';

module.exports = function (expressApp: express$Application, settings: Object, mfaService: MFAService) {

  // POST /:username/mfa/activate: activate mfa
  expressApp.post('/:username/mfa/activate',
    middlewares.authorization,
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const username = req.params.username;
        const pryvToken = req.context.auth;
        const pryvConnection = new PryvConnection(settings, username, pryvToken);
        await pryvConnection.checkAccess();

        const mfaProfile = new MFAProfile(req.body);

        await mfaService.challenge(mfaProfile, req);

        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);

        res.status(302).send({mfaToken: mfaToken});
      } catch(err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/confirm: confirm mfa activation
  expressApp.post('/:username/mfa/confirm',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        await mfaService.verify(mfaSession.profile, req);

        mfaSession.connection.updateProfile(mfaSession.profile);
        mfaService.clearSession(mfaSession.id);
        res.status(200).send('MFA activated.');
      } catch(err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/challenge: performs mfa challenge
  expressApp.post('/:username/mfa/challenge',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        await mfaService.challenge(mfaSession.profile, req);

        res.status(200).send('Please verify MFA challenge.');
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/verify: verify mfa
  expressApp.post('/:username/mfa/verify',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const mfaSession = req.context.session;
        await mfaService.verify(mfaSession.profile, req);

        mfaService.clearSession(mfaSession.id);
        res.status(200).send({token: mfaSession.connection.token});
      } catch (err) {
        next(err);
      }
    }
  );
};
