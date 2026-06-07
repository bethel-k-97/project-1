const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['Sedan', 'SUV', 'Luxury', 'Van', 'Pickup', 'Minivan', 'Convertible', 'Truck', 'Electric', 'Compact'],
    },
    description: { type: String, required: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    seats: { type: Number, default: 5 },
    transmission: { type: String, enum: ['Automatic', 'Manual'], default: 'Automatic' },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },
    features: [{ type: String }],
    available: { type: Boolean, default: true },
    location: { type: String, default: 'Bishoftu, Ethiopia' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

carSchema.index({ type: 1, pricePerDay: 1, available: 1 });
carSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
