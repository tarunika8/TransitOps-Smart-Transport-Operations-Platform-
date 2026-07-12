const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    cargoWeight: {
      type: Number,
      required: [true, 'Cargo weight is required'],
      min: [0, 'Cargo weight cannot be negative'],
    },
    plannedDistance: {
      type: Number,
      required: [true, 'Planned distance is required'],
      min: 0,
    },
    actualDistance: {
      type: Number,
      default: 0,
    },
    fuelConsumed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

/**
 * Validate business rules before saving a new trip:
 * - Cargo weight must not exceed vehicle's max load capacity
 * - Vehicle must be Available (not Retired/In Shop/On Trip)
 * - Driver must be Available, not Suspended, and license not expired
 */
tripSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();

  const Vehicle = mongoose.model('Vehicle');
  const Driver = mongoose.model('Driver');

  const vehicle = await Vehicle.findById(this.vehicle);
  const driver = await Driver.findById(this.driver);

  if (!vehicle) return next(new Error('Vehicle not found'));
  if (!driver) return next(new Error('Driver not found'));

  if (vehicle.status !== 'Available') {
    return next(new Error(`Vehicle is not available (status: ${vehicle.status})`));
  }

  if (driver.status !== 'Available') {
    return next(new Error(`Driver is not available (status: ${driver.status})`));
  }

  if (driver.licenseExpiryDate < new Date()) {
    return next(new Error('Driver license has expired'));
  }

  if (this.cargoWeight > vehicle.maxLoadCapacity) {
    return next(
      new Error(
        `Cargo weight (${this.cargoWeight}kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity}kg)`
      )
    );
  }

  next();
});

// Dispatch: mark vehicle & driver On Trip
tripSchema.methods.dispatch = async function () {
  const Vehicle = mongoose.model('Vehicle');
  const Driver = mongoose.model('Driver');

  this.status = 'Dispatched';
  await this.save();

  await Vehicle.findByIdAndUpdate(this.vehicle, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(this.driver, { status: 'On Trip' });

  return this;
};

// Complete: mark vehicle & driver Available again, record odometer/fuel
tripSchema.methods.complete = async function ({ finalOdometer, fuelConsumed } = {}) {
  const Vehicle = mongoose.model('Vehicle');
  const Driver = mongoose.model('Driver');

  this.status = 'Completed';
  if (fuelConsumed !== undefined) this.fuelConsumed = fuelConsumed;
  await this.save();

  const vehicleUpdate = { status: 'Available' };
  if (finalOdometer !== undefined) vehicleUpdate.odometer = finalOdometer;

  await Vehicle.findByIdAndUpdate(this.vehicle, vehicleUpdate);
  await Driver.findByIdAndUpdate(this.driver, { status: 'Available' });

  return this;
};

// Cancel: if it was dispatched, restore vehicle & driver to Available
tripSchema.methods.cancel = async function () {
  const Vehicle = mongoose.model('Vehicle');
  const Driver = mongoose.model('Driver');

  const wasDispatched = this.status === 'Dispatched';
  this.status = 'Cancelled';
  await this.save();

  if (wasDispatched) {
    await Vehicle.findByIdAndUpdate(this.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(this.driver, { status: 'Available' });
  }

  return this;
};

module.exports = mongoose.model('Trip', tripSchema);