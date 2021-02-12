// @flow

// Class that implements an Api Error.
//
class ApiError extends Error {

  httpStatus: number;
  message: string;
  id: ?string;

  constructor(status: number, msg: string, id: ?string) {
    super(msg);
    this.httpStatus = status;
    this.message = msg;
    this.id = id || 'unexpected-error';
  }

  getPublicErrorData() {
    return {
      message: this.message,
      id: this.id
    };
  }

}

// Factory class that allows to generate Api Error.
//
class ErrorsFactory {

  unexpectedError(error: Error) {
    const msg = error.message || 'Unexpected error.';
    return new ApiError(500, msg, 'unexpected-error');
  }

  unauthorized(message: ?string) {
    const msg = message || 'Operation is not authorized.';
    return new ApiError(403, msg, 'forbidden');
  }

  invalidParameter(message: ?string) {
    const msg = message || 'Some of the provided parameters are invalid.';
    return new ApiError(400, msg, 'invalid-parameters-format');
  }

  missingParameter(param: string) {
    const msg = `Missing parameter: ${param}.`;
    return new ApiError(400, msg, 'invalid-request-structure');
  }

  missingHeader (headerName: string): ApiError {
    const msg = `Missing expected header "${headerName}".`;
    return new ApiError(400, msg, 'missing-header');
  }

  notFound (message: ?string): ApiError {
    const msg = message || 'Resource not found.';
    return new ApiError(404, msg, 'unknown-resource');
  }

}

module.exports.factory = new ErrorsFactory();
module.exports.ApiError = ApiError;
