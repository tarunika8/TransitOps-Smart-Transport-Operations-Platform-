/**
 * calculateTripCost.js
 * Computes the total operational cost of a single trip.
 */

/**
 * Calculate total trip cost as:
 *   Fuel Cost + Toll Cost + Driver Cost + Other Expenses
 *
 * Each component is optional and defaults to 0 if not provided or invalid,
 * so callers can pass a partial breakdown without pre-validating everything.
 *
 * @param {Object} costs
 * @param {number} [costs.fuelCost=0] - Cost of fuel consumed on the trip.
 * @param {number} [costs.tollCost=0] - Toll charges incurred.
 * @param {number} [costs.driverCost=0] - Driver wages/allowance for the trip.
 * @param {number} [costs.otherExpenses=0] - Any other miscellaneous expenses.
 * @param {number} [decimalPlaces=2] - Number of decimal places to round to.
 * @returns {number} Total trip cost, rounded to `decimalPlaces`.
 */
const calculateTripCost = (
  { fuelCost = 0, tollCost = 0, driverCost = 0, otherExpenses = 0 } = {},
  decimalPlaces = 2
) => {
  // Coerce to numbers and treat anything invalid/negative as 0,
  // so a single bad field doesn't corrupt the whole calculation.
  const safeNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  };

  const total =
    safeNumber(fuelCost) + safeNumber(tollCost) + safeNumber(driverCost) + safeNumber(otherExpenses);

  return Number(total.toFixed(decimalPlaces));
};

module.exports = calculateTripCost;