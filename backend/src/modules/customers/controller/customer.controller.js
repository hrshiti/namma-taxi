import * as customerService from '../service/customer.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

export async function getMe(req, res) {
  const { userId } = req.user;
  const customer = await customerService.getCustomerById(userId);
  return sendSuccess(res, {
    data: customer,
    message: 'Profile retrieved',
  });
}

export async function updateMe(req, res) {
  const { userId } = req.user;
  
  // Prevent updating sensitive fields
  const allowedUpdates = {
    name: req.body.name,
    email: req.body.email,
    profileImage: req.body.profileImage,
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

  const customer = await customerService.updateCustomer(userId, allowedUpdates);
  return sendSuccess(res, {
    data: customer,
    message: 'Profile updated',
  });
}

export async function getAllCustomers(req, res) {
  const customers = await customerService.getAllCustomers(req.query);
  return sendSuccess(res, {
    data: customers,
    message: 'All customers retrieved',
  });
}

export async function adminUpdateCustomer(req, res) {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  return sendSuccess(res, {
    data: customer,
    message: 'Customer updated by admin',
  });
}
