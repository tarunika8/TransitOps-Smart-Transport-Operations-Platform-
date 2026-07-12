import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    maintenanceType: {
      type: String,
      required: [true, "Maintenance type is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically change vehicle status to "In Shop"
// whenever an active maintenance record is created.
maintenanceSchema.post("save", async function (doc) {
  const Vehicle = mongoose.model("Vehicle");

  const vehicle = await Vehicle.findById(doc.vehicle);

  if (!vehicle) return;

  if (doc.status === "Open" && vehicle.status !== "In Shop") {
    vehicle.status = "In Shop";
    await vehicle.save();
  }
});

// Instance method to close maintenance and
// restore vehicle status to Available
// unless the vehicle is Retired.
maintenanceSchema.methods.close = async function () {
  const Vehicle = mongoose.model("Vehicle");

  this.status = "Closed";
  await this.save();

  const vehicle = await Vehicle.findById(this.vehicle);

  if (vehicle && vehicle.status !== "Retired") {
    vehicle.status = "Available";
    await vehicle.save();
  }

  return this;
};

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;