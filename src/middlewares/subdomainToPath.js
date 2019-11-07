// @flow

const errors = require('../utils/errorsHandling').factory;

// Middleware to translate the subdomain (i.e. username) in requests (if any) into the URL path,
// e.g. path "/audit" on host ignace.pryv.io becomes "/ignace/audit".
// Does not add the username again if it is already present as the path root.
//
// TODO: this responsibility could be moved out to the reverse proxy (e.g. Nginx)
//
module.exports = function (req: express$Request, res: express$Response, next: express$NextFunction) {

  if (! req.headers.host) { return next(errors.missingHeader('Host')); }

  const hostChunks = req.headers.host.split('.');
  // check for subdomain, assuming we have structure '<subdomain>.<2nd level domain>.<tld>
  if (hostChunks.length < 3) return next();
  
  // For security reasons, don't allow inserting anything into path unless it
  // looks like a user name. 
  const firstChunk = hostChunks[0];
  if (! looksLikeUsername(firstChunk)) return next(); 
  
  // Skip if it is already in the path.
  const pathPrefix = `/${firstChunk}`;
  if (req.url.startsWith(pathPrefix)) return next(); 

  req.url = pathPrefix + req.url;
  next();
};

function looksLikeUsername(candidate: string): boolean {
  const reUsername = /^([a-zA-Z0-9])(([a-zA-Z0-9-]){3,21})[a-zA-Z0-9]$/; 
  
  return reUsername.test(candidate);
}