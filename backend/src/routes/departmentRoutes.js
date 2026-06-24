const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validateRequest = require('../validators/validate');
const { departmentSchema } = require('../validators/departmentValidator');

router.get('/', protect, DepartmentController.getAll);
router.get('/:id', protect, DepartmentController.getById);

router.post('/', protect, restrictTo('Admin'), validateRequest(departmentSchema), DepartmentController.create);
router.put('/:id', protect, restrictTo('Admin'), validateRequest(departmentSchema), DepartmentController.update);
router.delete('/:id', protect, restrictTo('Admin'), DepartmentController.delete);

module.exports = router;
