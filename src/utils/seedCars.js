require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const User = require('../models/User');

const cars = [
  {
    name: 'Toyota Corolla',
    brand: 'Toyota',
    type: 'Sedan',
    description: 'Comfortable and fuel-efficient, perfect for city rides and business travel.',
    pricePerDay: 2000,
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Backup Camera'],
    available: true,
    featured: true,
  },
  {
    name: 'Toyota RAV4',
    brand: 'Toyota',
    type: 'SUV',
    description: 'Spacious and powerful, ideal for family trips and adventures across Ethiopia.',
    pricePerDay: 3500,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: ['4WD', 'Roof Rails', 'Cruise Control', 'Apple CarPlay'],
    available: true,
    featured: true,
  },
  {
    name: 'Mercedes-Benz E-Class',
    brand: 'Mercedes-Benz',
    type: 'Luxury',
    description: 'Experience comfort and style with our premium luxury sedan.',
    pricePerDay: 7000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: ['Leather Seats', 'Panoramic Sunroof', 'Premium Sound', 'Heated Seats'],
    available: false,
    featured: true,
  },
  {
    name: 'Toyota HiAce',
    brand: 'Toyota',
    type: 'Van',
    description: 'Perfect for group travel and transporting goods across the region.',
    pricePerDay: 4000,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    seats: 12,
    transmission: 'Manual',
    fuelType: 'Diesel',
    features: ['High Capacity', 'Air Conditioning', 'Sliding Doors'],
    available: true,
    featured: true,
  },
  {
    name: 'Toyota Hilux',
    brand: 'Toyota',
    type: 'Pickup',
    description: 'Strong and reliable, great for carrying loads and off-road trips.',
    pricePerDay: 3000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1eb58e?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Diesel',
    features: ['4x4', 'Bed Liner', 'Tow Hook'],
    available: true,
  },
  {
    name: 'Kia Carnival',
    brand: 'Kia',
    type: 'Minivan',
    description: 'Spacious and comfortable, ideal for large families or groups.',
    pricePerDay: 3800,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80',
    seats: 8,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: ['Power Sliding Doors', 'Rear Entertainment', 'Tri-Zone AC'],
    available: true,
  },
  {
    name: 'BMW 4 Series Convertible',
    brand: 'BMW',
    type: 'Convertible',
    description: 'Enjoy the open air and sunshine with our stylish convertibles.',
    pricePerDay: 6000,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: ['Convertible Top', 'Sport Mode', 'Premium Audio'],
    available: false,
  },
  {
    name: 'Isuzu NPR Truck',
    brand: 'Isuzu',
    type: 'Truck',
    description: 'Heavy-duty trucks for transporting goods and equipment.',
    pricePerDay: 5000,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    seats: 3,
    transmission: 'Manual',
    fuelType: 'Diesel',
    features: ['High Payload', 'Hydraulic Lift', 'GPS Tracker'],
    available: true,
  },
  {
    name: 'Tesla Model 3',
    brand: 'Tesla',
    type: 'Electric',
    description: 'Eco-friendly and efficient, perfect for city and short trips.',
    pricePerDay: 2500,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929fea90?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    features: ['Autopilot', 'Supercharging', 'Zero Emissions'],
    available: true,
  },
  {
    name: 'Hyundai i10',
    brand: 'Hyundai',
    type: 'Compact',
    description: 'Easy to park and drive, ideal for city commutes in Bishoftu.',
    pricePerDay: 1800,
    image: 'https://images.unsplash.com/photo-1542362567-b07e54370753?auto=format&fit=crop&w=800&q=80',
    seats: 4,
    transmission: 'Manual',
    fuelType: 'Petrol',
    features: ['Compact Size', 'Fuel Efficient', 'Easy Parking'],
    available: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Car.deleteMany({});
    await Car.insertMany(cars);
    console.log(`Seeded ${cars.length} cars`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bettycar.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Betty Car Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+251900000000',
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
