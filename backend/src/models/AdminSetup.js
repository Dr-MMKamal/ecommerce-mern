const mongoose = require('mongoose');

const adminSetupSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lockToken: String,
    lockExpiresAt: Date,
  },
  { versionKey: false }
);

module.exports = mongoose.model('AdminSetup', adminSetupSchema);
