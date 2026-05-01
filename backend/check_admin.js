import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma-taxi';

const staffSchema = new mongoose.Schema({
  email: String,
  role: String,
  isActive: Boolean,
});

const Staff = mongoose.model('Staff', staffSchema, 'staffs');

async function checkAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const admins = await Staff.find({ role: 'admin' });
    
    if (admins.length > 0) {
      console.log('\nFound Admin Users:');
      admins.forEach(admin => {
        console.log(`- Email: ${admin.email}, Active: ${admin.isActive}`);
      });
    } else {
      console.log('\nNo Admin users found in the database!');
      
      // Check for any staff
      const anyStaff = await Staff.findOne();
      if (anyStaff) {
        console.log('Some staff exists but none with "admin" role.');
      } else {
        console.log('The staffs collection is empty.');
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
