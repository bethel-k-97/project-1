const express = require('express');
const { body, param } = require('express-validator');
const {
  getDashboardStats,
  createCar,
  updateCar,
  deleteCar,
  getAllBookings,
  updateBookingStatus,
  getAllReviews,
  deleteReview,
  getContacts,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/bookings', getAllBookings);

router.put(
  '/bookings/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  ],
  updateBookingStatus
);

router.post(
  '/cars',
  [
    body('name').trim().notEmpty().withMessage('Car name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('type').isIn(['Sedan', 'SUV', 'Luxury', 'Van', 'Pickup', 'Minivan', 'Convertible', 'Truck', 'Electric', 'Compact']).withMessage('Invalid car type'),
    body('pricePerDay').isNumeric().withMessage('Price must be a number'),
    body('image').isURL().withMessage('Valid image URL is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  createCar
);

router.put(
  '/cars/:id',
  [
    param('id').isMongoId().withMessage('Invalid car ID'),
    body('name').optional().trim().notEmpty().withMessage('Car name cannot be empty'),
    body('brand').optional().trim().notEmpty().withMessage('Brand cannot be empty'),
    body('type').optional().isIn(['Sedan', 'SUV', 'Luxury', 'Van', 'Pickup', 'Minivan', 'Convertible', 'Truck', 'Electric', 'Compact']).withMessage('Invalid car type'),
    body('pricePerDay').optional().isNumeric().withMessage('Price must be a number'),
    body('image').optional().isURL().withMessage('Valid image URL is required'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  ],
  updateCar
);

router.delete(
  '/cars/:id',
  [param('id').isMongoId().withMessage('Invalid car ID')],
  deleteCar
);

router.get('/reviews', getAllReviews);

router.delete(
  '/reviews/:id',
  [param('id').isMongoId().withMessage('Invalid review ID')],
  deleteReview
);

router.get('/contacts', getContacts);

module.exports = router;
