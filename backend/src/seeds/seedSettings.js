import mongoose from 'mongoose';
import Setting from '../modules/settings/model/setting.model.js';
import { connectDB, disconnectDB } from '../config/database.js';

const defaultTaxiSettings = {
    productHeader: 'BOOKING POLICIES',
    returnPolicy: 'Free Cancellation (1hr before)',
    exchangePolicy: 'Instant Refund to Wallet',
    codPolicy: 'Pay at End of Trip',
    warrantyText: '24/7 Roadside Assistance',
    safetyText: 'Verified Professional Drivers',
    platingText: 'Clean & Sanitized Vehicles',
    announcementItems: [
        { id: 1, icon: 'Truck', text: '5% Off on Airport Drops' },
        { id: 2, icon: 'Shield', text: 'Safe & Secure Night Rides' },
        { id: 3, icon: 'RefreshCw', text: 'No Cancellation Fee (T&C)' },
        { id: 4, icon: 'Headset', text: '24/7 Dedicated Support' }
    ],
    fraudWarning: 'BEWARE: Namma Taxi never asks for OTP or Banking details over phone.',
    address: 'Namma Taxi HQ, Indiranagar, Bengaluru, KA 560038',
    phone: '+91 80 1234 5678',
    email: 'support@nammaxi.com',
    website: 'www.nammaxi.com',
    footerTagline: 'Ride with Trust,',
    footerSubTagline: 'Every KM with Safety.',
    footerDescription: 'Namma Taxi is Bengaluru\'s most reliable local and outstation taxi service. We provide premium rides at affordable rates with zero cancellations.',
    footerColumn1Title: 'Services',
    footerColumn2Title: 'Help',
    footerColumn3Title: 'Legal',
    footerExperienceLinks: [
        { id: 1, name: "Airport Taxi", path: "/airport" },
        { id: 2, name: "Outstation", path: "/out-station" },
        { id: 3, name: "Tours", path: "/tours-package" },
        { id: 4, name: "Local Ride", path: "/local" },
    ],
    footerPoliciesLinks: [
        { id: 1, name: "Fare Chart", path: "/fare-chart" },
        { id: 2, name: "Support", path: "/support" },
        { id: 3, name: "FAQs", path: "/help" },
        { id: 4, name: "Blogs", path: "/blog" },
    ],
    footerWorldLinks: [
        { id: 1, name: "Terms & Conditions", path: "/terms" },
        { id: 2, name: "Privacy Policy", path: "/privacy" },
        { id: 3, name: "Refund Policy", path: "/refund" },
        { id: 4, name: "Partner with Us", path: "/partner" },
    ],
    socialLinks: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        youtube: '#'
    },
    footerDeliveryText: 'Service available across major Indian cities.',
    footerCopyrightText: 'Namma Taxi Service. All Rights Reserved.',
};

async function seed() {
  try {
    await connectDB();
    
    // Check if settings already exist
    const existing = await Setting.findOne({ key: 'siteSettings' });
    if (existing) {
      console.log('Site settings already exist. Updating with new defaults...');
      existing.value = defaultTaxiSettings;
      await existing.save();
    } else {
      await Setting.create({
        key: 'siteSettings',
        value: defaultTaxiSettings,
        description: 'Global website settings for Namma Taxi'
      });
      console.log('✓ Site settings seeded successfully.');
    }
    
  } catch (err) {
    console.error('Error seeding settings:', err);
  } finally {
    await disconnectDB();
  }
}

seed();
