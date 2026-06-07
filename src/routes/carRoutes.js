const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getCars,
  getFeaturedCars,
  getCarById,
  getCarTypes,
  getPublicStats,
} = require('../controllers/carController');

const router = express.Router();

router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/types', getCarTypes);
router.get('/stats', getPublicStats);
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid car ID')],
  getCarById
);

module.exports = router;
