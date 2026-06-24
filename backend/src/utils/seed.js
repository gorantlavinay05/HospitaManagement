const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    console.log('Connected. Clearing existing collections...');

    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Collections cleared. Seeding Departments...');
    
    const depts = await Department.create([
      { name: 'Cardiology', description: 'Deals with disorders of the heart and blood vessels.' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents.' },
      { name: 'Neurology', description: 'Deals with disorders of the nervous system.' },
      { name: 'Orthopedics', description: 'Focuses on muscles, joints, ligaments, and bones.' }
    ]);
    console.log('Departments seeded.');

    console.log('Seeding Administrator...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@hospital.com',
      password: 'password123',
      phone: '1234567890',
      role: 'Admin',
      status: 'active'
    });
    console.log('Admin user seeded: admin@hospital.com / password123');

    console.log('Seeding Doctors...');
    // Doctor 1: Cardiologist
    const docUser1 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'doctor1@hospital.com',
      password: 'password123',
      phone: '9876543210',
      role: 'Doctor',
      status: 'active',
      profileImage: ''
    });

    await Doctor.create({
      userId: docUser1._id,
      specialization: 'Cardiologist',
      qualification: 'MD, DM (Cardiology)',
      experience: 12,
      consultationFee: 150,
      departmentId: depts[0]._id,
      availability: {
        workingDays: ['Monday', 'Wednesday', 'Friday'],
        timeSlots: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM']
      }
    });

    // Doctor 2: Pediatrician
    const docUser2 = await User.create({
      name: 'Dr. James Carter',
      email: 'doctor2@hospital.com',
      password: 'password123',
      phone: '8765432109',
      role: 'Doctor',
      status: 'active',
      profileImage: ''
    });

    await Doctor.create({
      userId: docUser2._id,
      specialization: 'Pediatric Specialist',
      qualification: 'MD (Pediatrics), Fellow in Pediatric Care',
      experience: 8,
      consultationFee: 100,
      departmentId: depts[1]._id,
      availability: {
        workingDays: ['Tuesday', 'Thursday'],
        timeSlots: ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM']
      }
    });
    console.log('Doctors seeded: doctor1@hospital.com and doctor2@hospital.com / password123');

    console.log('Seeding Patients...');
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient1@hospital.com',
      password: 'password123',
      phone: '7654321098',
      role: 'Patient',
      status: 'active',
      profileImage: ''
    });

    await Patient.create({
      userId: patientUser._id,
      gender: 'Male',
      dob: new Date('1992-05-15'),
      bloodGroup: 'O+',
      address: '456 Oak Avenue, Metro City, NY',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '6543210987',
        relation: 'Spouse'
      }
    });
    console.log('Patient seeded: patient1@hospital.com / password123');

    console.log('Creating initial audit log...');
    await ActivityLog.create({
      userId: adminUser._id,
      action: 'Seeded initial database records'
    });

    console.log('Seeding successfully completed! 🎉');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database: ', error);
    process.exit(1);
  }
};

seedDatabase();
