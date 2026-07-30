const express = require('express');
const { body, param } = require('express-validator');
const {
  initiatePayment,
  getPaymentByBooking,
  getUserPayments,
  getBookingForPayment,
  refundPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Get booking details for payment page
router.get(
  '/booking/:bookingId',
  [param('bookingId').isMongoId().withMessage('Invalid booking ID')],
  getBookingForPayment
);

// Initiate payment for a booking
router.post(
  '/initiate',
  [
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('paymentMethod').isIn(['stripe', 'chapa', 'cash', 'bank_transfer']).withMessage('Invalid payment method'),
  ],
  initiatePayment
);

// Get payment details by booking ID
router.get(
  '/booking/:bookingId/details',
  [param('bookingId').isMongoId().withMessage('Invalid booking ID')],
  getPaymentByBooking
);

// Get all user payments
router.get('/my-payments', getUserPayments);

// Refund payment (admin only)
router.put(
  '/refund/:paymentId',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  admin,
  refundPayment
);

module.exports = router;
