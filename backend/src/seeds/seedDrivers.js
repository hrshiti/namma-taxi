import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from '../modules/drivers/model/driver.model.js';
import VehicleCategory from '../modules/vehicle-categories/model/vehicleCategory.model.js';

dotenv.config();

const seedDrivers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for Driver seeding...');

    const sedan = await VehicleCategory.findOne({ name: 'Sedan' }) || await VehicleCategory.findOne();

    const drivers = [
      {
        name: 'Test Pilot',
        phone: '9000000001',
        email: 'driver1@nammataxi.com',
        licenseNumber: 'DL-KA01-20240001',
        vehicleNumber: 'KA-01-ET-1234',
        vehicleCategoryId: sedan._id,
        status: 'available',
        isActive: true,
        isVerified: true
      }
    ];

    await Driver.deleteMany({ phone: '9000000001' });
    await Driver.insertMany(drivers);

    console.log('Test Driver seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDrivers();
