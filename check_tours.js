
import mongoose from 'mongoose';
import ToursPackage from './backend/src/modules/taxi/model/toursPackage.model.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await ToursPackage.countDocuments();
    console.log(`ToursPackage count: ${count}`);
    const packages = await ToursPackage.find();
    console.log(JSON.stringify(packages, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
