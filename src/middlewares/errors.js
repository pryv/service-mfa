// @flow

const errorsHandling = require('../utils/errorsHandling');
const ApiError = errorsHandling.ApiError;
const logger = require('@pryv/boiler').getLogger('errors');

// Error middleware.
// NOTE: next is not used, since the request is terminated on all errors. 
/*eslint-disable no-unused-vars*/
module.exports = (error: Error | ApiError, req: express$Request, res: express$Response, next: express$NextFunction) => {
  logger.info('Error with message: ' + error.message, error);

  let meta;
  if (! (error instanceof ApiError)) {
    let message;
    let errorId;
    if (error.response != null && error.response.body != null) {
      const errorBody = error.response.body;
      if (errorBody.message != null) {
        message = errorBody.message;
      } else if (errorBody.error != null && errorBody.error.message != null) {
        message = errorBody.error.message;
      }
      meta = errorBody.meta;
      errorId = errorBody.error.id;
    }
    if (message == null && error.message != null) message = error.message;
    if (message == null) message = error.toString();
    
    if (error.id != null) errorId = error.id;
    
    let status;
    if (error.response != null) {
      status = error.response.statusCode || error.response.status;
    }
    status = status || error.status;

    error = new ApiError(status, message, errorId);
  }
  const publicError = error.getPublicErrorData();

  const response = { error: publicError };
  if (meta) response.meta = meta;

  res
    .status(error.httpStatus || 500)
    .json(response);

  logger.error(`${req.method} ${req.url} ${res.statusCode}. Error:`, publicError);
};
