import jwt from 'jsonwebtoken';
import Staff from '../../staff/model/staff.model.js';
import { AppError } from '../../../utils/AppError.js';
import config from '../../../config/env.js';

/**
 * Generate a JWT access token
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Admin/Staff Login using email and password
 */
export async function loginAdmin({ email, password }) {
  const trimmedEmail = email.trim();
  // Find staff and include password for comparison
  const user = await Staff.findOne({ email: trimmedEmail }).select('+passwordHash');
  if (!user) {
    throw AppError.unauthorized('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Your account has been disabled', 'AUTH_ACCOUNT_DISABLED');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken({ userId: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

/**
 * Driver Login using phone and PIN/password
 */
export async function loginDriver({ phone, password }) {
  const Driver = (await import('../../drivers/model/driver.model.js')).default;
  
  const trimmedPhone = phone.trim();
  const user = await Driver.findOne({ phone: trimmedPhone }).select('+passwordHash');
  if (!user) {
    throw AppError.unauthorized('Invalid phone or PIN', 'AUTH_INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Your account has been disabled', 'AUTH_ACCOUNT_DISABLED');
  }

  // Secure PIN check with plaintext migration fallback
  let isMatch = false;
  if (user.passwordHash && user.passwordHash.startsWith('$2')) {
    isMatch = await user.comparePassword(password);
  } else {
    // Plaintext fallback for existing dev records - allows one-time migration
    isMatch = user.passwordHash === password;
    if (isMatch) {
      user.passwordHash = password; // Trigger pre-save hashing hook
      await user.save();
    }
  }

  if (!isMatch) {
    throw AppError.unauthorized('Invalid phone or PIN', 'AUTH_INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken({ userId: user._id, role: 'driver' });

  return {
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: 'driver',
    },
    token,
  };
}

/**
 * Phase 4: Request Customer OTP (Dev Simulation)
 */
export async function requestCustomerOtp({ phone }) {
  // Phase 4 Note: This is a dev simulation. Replace with Twilio/MSG91 in Phase 5.
  const code = '123456'; // Fixed dev OTP
  
  // Set expiry to 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60000);
  
  // Store or update OTP
  const Otp = (await import('../model/otp.model.js')).default;
  await Otp.findOneAndUpdate(
    { phone },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  return { message: 'OTP sent successfully (Dev mode: use 123456)' };
}

/**
 * Phase 4: Verify Customer OTP
 */
export async function verifyCustomerOtp({ phone, code }) {
  const Otp = (await import('../model/otp.model.js')).default;
  const Customer = (await import('../../customers/model/customer.model.js')).default;

  // Development Bypass
  if (code === '123456') {
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({ phone, name: 'Guest User' });
    }
    const token = generateToken({ userId: customer._id, role: 'customer' });
    return {
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: 'customer',
      },
      token,
    };
  }

  const otpRecord = await Otp.findOne({ phone, code });
  if (!otpRecord) {
    throw AppError.unauthorized('Invalid or expired OTP', 'AUTH_INVALID_OTP');
  }

  if (new Date() > otpRecord.expiresAt) {
    throw AppError.unauthorized('OTP has expired', 'AUTH_EXPIRED_OTP');
  }

  // OTP valid, find or create customer
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    // Create new customer with just phone
    customer = await Customer.create({ phone, name: 'New User' });
  }

  if (!customer.isActive) {
    throw AppError.forbidden('Your account has been disabled', 'AUTH_ACCOUNT_DISABLED');
  }

  // Delete the OTP record so it can't be reused
  await Otp.deleteOne({ _id: otpRecord._id });

  // Generate customer token
  const token = generateToken({ userId: customer._id, role: 'customer' });

  return {
    user: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      role: 'customer',
    },
    token,
  };
}

/**
 * Verify OTP without generating a token or creating a user record.
 * Used for guest action verification (e.g., cancellation).
 */
export async function verifyOtpOnly({ phone, code }) {
  const Otp = (await import('../model/otp.model.js')).default;
  const otpRecord = await Otp.findOne({ phone, code });

  if (!otpRecord) {
    throw AppError.unauthorized('Invalid or expired OTP', 'AUTH_INVALID_OTP');
  }

  if (new Date() > otpRecord.expiresAt) {
    throw AppError.unauthorized('OTP has expired', 'AUTH_EXPIRED_OTP');
  }

  // Delete the OTP record so it can't be reused
  await Otp.deleteOne({ _id: otpRecord._id });
  return true;
}

export async function getMe({ userId, role }) {
  if (role === 'customer') {
    const Customer = (await import('../../customers/model/customer.model.js')).default;
    const customer = await Customer.findById(userId);
    if (!customer) {
      throw AppError.unauthorized('Customer not found');
    }
    return {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      role: 'customer',
    };
  }

  // Fallback for admin/staff or other roles
  const Staff = (await import('../../staff/model/staff.model.js')).default;
  const staff = await Staff.findById(userId);
  if (staff) {
    return {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    };
  }

  if (role === 'driver') {
    const Driver = (await import('../../drivers/model/driver.model.js')).default;
    const driver = await Driver.findById(userId);
    if (driver) {
      return {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleNumber: driver.vehicleNumber,
        role: 'driver',
      };
    }
  }

  return { id: userId, role };
}
