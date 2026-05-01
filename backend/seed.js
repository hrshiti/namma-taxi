import mongoose from 'mongoose';
import config from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/database.js';

import Staff from './src/modules/staff/model/staff.model.js';
import VehicleCategory from './src/modules/vehicle-categories/model/vehicleCategory.model.js';
import Pricing from './src/modules/pricing/model/pricing.model.js';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to DB');

    // 1. Admin User
    const adminExists = await Staff.findOne({ email: 'admin@nammaxi.com' });
    if (!adminExists) {
      await Staff.create({
        name: 'Admin User',
        email: 'admin@nammaxi.com',
        passwordHash: 'password123', // auto hashed by pre-save
        role: 'admin',
      });
      console.log('Admin user created: admin@nammaxi.com / password123');
    } else {
      console.log('Admin already exists');
    }

    // 2. Vehicle Categories
    await VehicleCategory.deleteMany({});
    
    const catHatch = await VehicleCategory.create({
      name: 'Compact Hatch',
      brand: 'Swift',
      seats: 4,
      luggage: 1,
      ac: false,
      baseDisplayPrice: 450,
      image: 'service_tours-removebg-preview - Copy.png',
      description: 'Economical and fast commute for city and airport runs.',
      sortOrder: 1,
    });

    const catSedan = await VehicleCategory.create({
      name: 'Sedan Premium',
      brand: 'Toyota',
      seats: 4,
      luggage: 2,
      ac: true,
      baseDisplayPrice: 750,
      image: 'service_airport-removebg-preview - Copy.png',
      description: 'Highest rated sedan with maximum comfort and professional driver.',
      sortOrder: 2,
    });

    const catSuv = await VehicleCategory.create({
      name: 'SUV Luxury',
      brand: 'Innova',
      seats: 7,
      luggage: 4,
      ac: true,
      baseDisplayPrice: 1200,
      image: 'service_outstation_-_Copy-removebg-preview - Copy.png',
      description: 'Spacious SUV perfect for family trips and heavy luggage.',
      sortOrder: 3,
    });

    console.log('Vehicle categories seeded');

    // 3. Pricing
    await Pricing.deleteMany({});

    // Airport Pricing
    const airportModes = ['pickup', 'drop'];
    for (const mode of airportModes) {
      await Pricing.create({
        serviceType: 'airport',
        tripMode: mode,
        vehicleCategoryId: catHatch._id,
        baseFare: 450,
        perKmRate: 15,
        minimumKm: 10,
      });
      await Pricing.create({
        serviceType: 'airport',
        tripMode: mode,
        vehicleCategoryId: catSedan._id,
        baseFare: 750,
        perKmRate: 20,
        minimumKm: 15,
      });
      await Pricing.create({
        serviceType: 'airport',
        tripMode: mode,
        vehicleCategoryId: catSuv._id,
        baseFare: 1200,
        perKmRate: 25,
        minimumKm: 20,
      });
    }

    // Outstation Pricing
    const outstationModes = ['oneway', 'roundtrip'];
    for (const mode of outstationModes) {
      await Pricing.create({
        serviceType: 'outstation',
        tripMode: mode,
        vehicleCategoryId: catHatch._id,
        baseFare: 500,
        perKmRate: 14,
        minimumKm: 130, // example
        driverAllowance: mode === 'roundtrip' ? 300 : 0,
      });
      await Pricing.create({
        serviceType: 'outstation',
        tripMode: mode,
        vehicleCategoryId: catSedan._id,
        baseFare: 800,
        perKmRate: 18,
        minimumKm: 130,
        driverAllowance: mode === 'roundtrip' ? 300 : 0,
      });
      await Pricing.create({
        serviceType: 'outstation',
        tripMode: mode,
        vehicleCategoryId: catSuv._id,
        baseFare: 1300,
        perKmRate: 22,
        minimumKm: 130,
        driverAllowance: mode === 'roundtrip' ? 400 : 0,
      });
    }

    // Tours Pricing (using the stable values)
    const tourPackages = [
      "1day_450km_arunachalam",
      "1day_300km_hogenakkal",
      "1day_300km_lepakshi",
      "3day_mysore_coorg",
      "4hr_40km",
      "8hr_160km_isha",
      "8hr_160km_nandi",
      "8hr_80km",
      "10hr_200km_nandi_isha",
      "10hr_200km_kotilingeshwara",
      "12hr_300km_koti_isha",
      "24hr_mysore"
    ];

    for (const pkg of tourPackages) {
      await Pricing.create({
        serviceType: 'tours',
        tripMode: pkg,
        vehicleCategoryId: catHatch._id,
        packagePrice: 1500, // Example generic pricing
      });
      await Pricing.create({
        serviceType: 'tours',
        tripMode: pkg,
        vehicleCategoryId: catSedan._id,
        packagePrice: 2000,
      });
      await Pricing.create({
        serviceType: 'tours',
        tripMode: pkg,
        vehicleCategoryId: catSuv._id,
        packagePrice: 3000,
      });
    }

    // Local Pricing (City Rides)
    await Pricing.create({
      serviceType: 'local',
      tripMode: 'city_ride',
      vehicleCategoryId: catHatch._id,
      baseFare: 50,
      perKmRate: 12,
      minimumKm: 5,
    });
    await Pricing.create({
      serviceType: 'local',
      tripMode: 'city_ride',
      vehicleCategoryId: catSedan._id,
      baseFare: 80,
      perKmRate: 15,
      minimumKm: 5,
    });
    await Pricing.create({
      serviceType: 'local',
      tripMode: 'city_ride',
      vehicleCategoryId: catSuv._id,
      baseFare: 120,
      perKmRate: 18,
      minimumKm: 5,
    });

    console.log('Pricing seeded');
    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await disconnectDB();
  }
}

seed();
