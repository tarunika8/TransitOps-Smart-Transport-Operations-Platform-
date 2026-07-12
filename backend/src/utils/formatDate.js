/**
 * formatDate.js
 * Formats JavaScript Date objects into common display formats.
 */

const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Zero-pad a number to at least 2 digits (e.g. 5 -> "05").
 * @param {number} num
 * @returns {string}
 */
const pad2 = (num) => String(num).padStart(2, '0');

/**
 * Normalize input into a valid Date instance, or return null if it can't be parsed.
 * Accepts a Date object, ISO string, or timestamp.
 *
 * @param {Date|string|number} input
 * @returns {Date|null}
 */
const toDate = (input) => {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date as DD/MM/YYYY.
 *
 * @param {Date|string|number} input
 * @returns {string} Formatted date, or '' if input is invalid.
 */
export const formatDDMMYYYY = (input) => {
  const date = toDate(input);
  if (!date) return '';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/**
 * Format a date as YYYY-MM-DD (ISO-style, commonly used for <input type="date">
 * and database queries).
 *
 * @param {Date|string|number} input
 * @returns {string} Formatted date, or '' if input is invalid.
 */
export const formatYYYYMMDD = (input) => {
  const date = toDate(input);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

/**
 * Format a date as DD-MMM-YYYY (e.g. 12-Jul-2026).
 *
 * @param {Date|string|number} input
 * @returns {string} Formatted date, or '' if input is invalid.
 */
export const formatDDMMMYYYY = (input) => {
  const date = toDate(input);
  if (!date) return '';
  return `${pad2(date.getDate())}-${MONTH_ABBREVIATIONS[date.getMonth()]}-${date.getFullYear()}`;
};

export default {
  formatDDMMYYYY,
  formatYYYYMMDD,
  formatDDMMMYYYY,
};