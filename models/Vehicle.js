const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      // Vehicle Name / Model
      type: String,
      required: [true, 'Vehicle name/model is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
    },
    maxLoadCapacity: {
      // in kg
      type: Number,
      required: [true, 'Maximum load capacity is required'],
      min: [0, 'Max load capacity cannot be negative'],
    },
    odometer: {
      type: Number,
      default: 0,
      min: [0, 'Odometer cannot be negative'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition cost is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// Helper: vehicles eligible for dispatch selection
vehicleSchema.statics.getDispatchable = function () {
  return this.find({ status: 'Available' });
};

module.exports = mongoose.model('Vehicle', vehicleSchema);