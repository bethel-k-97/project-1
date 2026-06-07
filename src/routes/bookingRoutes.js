const express = require('express');
const { body, param } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('carId').isMongoId().withMessage('Invalid car ID'),
    body('pickupDate').isISO8601().toDate().withMessage('Invalid pickup date'),
    body('returnDate').isISO8601().toDate().withMessage('Invalid return date'),
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('notes').optional().trim(),
  ],
  createBooking
);

router.get('/my', getMyBookings);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid booking ID')],
  getBookingById
);

router.put(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('Invalid booking ID')],
  cancelBooking
);

module.exports = router;
