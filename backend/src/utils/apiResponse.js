/**
 * apiResponse.js
 * Builds consistent response objects for the API. These functions return
 * plain objects only — they do NOT call res.json()/res.send() themselves.
 * Controllers are expected to do something like:
 *   return res.status(200).json(successResponse(data, 'Vehicle created'));
 */

/**
 * Build a standard success response object.
 *
 * @param {*} data - The payload to return (object, array, null, etc.).
 * @param {string} [message='Success'] - Human-readable success message.
 * @param {Object} [meta] - Optional metadata (pagination info, counts, etc.).
 * @returns {Object} { success: true, message, data, meta? }
 */
export const successResponse = (data = null, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Build a standard error response object.
 *
 * @param {string} [message='Something went wrong'] - Human-readable error message.
 * @param {number} [statusCode=500] - HTTP status code the caller should use.
 * @param {*} [errors=null] - Optional extra error detail (validation errors, stack info, etc.).
 * @returns {Object} { success: false, message, statusCode, errors? }
 */
export const errorResponse = (message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

export default {
  successResponse,
  errorResponse,
};