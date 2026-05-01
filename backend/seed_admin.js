import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Staff from './src/modules/staff/model/staff.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma-taxi';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const adminData = {
      name: 'Namma Taxi Admin',
      email: 'admin@nammaxi.com',
      passwordHash: 'admin123', // This will be hashed by the pre-save hook
      phone: '9876543210',
      role: 'admin',
      isActive: true
    };

    const existingAdmin = await Staff.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating credentials...');
      existingAdmin.passwordHash = adminData.passwordHash;
      if (!existingAdmin.phone) existingAdmin.phone = adminData.phone;
      if (!existingAdmin.name) existingAdmin.name = adminData.name;
      await existingAdmin.save();
      console.log('Admin credentials updated successfully.');
    } else {
      console.log('Creating new Admin user...');
      await Staff.create(adminData);
      console.log('Admin user created successfully.');
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: admin123`);
    console.log('-------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seedAdmin();
