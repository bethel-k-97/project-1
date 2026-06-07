const express = require('express');
const { body, param } = require('express-validator');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);

router.post(
  '/',
  [body('carId').isMongoId().withMessage('Invalid car ID')],
  addFavorite
);

router.get(
  '/check/:carId',
  [param('carId').isMongoId().withMessage('Invalid car ID')],
  checkFavorite
);

router.delete(
  '/:carId',
  [param('carId').isMongoId().withMessage('Invalid car ID')],
  removeFavorite
);

module.exports = router;
