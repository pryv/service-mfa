// @flow

const PryvConnection = require('../business/PryvConnection');
const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

// Auth middleware
// 
module.exports = (settings: Object, cache: Object, authMethod: string) => {
  return async (req: express$Request, res: express$Response, next: express$NextFunction) => {
    try {
      const coreUrl = settings.get('core:url');
      let pryvConnection;

      switch (authMethod) {
        case 'pryvCredentials':
          pryvConnection = new PryvConnection(settings, username, null);
          await pryvConnection.login(req.body.password, req.body.appId);
          break;
        case 'pryvToken':
          const pryvToken = req.header('Authorization') || req.query.auth;
          pryvConnection = new PryvConnection(settings, username, pryvToken);
          await pryvConnection.checkAccess();
          break;
        case 'mfaToken':
          const mfaToken = req.header('Authorization') || req.query.auth;
          if (cache[mfaToken] == null || cache[mfaToken].token == null) {
            next(errorsFactory.unauthorized('Invalid MFA authorization token.'));
          }
          pryvConnection = new PryvConnection(settings, username, cache[mfaToken].token);
          // Don't worry if pryv token has expired during the flow?
          // await pryvConnection.checkAccess();
          break;
        default:
          next(new Error('Could not find authentication method.'));
      }

      req.context = Object.assign({}, req.context, {pryvConnection: pryvConnection});
      
      next();
    } catch(err) {
      console.log(err);
      next(err);
    }
  };
};
