const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    maintenanceType: {
      type: String,
      required: [true, 'Maintenance type is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// When a new maintenance record is created with status Open,
// automatically switch the vehicle's status to "In Shop"
maintenanceSchema.post('save', async function (doc) {
  const Vehicle = mongoose.model('Vehicle');
  const vehicle = await Vehicle.findById(doc.vehicle);
  if (!vehicle) return;

  if (doc.status === 'Open' && vehicle.status !== 'In Shop') {
    vehicle.status = 'In Shop';
    await vehicle.save();
  }
});

// Instance method to close maintenance and restore vehicle to Available
// (unless the vehicle has been Retired)
maintenanceSchema.methods.close = async function () {
  const Vehicle = mongoose.model('Vehicle');

  this.status = 'Closed';
  await this.save();

  const vehicle = await Vehicle.findById(this.vehicle);
  if (vehicle && vehicle.status !== 'Retired') {
    vehicle.status = 'Available';
    await vehicle.save();
  }

  return this;
};

module.exports = mongoose.model('Maintenance', maintenanceSchema);