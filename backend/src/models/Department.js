const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', DepartmentSchema);
