import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import Booking from '../src/modules/bookings/model/booking.model.js';

async function checkBookings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namma-taxi');
        console.log('Connected to MongoDB');

        const total = await Booking.countDocuments();
        const statusCounts = await Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const rangeCounts = await Booking.aggregate([
            { $group: { _id: '$tripSummary.pickupDate', count: { $sum: 1 } } }
        ]);

        console.log('Total Bookings:', total);
        console.log('Status Counts:', statusCounts);
        console.log('Date Counts:', rangeCounts);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkBookings();
