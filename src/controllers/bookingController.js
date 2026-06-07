const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { validationResult } = require('express-validator');

const calculateDays = (pickup, returnDate) => {
  const start = new Date(pickup);
  const end = new Date(returnDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { carId, pickupDate, returnDate, pickupLocation, notes } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }
    if (!car.available) {
      return res.status(400).json({ success: false, message: 'This car is not available.' });
    }

    const totalDays = calculateDays(pickupDate, returnDate);
    if (totalDays < 1) {
      return res.status(400).json({ success: false, message: 'Return date must be after pickup date.' });
    }

    const overlapping = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      pickupDate: { $lte: new Date(returnDate) },
      returnDate: { $gte: new Date(pickupDate) },
    });

    if (overlapping) {
      return res.status(400).json({ success: false, message: 'Car is already booked for these dates.' });
    }

    const totalPrice = totalDays * car.pricePerDay;
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      pickupDate,
      returnDate,
      pickupLocation,
      totalDays,
      pricePerDay: car.pricePerDay,
      totalPrice,
      notes: notes || '',
      status: 'confirmed',
    });

    await booking.populate('car', 'name brand type image pricePerDay');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car', 'name brand type image pricePerDay')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const booking = await Booking.findById(req.params.id).populate('car', 'name brand type image pricePerDay');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled.', booking });
  } catch (error) {
    next(error);
  }
};
