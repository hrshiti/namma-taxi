
import mongoose from 'mongoose';
import Pricing from './backend/src/modules/pricing/model/pricing.model.js';
import VehicleCategory from './backend/src/modules/vehicle-categories/model/vehicleCategory.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('--- VEHICLE CATEGORIES ---');
    const categories = await VehicleCategory.find();
    console.log(JSON.stringify(categories, null, 2));

    console.log('\n--- PRICING RULES ---');
    const pricing = await Pricing.find().populate('vehicleCategoryId');
    console.log(JSON.stringify(pricing, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
