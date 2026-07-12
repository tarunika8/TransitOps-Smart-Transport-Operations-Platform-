import Maintenance from '../models/Maintenance.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';

/**
 * Build notification payloads for maintenance records that are due soon
 * (status "Open" with a scheduled date within `withinDays`).
 * This only PREPARES the payloads — actual delivery (email/SMS/push) is
 * intentionally left to a separate integration layer.
 */
export const notifyUpcomingMaintenance = async (withinDays = 7) => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);

  const records = await Maintenance.find({
    status: 'Open',
    date: { $gte: now, $lte: threshold },
  }).populate('vehicle', 'registrationNumber name');

  return records.map((record) => ({
    type: 'MAINTENANCE_DUE',
    priority: 'medium',
    vehicleId: record.vehicle?._id,
    vehicleRegistration: record.vehicle?.registrationNumber,
    maintenanceType: record.maintenanceType,
    scheduledDate: record.date,
    message: `Maintenance ("${record.maintenanceType}") for vehicle ${
      record.vehicle?.registrationNumber || 'N/A'
    } is scheduled for ${record.date.toDateString()}.`,
  }));
};

/**
 * Build notification payloads for drivers whose license expires within
 * `withinDays` (default 30). Excludes already-suspended drivers, since
 * they aren't currently eligible to drive regardless.
 */
export const notifyExpiringLicenses = async (withinDays = 30) => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);

  const drivers = await Driver.find({
    licenseExpiryDate: { $gte: now, $lte: threshold },
    status: { $ne: 'Suspended' },
  });

  return drivers.map((driver) => {
    const daysRemaining = Math.ceil((driver.licenseExpiryDate - now) / (1000 * 60 * 60 * 24));
    return {
      type: 'LICENSE_EXPIRING',
      priority: daysRemaining <= 7 ? 'high' : 'medium',
      driverId: driver._id,
      driverName: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      daysRemaining,
      message: `${driver.name}'s license (${driver.licenseNumber}) expires in ${daysRemaining} day(s), on ${driver.licenseExpiryDate.toDateString()}.`,
    };
  });
};

/**
 * Build notification payloads for trips that have been "Dispatched" for
 * longer than `maxHours` (default 24) without being completed — a signal
 * that something may be delayed or unreported.
 */
export const notifyOverdueTrips = async (maxHours = 24) => {
  const cutoff = new Date(Date.now() - maxHours * 60 * 60 * 1000);

  // Relies on a `dispatchedAt` timestamp being set when a trip is dispatched
  // (see tripService.startTrip). Falls back to `updatedAt` if not present.
  const trips = await Trip.find({
    status: 'Dispatched',
    $or: [{ dispatchedAt: { $lte: cutoff } }, { dispatchedAt: { $exists: false }, updatedAt: { $lte: cutoff } }],
  })
    .populate('vehicle', 'registrationNumber name')
    .populate('driver', 'name contactNumber');

  return trips.map((trip) => {
    const startedAt = trip.dispatchedAt || trip.updatedAt;
    const hoursActive = Number(((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60)).toFixed(1));

    return {
      type: 'TRIP_OVERDUE',
      priority: 'high',
      tripId: trip._id,
      vehicleRegistration: trip.vehicle?.registrationNumber,
      driverName: trip.driver?.name,
      driverContact: trip.driver?.contactNumber,
      source: trip.source,
      destination: trip.destination,
      hoursActive,
      message: `Trip from ${trip.source} to ${trip.destination} (vehicle ${
        trip.vehicle?.registrationNumber || 'N/A'
      }, driver ${trip.driver?.name || 'N/A'}) has been active for ${hoursActive} hours and may be overdue.`,
    };
  });
};

/**
 * Convenience aggregator: builds all three notification categories in one
 * call, useful for a scheduled job (e.g. a daily cron) that fans them out
 * to whichever delivery channel is wired up later.
 */
export const prepareAllNotifications = async (options = {}) => {
  const [maintenance, licenses, overdueTrips] = await Promise.all([
    notifyUpcomingMaintenance(options.maintenanceWithinDays),
    notifyExpiringLicenses(options.licenseWithinDays),
    notifyOverdueTrips(options.tripOverdueHours),
  ]);

  return {
    generatedAt: new Date(),
    counts: {
      maintenance: maintenance.length,
      licenses: licenses.length,
      overdueTrips: overdueTrips.length,
    },
    notifications: [...maintenance, ...licenses, ...overdueTrips],
  };
};

export default {
  notifyUpcomingMaintenance,
  notifyExpiringLicenses,
  notifyOverdueTrips,
  prepareAllNotifications,
};