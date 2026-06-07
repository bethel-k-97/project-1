const Favorite = require('../models/Favorite');
const { validationResult } = require('express-validator');

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('car')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      favorites: favorites.map((f) => f.car),
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { carId } = req.body;

    const favorite = await Favorite.create({ user: req.user._id, car: carId });
    await favorite.populate('car');

    res.status(201).json({
      success: true,
      message: 'Added to favorites.',
      car: favorite.car,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already in favorites.' });
    }
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      car: req.params.carId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' });
    }

    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    next(error);
  }
};

exports.checkFavorite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const favorite = await Favorite.findOne({
      user: req.user._id,
      car: req.params.carId,
    });

    res.json({ success: true, isFavorite: !!favorite });
  } catch (error) {
    next(error);
  }
};
