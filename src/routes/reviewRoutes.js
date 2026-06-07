const express = require('express');
const { body, param } = require('express-validator');
const { getCarReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/car/:carId',
  [param('carId').isMongoId().withMessage('Invalid car ID')],
  getCarReviews
);

router.post(
  '/',
  protect,
  [
    body('carId').isMongoId().withMessage('Invalid car ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  ],
  createReview
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid review ID')],
  deleteReview
);

module.exports = router;
