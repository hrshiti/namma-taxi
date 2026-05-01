import ToursPackage from '../model/toursPackage.model.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler as catchAsync } from '../../../utils/asyncHandler.js';

/**
 * Get all active tours packages
 * @route GET /api/v1/tours
 */
export const getToursPackages = catchAsync(async (req, res) => {
  const packages = await ToursPackage.find({ isActive: true }).sort({ name: 1 });
  
  sendSuccess(res, {
    message: 'Tours packages fetched successfully',
    data: packages,
  });
});
