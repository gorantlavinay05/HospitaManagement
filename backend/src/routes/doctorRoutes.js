const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/DoctorController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validateRequest = require('../validators/validate');
const { createDoctorSchema, updateDoctorSchema } = require('../validators/doctorValidator');

// Public/authenticated listings
router.get('/', protect, DoctorController.getAllDoctors);
router.get('/profile', protect, restrictTo('Doctor'), DoctorController.getProfile);
router.put('/profile', protect, restrictTo('Doctor'), validateRequest(updateDoctorSchema), DoctorController.updateProfile);
router.get('/:id', protect, DoctorController.getDoctorById);

// Admin-only doctor configurations
router.post('/', protect, restrictTo('Admin'), validateRequest(createDoctorSchema), DoctorController.createDoctor);
router.put('/:id', protect, restrictTo('Admin'), validateRequest(updateDoctorSchema), DoctorController.updateProfile);
router.delete('/:id', protect, restrictTo('Admin'), DoctorController.deleteDoctor);
router.patch('/:id/status', protect, restrictTo('Admin'), DoctorController.toggleStatus);

module.exports = router;
