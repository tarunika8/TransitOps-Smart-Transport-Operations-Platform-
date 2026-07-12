const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },
    licenseCategory: {
      type: String,
      required: [true, 'License category is required'],
      trim: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// Virtual: is the license currently expired?
driverSchema.virtual('isLicenseExpired').get(function () {
  return this.licenseExpiryDate < new Date();
});

// Helper: drivers eligible for trip assignment
driverSchema.statics.getAssignable = function () {
  return this.find({
    status: 'Available',
    licenseExpiryDate: { $gte: new Date() },
  });
};

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);