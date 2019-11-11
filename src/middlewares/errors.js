// @flow

const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;
const ApiError = errorsHandling.ApiError;
const logging = require('../utils/logging');
const logger = logging.getLogger('errors');

// Error middleware.
// NOTE: next is not used, since the request is terminated on all errors. 
/*eslint-disable no-unused-vars*/
module.exports = (error: Error | ApiError, req: express$Request, res: express$Response, next: express$NextFunction) => {
  logger.debug('Error with message: ' + error.message, error);
  
  if (! (error instanceof ApiError)) {
    if (error.response != null && error.response.body != null && error.response.body.error != null) {
      const errorBody = error.response.body.error;
      const status = error.status || error.response.statusCode || error.response.status;
      error = new ApiError(status, errorBody.message);
    } else {
      error = errorsFactory.unexpectedError(error);
    }
  }

  res
    .status(error.httpStatus || 500)
    .json({error: error.getPublicErrorData()});
};
