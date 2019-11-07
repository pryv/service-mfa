// @flow

const PryvConnection = require('../business/PryvConnection');
const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

// Auth middleware
// 
module.exports = (settings: Object, cache: Object, authMethod: string) => {
  return async (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const coreUrl = settings.get('core:url');
    const username = req.body.username;
    let pryvConnection;

    switch (authMethod) {
      case 'pryvCredentials':
        pryvConnection = new PryvConnection(username, coreUrl, null);
        await pryvConnection.login(req.body.password, req.body.appId);
        break;
      case 'pryvToken':
        const pryvToken = req.header('Authorization') || req.query.auth;
        pryvConnection = new PryvConnection(username, coreUrl, pryvToken);
        await pryvConnection.checkAccess();
        break;
      case 'mfaToken':
        const mfaToken = req.header('Authorization') || req.query.auth[0];
        const pryvTokenFromCache = cache[mfaToken];
        if (pryvTokenFromCache == null) {
          next(errorsFactory.unauthorized('Invalid MFA authorization token.'));
        }
        pryvConnection = new PryvConnection(username, coreUrl, pryvTokenFromCache);
        await pryvConnection.checkAccess();
        break;
      default:
        next(new Error('Could not find authentication method.'));
    }

    req.context = Object.assign({}, req.context, {pryvConnection: pryvConnection});
    
    next();
  };
};
