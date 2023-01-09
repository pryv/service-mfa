/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
class ApiError extends Error {
  /**
   * @type {number}
   */
  httpStatus = undefined;
  /**
   * @type {string}
   */
  message = undefined;
  /**
   * @type {string}
   */
  id = undefined;

  /**
   *
   * @param {number} status
   * @param {string} msg
   * @param {string} id
   */
  constructor(status, msg, id = 'unexpected-error') {
    super(msg);
    this.httpStatus = status;
    this.message = msg;
    this.id = id;
  }

  /**
   * @returns {{ message: string; id: string; }}
   */
  getPublicErrorData() {
    return {
      message: this.message,
      id: this.id
    };
  }
}
module.exports.ApiError = ApiError;

/**
 * Factory class that allows to generate Api Error.
 */
class ErrorsFactory {
  /**
   * @param {Error} error
   * @returns {ApiError}
   */
  unexpectedError(error) {
    const msg = error.message || 'Unexpected error.';
    return new ApiError(500, msg, 'unexpected-error');
  }

  /**
   * @param {string | null} message
   * @returns {ApiError}
   */
  unauthorized(message) {
    const msg = message || 'Operation is not authorized.';
    return new ApiError(403, msg, 'forbidden');
  }

  /**
   * @param {string | null} message
   * @returns {ApiError}
   */
  invalidParameter(message) {
    const msg = message || 'Some of the provided parameters are invalid.';
    return new ApiError(400, msg, 'invalid-parameters-format');
  }

  /**
   * @param {string} param
   * @returns {ApiError}
   */
  missingParameter(param) {
    const msg = `Missing parameter: ${param}.`;
    return new ApiError(400, msg, 'invalid-request-structure');
  }

  /**
   * @param {string} headerName
   * @returns {ApiError}
   */
  missingHeader(headerName) {
    const msg = `Missing expected header "${headerName}".`;
    return new ApiError(400, msg, 'missing-header');
  }

  /**
   * @param {string | null} message
   * @returns {ApiError}
   */
  notFound(message) {
    const msg = message || 'Resource not found.';
    return new ApiError(404, msg, 'unknown-resource');
  }
}
module.exports.factory = new ErrorsFactory();
