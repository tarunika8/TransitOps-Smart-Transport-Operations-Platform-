import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
    },
    licenseCategory: {
      type: String,
      required: [true, "License category is required"],
      trim: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, "License expiry date is required"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
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
      enum: ["Available", "On Trip", "Off Duty", "Suspended"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: Check if the driver's license is expired
driverSchema.virtual("isLicenseExpired").get(function () {
  return this.licenseExpiryDate < new Date();
});

// Static method: Get all drivers eligible for trip assignment
driverSchema.statics.getAssignable = function () {
  return this.find({
    status: "Available",
    licenseExpiryDate: { $gte: new Date() },
  });
};

// Include virtuals in JSON/Object output
driverSchema.set("toJSON", { virtuals: true });
driverSchema.set("toObject", { virtuals: true });

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;