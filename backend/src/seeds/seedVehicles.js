import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../modules/vehicles/model/vehicle.model.js';
import VehicleCategory from '../modules/vehicle-categories/model/vehicleCategory.model.js';

dotenv.config();

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for Vehicle seeding...');

    // Get a category to link to
    const category = await VehicleCategory.findOne({ name: 'Sedan' }) || await VehicleCategory.findOne();
    
    if (!category) {
      console.error('No vehicle category found. Please seed categories first.');
      process.exit(1);
    }

    const vehicleData = [
      {
        plateNumber: 'KA01AB1234',
        modelName: 'Maruti Suzuki Dzire',
        brand: 'Maruti',
        color: 'White',
        year: 2022,
        vehicleCategoryId: category._id,
        status: 'active',
      },
      {
        plateNumber: 'KA05MN5678',
        modelName: 'Toyota Etios',
        brand: 'Toyota',
        color: 'Silver',
        year: 2021,
        vehicleCategoryId: category._id,
        status: 'active',
      }
    ];

    await Vehicle.deleteMany({});
    await Vehicle.insertMany(vehicleData);

    console.log('Vehicles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedVehicles();
