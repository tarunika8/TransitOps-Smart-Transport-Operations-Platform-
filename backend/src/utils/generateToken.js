import jwt from 'jsonwebtoken';

// Pulled from environment so secrets/expiry never live in source code.
// Falls back to safe-ish defaults only for local development.
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a given payload.
 *
 * @param {Object} payload - Data to embed in the token (e.g. { id, role, email }).
 *                           Keep this minimal — avoid putting sensitive data here,
 *                           since JWT payloads are base64-encoded, not encrypted.
 * @param {Object} [options] - Optional overrides.
 * @param {string} [options.expiresIn] - Override the default expiry (e.g. '1h', '30d').
 * @returns {string} Signed JWT string.
 */
export const generateToken = (payload, options = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('generateToken requires a payload object');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT.
 * Throws if the token is invalid, malformed, or expired — callers should
 * wrap this in a try/catch (typically inside auth middleware).
 *
 * @param {string} token - The JWT string to verify.
 * @returns {Object} The decoded payload.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default generateToken;