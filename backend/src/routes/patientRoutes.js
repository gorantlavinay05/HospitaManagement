const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/PatientController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validateRequest = require('../validators/validate');
const { updatePatientSchema } = require('../validators/patientValidator');

// Patient self-profile actions
router.get('/profile', protect, restrictTo('Patient'), PatientController.getProfile);
router.put('/profile', protect, restrictTo('Patient'), validateRequest(updatePatientSchema), PatientController.updateProfile);

// Admin / Doctor access to directories
router.get('/', protect, restrictTo('Admin', 'Doctor'), PatientController.getAllPatients);
router.get('/:id', protect, restrictTo('Admin', 'Doctor'), PatientController.getPatientById);

// Admin-only CRUD actions
router.put('/:id', protect, restrictTo('Admin'), validateRequest(updatePatientSchema), PatientController.updateProfile);
router.delete('/:id', protect, restrictTo('Admin'), PatientController.deletePatient);
router.patch('/:id/status', protect, restrictTo('Admin'), PatientController.toggleStatus);

module.exports = router;
