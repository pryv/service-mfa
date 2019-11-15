// @flow

const errorsHandling = require('../utils/errorsHandling');
const ApiError = errorsHandling.ApiError;
const logging = require('../utils/logging');
const logger = logging.getLogger('errors');

// Error middleware.
// NOTE: next is not used, since the request is terminated on all errors. 
/*eslint-disable no-unused-vars*/
module.exports = (error: Error | ApiError, req: express$Request, res: express$Response, next: express$NextFunction) => {
  logger.debug('Error with message: ' + error.message, error);
  
  if (! (error instanceof ApiError)) {
    let message;

    if (error.response != null && error.response.body != null) {
      const errorBody = error.response.body;
      if (errorBody.message != null) {
        message = errorBody.message;
      } else if (errorBody.error != null && errorBody.error.message != null) {
        message = errorBody.error.message;
      }
    }

    if (message == null) {
      message = error.toString();
    }
    
    const status = error.status || error.response.statusCode || error.response.status;
    error = new ApiError(status, message);
  }

  res
    .status(error.httpStatus || 500)
    .json({error: error.getPublicErrorData()});
};
