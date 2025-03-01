/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const middlewares = require('../middlewares');
const PryvConnection = require('../business/pryv/Connection');
const MFAProfile = require('../business/mfa/Profile');
const logger = require('@pryv/boiler').getLogger('routes');
const errorsFactory = require('../utils/errorsHandling').factory;

/**
 * @param {express$Application} expressApp
 * @param {*} settings
 * @param {MFAService} mfaService
 */
module.exports = function (expressApp, settings, mfaService) {
  // POST /:username/mfa/activate: activate mfa
  expressApp.post(
    '/:username/mfa/activate',
    middlewares.authorization,
    async (req, res, next) => {
      try {
        const username = req.params.username;
        const pryvToken = req.context.auth;
        const pryvConnection = new PryvConnection(
          settings,
          username,
          pryvToken
        );
        await pryvConnection.checkAccess(req);
        const mfaProfile = new MFAProfile(req.body);
        await mfaService.challenge(username, mfaProfile, req);
        const mfaToken = mfaService.saveSession(mfaProfile, pryvConnection);
        res.status(302).send({ mfaToken });
        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/confirm: confirm mfa activation
  expressApp.post(
    '/:username/mfa/confirm',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req, res, next) => {
      try {
        const username = req.params.username;
        const mfaSession = req.context.session;
        const mfaProfile = mfaSession.profile;
        await mfaService.verify(username, mfaProfile, req);
        mfaProfile.generateRecoveryCodes();
        await mfaSession.pryvConnection.updateProfile(req.headers, mfaProfile);
        mfaService.clearSession(mfaSession.id);
        res.status(200).send({ recoveryCodes: mfaProfile.getRecoveryCodes() });
        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/deactivate: deactivate mfa using personal token
  expressApp.post(
    '/:username/mfa/deactivate',
    middlewares.authorization,
    async (req, res, next) => {
      try {
        const username = req.params.username;
        const pryvToken = req.context.auth;
        const pryvConnection = new PryvConnection(
          settings,
          username,
          pryvToken
        );
        // Clears the MFA profile
        await pryvConnection.updateProfile(req.headers, null);
        res.status(200).send({ message: 'MFA deactivated.' });
        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/recover: deactivate mfa using recovery code and username/password
  expressApp.post('/:username/mfa/recover', async (req, res, next) => {
    try {
      const recoveryCode = req.body.recoveryCode;
      if (recoveryCode == null) {
        return next(errorsFactory.missingParameter('recoveryCode'));
      }
      delete req.body.recoveryCode;
      const username = req.params.username;
      const pryvConnection = new PryvConnection(settings, username, null);
      await pryvConnection.login(req);
      const mfaProfile = await pryvConnection.fetchProfile(req);
      if (!mfaProfile.getRecoveryCodes().includes(recoveryCode)) {
        return next(errorsFactory.invalidParameter('Invalid recovery code.'));
      }
      // Clears the MFA profile
      await pryvConnection.updateProfile(req.headers, null);
      res.status(200).send({ message: 'MFA deactivated.' });
      logger.info(`${req.method} ${req.url} ${res.statusCode}`);
    } catch (err) {
      next(err);
    }
  });

  // POST /:username/mfa/challenge: performs mfa challenge
  expressApp.post(
    '/:username/mfa/challenge',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req, res, next) => {
      try {
        const username = req.params.username;
        const mfaSession = req.context.session;
        await mfaService.challenge(username, mfaSession.profile, req);
        res.status(200).send({ message: 'Please verify the MFA challenge.' });
        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /:username/mfa/verify: verify mfa
  expressApp.post(
    '/:username/mfa/verify',
    middlewares.authorization,
    middlewares.mfaSession(mfaService),
    async (req, res, next) => {
      try {
        const username = req.params.username;
        const mfaSession = req.context.session;
        await mfaService.verify(username, mfaSession.profile, req);
        mfaService.clearSession(mfaSession.id);
        res.status(200).send({ token: mfaSession.pryvConnection.token });
        logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      } catch (err) {
        next(err);
      }
    }
  );
};
