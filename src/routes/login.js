/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const PryvConnection = require('../business/pryv/Connection');
const logger = require('@pryv/boiler').getLogger('routes');

/**
 * @param {express$Application} expressApp
 * @param {*} settings
 * @param {MFAService} mfaService
 */
module.exports = function (expressApp, settings, mfaService) {
  // POST /login: proxied Pryv login
  expressApp.post('/:username/login', async (req, res, next) => {
    try {
      const username = req.params.username;
      const pryvConnection = new PryvConnection(settings, username, null);
      await pryvConnection.login(req);
      const mfaProfile = await pryvConnection.fetchProfile(req);

      if (mfaProfile.isActive()) {
        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);
        res.status(302).send({ mfaToken });
      } else {
        res.status(200).send(pryvConnection.content);
      }

      logger.info(`${req.method} ${req.url} ${res.statusCode}`);
    } catch (err) {
      next(err);
    }
  });
};
