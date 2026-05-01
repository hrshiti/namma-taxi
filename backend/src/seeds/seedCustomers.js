import mongoose from 'mongoose';
import Customer from '../modules/customers/model/customer.model.js';
import { connectDB, disconnectDB } from '../config/database.js';

const mockCustomers = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    isActive: true,
    isBlocked: false
  },
  {
    name: 'Anjali Gupta',
    email: 'anjali@example.com',
    phone: '9888888888',
    isActive: true,
    isBlocked: false
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '9777777777',
    isActive: true,
    isBlocked: true
  }
];

async function seed() {
  try {
    await connectDB();
    
    // Check if customers already exist
    const count = await Customer.countDocuments();
    if (count > 0) {
      console.log('Customers already exist in database. Skipping seed.');
      return;
    }

    await Customer.insertMany(mockCustomers);
    console.log('✓ Mock customers seeded successfully.');
    
  } catch (err) {
    console.error('Error seeding customers:', err);
  } finally {
    await disconnectDB();
  }
}

seed();
