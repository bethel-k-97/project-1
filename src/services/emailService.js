const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const templates = {
  welcome: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Betty Car Rental!</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Welcome to Betty Car Rental! We're thrilled to have you on board.</p>
          <p>With us, you can:</p>
          <ul>
            <li>Browse our wide selection of vehicles</li>
            <li>Book cars easily online</li>
            <li>Enjoy secure payment processing</li>
            <li>Get 24/7 customer support</li>
          </ul>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/index.html" class="button">Start Exploring</a>
          <p>If you have any questions, feel free to reach out to us.</p>
          <p>Best regards,<br>Betty Car Rental Team</p>
        </div>
        <div class="footer">
          <p>Bishoftu, Ethiopia | contact@bettycar.com | +251 911 XXX XXX</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingConfirmation: (name, bookingDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details p { margin: 10px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your booking has been confirmed successfully. Here are your booking details:</p>
          <div class="details">
            <p><strong>Car:</strong> ${bookingDetails.carName}</p>
            <p><strong>Pickup Date:</strong> ${bookingDetails.pickupDate}</p>
            <p><strong>Return Date:</strong> ${bookingDetails.returnDate}</p>
            <p><strong>Pickup Location:</strong> ${bookingDetails.pickupLocation}</p>
            <p><strong>Total Days:</strong> ${bookingDetails.totalDays}</p>
            <p><strong>Total Price:</strong> ${bookingDetails.totalPrice} ETB</p>
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          </div>
          <p>Please complete your payment to secure your booking.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/payment.html?bookingId=${bookingDetails.bookingId}" class="button">Pay Now</a>
          <p>Thank you for choosing Betty Car Rental!</p>
          <p>Best regards,<br>Betty Car Rental Team</p>
        </div>
        <div class="footer">
          <p>Bishoftu, Ethiopia | contact@bettycar.com | +251 911 XXX XXX</p>
        </div>
      </div>
    </body>
    </html>
  `,

  paymentConfirmation: (name, paymentDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details p { margin: 10px 0; }
        .success { color: #28a745; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p class="success">Your payment has been processed successfully.</p>
          <div class="details">
            <p><strong>Amount:</strong> ${paymentDetails.amount} ETB</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
            <p><strong>Transaction Reference:</strong> ${paymentDetails.paymentReference}</p>
            <p><strong>Transaction Date:</strong> ${paymentDetails.transactionDate}</p>
            <p><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
          </div>
          <p>Your booking is now confirmed and secured. We look forward to serving you!</p>
          <p>Thank you for your payment.</p>
          <p>Best regards,<br>Betty Car Rental Team</p>
        </div>
        <div class="footer">
          <p>Bishoftu, Ethiopia | contact@bettycar.com | +251 911 XXX XXX</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingCancellation: (name, bookingDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled - Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .cancelled { color: #dc3545; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p class="cancelled">Your booking has been cancelled successfully.</p>
          <div class="details">
            <p><strong>Car:</strong> ${bookingDetails.carName}</p>
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>If you didn't request this cancellation, please contact us immediately.</p>
          <p>We hope to serve you again in the future.</p>
          <p>Best regards,<br>Betty Car Rental Team</p>
        </div>
        <div class="footer">
          <p>Bishoftu, Ethiopia | contact@bettycar.com | +251 911 XXX XXX</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name, resetUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { color: #ffc107; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p class="warning">This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Betty Car Rental Team</p>
        </div>
        <div class="footer">
          <p>Bishoftu, Ethiopia | contact@bettycar.com | +251 911 XXX XXX</p>
        </div>
      </div>
    </body>
    </html>
  `,

  contactSubmission: (name, message) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Submission - Betty Car Rental</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Submission</h1>
        </div>
        <div class="content">
          <p>You have received a new contact submission:</p>
          <div class="details">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p>Please respond to the customer as soon as possible.</p>
        </div>
        <div class="footer">
          <p>Betty Car Rental System</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Betty Car Rental <noreply@bettycar.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Email service methods
const EmailService = {
  async sendWelcomeEmail(name, email) {
    return sendEmail(
      email,
      'Welcome to Betty Car Rental!',
      templates.welcome(name)
    );
  },

  async sendBookingConfirmation(name, email, bookingDetails) {
    return sendEmail(
      email,
      'Booking Confirmation - Betty Car Rental',
      templates.bookingConfirmation(name, bookingDetails)
    );
  },

  async sendPaymentConfirmation(name, email, paymentDetails) {
    return sendEmail(
      email,
      'Payment Confirmation - Betty Car Rental',
      templates.paymentConfirmation(name, paymentDetails)
    );
  },

  async sendBookingCancellation(name, email, bookingDetails) {
    return sendEmail(
      email,
      'Booking Cancelled - Betty Car Rental',
      templates.bookingCancellation(name, bookingDetails)
    );
  },

  async sendPasswordReset(name, email, resetUrl) {
    return sendEmail(
      email,
      'Password Reset Request - Betty Car Rental',
      templates.passwordReset(name, resetUrl)
    );
  },

  async sendContactNotification(name, message) {
    return sendEmail(
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      'New Contact Submission - Betty Car Rental',
      templates.contactSubmission(name, message)
    );
  },
};

module.exports = EmailService;
