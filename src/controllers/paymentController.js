const PaymentService = require('../services/paymentService');
const Booking = require('../models/Booking');
const EmailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// Initiate payment for a booking
exports.initiatePayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { bookingId, paymentMethod } = req.body;
    const userId = req.user._id;

    // Get booking details
    const booking = await Booking.findById(bookingId).populate('car');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed for this booking.' });
    }

    // Process payment
    const result = await PaymentService.processPayment(
      bookingId,
      userId,
      paymentMethod,
      booking.totalPrice
    );

    if (result.success) {
      // Send payment confirmation email
      await EmailService.sendPaymentConfirmation(
        req.user.name,
        req.user.email,
        {
          amount: booking.totalPrice,
          paymentMethod,
          paymentReference: result.payment.paymentReference,
          transactionDate: result.payment.transactionDate,
          bookingId: booking._id,
        }
      );

      res.json({
        success: true,
        message: 'Payment processed successfully.',
        payment: result.payment,
        booking: result.booking,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Payment processing failed.',
        payment: result.payment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get payment details by booking ID
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { bookingId } = req.params;
    const userId = req.user._id;

    const payment = await PaymentService.getPaymentByBooking(bookingId, userId);
    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

// Get all user payments
exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payments = await PaymentService.getUserPayments(userId);
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

// Get booking details for payment page
exports.getBookingForPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate('car', 'name brand type image pricePerDay')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { paymentId } = req.params;

    const payment = await PaymentService.refundPayment(paymentId);
    res.json({
      success: true,
      message: 'Payment refunded successfully.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
