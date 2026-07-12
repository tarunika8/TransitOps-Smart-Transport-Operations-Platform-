const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    liters: {
      type: Number,
      required: [true, 'Fuel amount (liters) is required'],
      min: [0, 'Liters cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    distanceCovered: {
      // distance covered since last fuel log, used for fuel efficiency
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Virtual: fuel efficiency for this log (distance / fuel)
fuelLogSchema.virtual('fuelEfficiency').get(function () {
  if (!this.liters) return 0;
  return this.distanceCovered / this.liters;
});

fuelLogSchema.set('toJSON', { virtuals: true });
fuelLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FuelLog', fuelLogSchema);