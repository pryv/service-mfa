// @flow

const PryvConnection = require('../business/pryv/Connection');
const logger = require('../utils/logging').getLogger('routes');

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

        if (mfaProfile.isActive()) {
          const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);
          res.status(302).send({mfaToken: mfaToken});
        } else {
          res.status(200).send({token: pryvConnection.token});
        }

        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );
};
