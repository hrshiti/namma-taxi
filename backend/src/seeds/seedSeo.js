import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SEO from '../modules/seo/model/seo.model.js';

dotenv.config();

const seoData = [
  {
    page: 'home',
    title: 'Namma Taxi - Reliable & Affordable Cabs in Bengaluru',
    description: 'Book the best taxi service in Bengaluru. Affordable outstation, airport, and local rides with professional drivers.',
    keywords: 'taxi, cab, bengaluru, airport cab, outstation cab, namma taxi',
    ogTitle: 'Namma Taxi - Your Local Cab Partner',
    ogDescription: 'Experience reliable and safe taxi rides in and around Bengaluru.',
  },
  {
    page: 'tours',
    title: 'Karnataka Tour Packages - Namma Taxi Outstation',
    description: 'Explore Karnataka with our affordable tour packages. Visit Mysore, Coorg, Hampi, and more with Namma Taxi.',
    keywords: 'tour packages, karnataka tourism, mysore cab, coorg trip, namma taxi packages',
    ogTitle: 'Explore Karnataka with Namma Taxi',
    ogDescription: 'Fixed price tour packages for all major destinations in Karnataka.',
  },
  {
    page: 'airport',
    title: 'Bangalore Airport Cabs - On-time Pickup & Drop',
    description: 'Safe and reliable airport taxi service to and from Kempegowda International Airport (BLR). No hidden charges.',
    keywords: 'airport taxi, blr airport cab, bangalore airport pickup, cheapest airport taxi',
    ogTitle: 'Airport Cabs at Best Rates',
    ogDescription: 'On-time airport transfers starting from ₹799.',
  }
];

const seedSEO = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for SEO seeding...');

    await SEO.deleteMany({});
    await SEO.insertMany(seoData);

    console.log('SEO metadata seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedSEO();
