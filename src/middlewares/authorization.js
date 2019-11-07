// @flow

const PryvConnection = require('../business/PryvConnection');
const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;

// Auth middleware
// 
module.exports = (settings: Object, cache: Object, authMethod: string) => {
  return async (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const coreUrl = settings.get('core:url');
    let pryvConnection;

    // Check username format
    const reUsername = /^([a-zA-Z0-9])(([a-zA-Z0-9-]){3,21})[a-zA-Z0-9]$/;
    const username = req.params.username;
    if(username == null || !username.match(reUsername)) {
      return next(errorsFactory.invalidParameter('Invalid or missing username.'));
    }

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
        const pryvTokenFromCache = cache[mfaToken];
        if (pryvTokenFromCache == null) {
          next(errorsFactory.unauthorized('Invalid MFA authorization token.'));
        }
        pryvConnection = new PryvConnection(settings, username, pryvTokenFromCache);
        await pryvConnection.checkAccess();
        break;
      default:
        next(new Error('Could not find authentication method.'));
    }

    req.context = Object.assign({}, req.context, {pryvConnection: pryvConnection});
    
    next();
  };
};
