/**
 * calculateMileage.js
 * Computes fuel mileage (distance travelled per unit of fuel consumed).
 */

/**
 * Calculate mileage = distance / liters.
 * Safely handles divide-by-zero and invalid input by returning 0 instead
 * of throwing or producing NaN/Infinity.
 *
 * @param {number} distance - Distance travelled (e.g. km).
 * @param {number} liters - Fuel consumed (in liters).
 * @param {number} [decimalPlaces=2] - Number of decimal places to round to.
 * @returns {number} Mileage (distance per liter), or 0 if it can't be computed.
 */
const calculateMileage = (distance, liters, decimalPlaces = 2) => {
  const dist = Number(distance);
  const fuel = Number(liters);

  // Guard against invalid numbers, negative values, or zero/undefined fuel
  if (!Number.isFinite(dist) || !Number.isFinite(fuel) || dist < 0 || fuel <= 0) {
    return 0;
  }

  const mileage = dist / fuel;
  return Number(mileage.toFixed(decimalPlaces));
};

module.exports = calculateMileage;