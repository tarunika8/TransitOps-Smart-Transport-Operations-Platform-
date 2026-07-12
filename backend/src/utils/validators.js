/**
 * validators.js
 * Small, dependency-free validation helpers reused across services/controllers.
 * Each function returns a boolean (or, for isValidPassword, an object with
 * detail) so callers decide how to surface the failure — no throwing here.
 */

/**
 * Validate an email address using a standard, pragmatic regex.
 * Not fully RFC-5322 compliant (nothing simple is), but catches the
 * overwhelming majority of real-world malformed addresses.
 *
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate a phone number.
 * Accepts an optional leading "+", then 7-15 digits (E.164-ish range),
 * with optional spaces/dashes/parentheses stripped before checking.
 *
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhoneNumber = (phone) => {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-().]/g, '');
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate a vehicle registration number.
 * Accepts alphanumeric characters and hyphens, 4-12 characters long
 * (covers common formats like "KA-01-AB-1234" or "VAN-05").
 * Adjust the regex if your region has a stricter/different format.
 *
 * @param {string} registrationNumber
 * @returns {boolean}
 */
const isValidRegistrationNumber = (registrationNumber) => {
  if (typeof registrationNumber !== 'string') return false;
  const regex = /^[A-Za-z0-9-]{4,12}$/;
  return regex.test(registrationNumber.trim());
};

/**
 * Validate that all required fields are present (and not empty/null/undefined)
 * on a given object.
 *
 * @param {Object} data - The object to check (e.g. req.body).
 * @param {string[]} requiredFields - List of field names that must be present.
 * @returns {{ isValid: boolean, missingFields: string[] }}
 */
const validateRequiredFields = (data = {}, requiredFields = []) => {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate password strength.
 * Default policy: at least 8 characters, containing at least one uppercase
 * letter, one lowercase letter, one digit, and one special character.
 *
 * @param {string} password
 * @returns {{ isValid: boolean, reasons: string[] }}
 */
const isValidPassword = (password) => {
  const reasons = [];

  if (typeof password !== 'string') {
    return { isValid: false, reasons: ['Password must be a string'] };
  }

  if (password.length < 8) reasons.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) reasons.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) reasons.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) reasons.push('Password must contain at least one digit');
  if (!/[^A-Za-z0-9]/.test(password)) reasons.push('Password must contain at least one special character');

  return {
    isValid: reasons.length === 0,
    reasons,
  };
};

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  isValidRegistrationNumber,
  validateRequiredFields,
  isValidPassword,
};