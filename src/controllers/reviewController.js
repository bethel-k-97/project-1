const mongoose = require('mongoose');
const Review = require('../models/Review');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

const updateCarRating = async (carId) => {
  const stats = await Review.aggregate([
    { $match: { car: new mongoose.Types.ObjectId(carId) } },
    { $group: { _id: '$car', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    await Car.findByIdAndUpdate(carId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Car.findByIdAndUpdate(carId, { rating: 0, reviewCount: 0 });
  }
};

exports.getCarReviews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { carId, rating, comment } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    const completedBooking = await Booking.findOne({
      user: req.user._id,
      car: carId,
      status: 'completed',
    });

    if (!completedBooking && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You can only review cars after completing a rental.',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      car: carId,
      rating: Number(rating),
      comment,
    });

    await updateCarRating(carId);
    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Review submitted.', review });
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

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const carId = review.car;
    await review.deleteOne();
    await updateCarRating(carId);

    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
