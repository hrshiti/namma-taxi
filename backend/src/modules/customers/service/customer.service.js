import Customer from '../model/customer.model.js';
import { AppError } from '../../../utils/AppError.js';

export async function getCustomerById(id) {
  const customer = await Customer.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!customer) throw AppError.notFound('Customer not found');
  return customer;
}

export async function updateCustomer(id, data) {
  const customer = await Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw AppError.notFound('Customer not found');
  return customer;
}

export async function getAllCustomers(filters = {}) {
  const { search } = filters;
  const matchQuery = { isDeleted: { $ne: true } };

  if (search) {
    matchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  return Customer.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'customerId',
        as: 'rides'
      }
    },
    {
      $addFields: {
        rideCount: { $size: '$rides' }
      }
    },
    { $project: { rides: 0, password: 0 } },
    { $sort: { createdAt: -1 } }
  ]);
}
