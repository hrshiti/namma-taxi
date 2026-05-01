import Coupon from '../model/coupon.model.js';
import { AppError } from '../../../utils/AppError.js';

export async function getAllCoupons() {
  return Coupon.find().sort({ createdAt: -1 });
}

export async function createCoupon(data) {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw AppError.badRequest('Coupon code already exists');
  }
  return Coupon.create(data);
}

export async function updateCoupon(id, data) {
  const coupon = await Coupon.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    throw AppError.notFound('Coupon not found');
  }
  return coupon;
}

export async function deleteCoupon(id) {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    throw AppError.notFound('Coupon not found');
  }
  return coupon;
}

export async function validateCoupon(code, orderValue) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    throw AppError.notFound('Invalid coupon code');
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    throw AppError.badRequest('Coupon has expired');
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw AppError.badRequest('Coupon usage limit reached');
  }

  if (orderValue < coupon.minOrderValue) {
    throw AppError.badRequest(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  return coupon;
}

export async function incrementUsage(code) {
  return Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usageCount: 1 } },
    { new: true }
  );
}
