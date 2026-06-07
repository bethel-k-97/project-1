const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

exports.getDashboardStats = async (_req, res, next) => {
  try {
    const [totalCars, totalBookings, totalUsers, pendingBookings, revenue] = await Promise.all([
      Car.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalCars,
        totalBookings,
        totalUsers,
        pendingBookings,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const car = await Car.create(req.body);
    res.status(201).json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }
    res.json({ success: true, message: 'Car deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('car', 'name brand type image')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('car', 'name brand type');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (_req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('car', 'name brand type')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getContacts = async (_req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};
