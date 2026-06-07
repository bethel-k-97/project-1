const express = require('express');
const { body } = require('express-validator');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  submitContact
);

module.exports = router;
