const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validateRequest = require('../validators/validate');
const {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  updateStatusSchema,
  consultationNotesSchema
} = require('../validators/appointmentValidator');

router.post('/', protect, restrictTo('Patient'), validateRequest(bookAppointmentSchema), AppointmentController.book);
router.get('/', protect, AppointmentController.getAppointments);
router.get('/:id', protect, AppointmentController.getById);
router.put('/:id/status', protect, validateRequest(updateStatusSchema), AppointmentController.updateStatus);
router.put('/:id/notes', protect, restrictTo('Doctor'), validateRequest(consultationNotesSchema), AppointmentController.addNotes);
router.put('/:id/reschedule', protect, validateRequest(rescheduleAppointmentSchema), AppointmentController.reschedule);

module.exports = router;
