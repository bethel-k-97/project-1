const Car = require('../models/Car');
const { validationResult } = require('express-validator');

exports.getCars = async (req, res, next) => {
  try {
    const {
      search,
      type,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      available,
      featured,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (type) {
      filter.type = { $in: type.split(',') };
    }
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (available !== undefined) filter.available = available === 'true';
    if (featured === 'true') filter.featured = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { pricePerDay: 1 };
    if (sort === 'price-desc') sortOption = { pricePerDay: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Car.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: cars.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      cars,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedCars = async (_req, res, next) => {
  try {
    const cars = await Car.find({ featured: true, available: true }).limit(4);
    res.json({ success: true, cars });
  } catch (error) {
    next(error);
  }
};

exports.getCarById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }
    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.getCarTypes = async (_req, res, next) => {
  try {
    const types = await Car.distinct('type');
    res.json({ success: true, types });
  } catch (error) {
    next(error);
  }
};

exports.getPublicStats = async (_req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const User = require('../models/User');

    const [totalCars, totalBookings, totalUsers, revenue] = await Promise.all([
      Car.countDocuments({ available: true }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'active', 'completed'] } }),
      User.countDocuments({ role: 'user' }),
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
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
