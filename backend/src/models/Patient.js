const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required']
      },
      relation: {
        type: String,
        required: [true, 'Relation to emergency contact is required']
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
