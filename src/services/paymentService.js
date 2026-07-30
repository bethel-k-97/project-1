const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');

// Generate unique payment reference
const generatePaymentReference = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

// Process payment (mock implementation - integrate with Stripe/Chapa in production)
const processPayment = async (bookingId, userId, paymentMethod, amount) => {
  try {
    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized: Booking does not belong to user');
    }
    if (booking.paymentStatus === 'paid') {
      throw new Error('Payment already completed for this booking');
    }

    // Check for duplicate pending payments
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      paymentStatus: 'pending',
    });
    if (existingPayment) {
      throw new Error('Payment already in progress for this booking');
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference();

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: userId,
      amount,
      paymentMethod,
      paymentReference,
      paymentStatus: 'pending',
      transactionDate: new Date(),
    });

    // Simulate payment processing (replace with actual Stripe/Chapa integration)
    const paymentSuccess = await simulatePaymentProcessing(paymentMethod, amount);

    if (paymentSuccess) {
      // Update payment status to successful
      payment.paymentStatus = 'successful';
      payment.gatewayResponse = { status: 'success', message: 'Payment processed successfully' };
      await payment.save();

      // Update booking payment status
      booking.paymentStatus = 'paid';
      booking.paymentReference = paymentReference;
      booking.paymentDate = new Date();
      booking.status = 'confirmed';
      await booking.save();

      return { success: true, payment, booking };
    } else {
      // Update payment status to failed
      payment.paymentStatus = 'failed';
      payment.failureReason = 'Payment processing failed';
      payment.gatewayResponse = { status: 'failed', message: 'Payment processing failed' };
      await payment.save();

      // Update booking payment status
      booking.paymentStatus = 'failed';
      await booking.save();

      return { success: false, payment, error: 'Payment processing failed' };
    }
  } catch (error) {
    throw error;
  }
};

// Simulate payment processing (replace with actual payment gateway)
const simulatePaymentProcessing = async (paymentMethod, amount) => {
  // In production, integrate with Stripe or Chapa here
  // For now, simulate success for demo purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      resolve(Math.random() > 0.1);
    }, 2000);
  });
};

// Get payment by booking ID
const getPaymentByBooking = async (bookingId, userId) => {
  const payment = await Payment.findOne({ booking: bookingId, user: userId })
    .populate('booking')
    .populate('user', 'name email');
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  return payment;
};

// Get all user payments
const getUserPayments = async (userId) => {
  const payments = await Payment.find({ user: userId })
    .populate('booking', 'pickupDate returnDate totalPrice')
    .sort({ createdAt: -1 });
  
  return payments;
};

// Refund payment (admin only)
const refundPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate('booking');
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  if (payment.paymentStatus !== 'successful') {
    throw new Error('Only successful payments can be refunded');
  }
  
  // Update payment status
  payment.paymentStatus = 'refunded';
  await payment.save();
  
  // Update booking payment status
  if (payment.booking) {
    payment.booking.paymentStatus = 'refunded';
    await payment.booking.save();
  }
  
  return payment;
};

const PaymentService = {
  processPayment,
  getPaymentByBooking,
  getUserPayments,
  refundPayment,
  generatePaymentReference,
};

module.exports = PaymentService;
