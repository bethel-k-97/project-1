const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

exports.submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, message } = req.body;

    await Contact.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will get back to you within 24 hours.',
    });
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
