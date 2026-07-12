import mongoose from "mongoose";

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    liters: {
      type: Number,
      required: [true, "Fuel amount (liters) is required"],
      min: [0, "Liters cannot be negative"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    distanceCovered: {
      // Distance covered since last fuel log, used for fuel efficiency
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: Calculate fuel efficiency (distance / liters)
fuelLogSchema.virtual("fuelEfficiency").get(function () {
  if (!this.liters) return 0;
  return this.distanceCovered / this.liters;
});

// Include virtuals when converting to JSON/Object
fuelLogSchema.set("toJSON", { virtuals: true });
fuelLogSchema.set("toObject", { virtuals: true });

const FuelLog = mongoose.model("FuelLog", fuelLogSchema);

export default FuelLog;