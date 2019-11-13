// @flow

const PryvConnection = require('../business/pryv/Connection');

import type MFAService from '../business/mfa/Service';

module.exports = function (expressApp: express$Application, settings: Object, mfaService: MFAService) {

  // POST /login: proxied Pryv login
  expressApp.post('/:username/login',
    async (req: express$Request, res: express$Response, next: express$NextFunction) => {
      try {
        const username = req.params.username;
        const pryvConnection = new PryvConnection(settings, username, null);
        await pryvConnection.login(req.body, req.headers);
        const mfaProfile = await pryvConnection.fetchProfile();

        if (!mfaProfile.isActive()) {
          return res.status(200).send({token: pryvConnection.token});
        }

        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);

        res.status(302).send({mfaToken: mfaToken});
      } catch (err) {
        next(err);
      }
    }
  );
};
