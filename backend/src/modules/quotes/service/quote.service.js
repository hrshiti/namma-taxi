import Quote from '../model/quote.model.js';
import Pricing from '../../pricing/model/pricing.model.js';
import VehicleCategory from '../../vehicle-categories/model/vehicleCategory.model.js';
import ToursPackage from '../../taxi/model/toursPackage.model.js';
import { AppError } from '../../../utils/AppError.js';
import * as mapService from '../../../integrations/maps/mapService.js';

/**
 * Calculates a fallback distance if actual map routing is not available.
 * This is a temporary placeholder strategy.
 */
function estimateDistance(serviceType, tripMode) {
  if (serviceType === 'airport') return 40; 
  if (serviceType === 'local') return 15; // Average city ride
  if (serviceType === 'outstation') {
    return tripMode === 'roundtrip' ? 600 : 300; 
  }
  return 0; 
}

export async function createQuote(data) {
  const { serviceType, tripMode, pickupLocation, dropLocation } = data;

  // 1. Fetch active pricing rules for this service and mode
  let pricingRules = await Pricing.find({
    serviceType,
    tripMode,
    isActive: true,
  }).populate('vehicleCategoryId');

  // SPECIAL PRODUCTION LOGIC: If it's a tour and no pricing rule exists, 
  // try to fetch price directly from ToursPackage model to ensure connectivity.
  if (!pricingRules.length && serviceType === 'tours') {
    const pkg = await ToursPackage.findOne({ slug: tripMode, isActive: true });
    if (pkg) {
      // Get all active vehicle categories to create virtual rules
      const categories = await VehicleCategory.find({ isActive: true });
      pricingRules = categories.map(cat => ({
        serviceType: 'tours',
        tripMode: pkg.slug,
        vehicleCategoryId: cat,
        packagePrice: pkg.basePrice, // Use package base price
        baseFare: pkg.basePrice,
        isActive: true
      }));
    }
  }

  if (!pricingRules.length) {
    throw AppError.notFound(`Service '${serviceType}' for '${tripMode}' is currently not available.`);
  }

  // 2. Resolve distance and duration (Maps Provider vs Fallback)
  let distanceKm = 0;
  let estimatedDuration = 0;
  let quoteSource = 'fallback';

  if (serviceType === 'tours') {
    quoteSource = 'package';
  } else {
    const routeData = await mapService.getDistanceAndDuration(pickupLocation, dropLocation);
    
    if (routeData) {
      distanceKm = routeData.distanceKm;
      estimatedDuration = routeData.durationMins;
      quoteSource = 'provider';
    } else {
      distanceKm = estimateDistance(serviceType, tripMode);
      quoteSource = 'fallback';
    }
  }
  
  // 2. Compute fares for each available vehicle category
  const availableCategories = pricingRules.map((rule) => {
    const category = rule.vehicleCategoryId;
    if (!category || !category.isActive) return null;

    let computedFare = 0;
    let baseFare = rule.baseFare || 0;
    let perKmRate = rule.perKmRate || 0;
    let driverAllowance = rule.driverAllowance || 0;

    if (serviceType === 'tours') {
      // Tours usually use a fixed package price
      computedFare = rule.packagePrice || baseFare;
    } else {
      // Basic distance computation
      const billableKm = Math.max(distanceKm, rule.minimumKm || 0);
      computedFare = baseFare + (billableKm * perKmRate) + driverAllowance;
      
      // If outstation roundtrip, driver allowance is per day
      if (serviceType === 'outstation' && tripMode === 'roundtrip') {
        computedFare += driverAllowance * 1; 
      }
    }

    // PRODUCTION GRADE: Round to nearest whole number
    computedFare = Math.round(computedFare);

    return {
      vehicleCategoryId: category._id,
      categoryName: category.name,
      seats: category.seats,
      luggage: category.luggage,
      ac: category.ac,
      image: category.image,
      baseDisplayPrice: category.baseDisplayPrice,
      computedFare,
      breakdown: {
        baseFare,
        perKmRate,
        driverAllowance,
      },
    };
  }).filter(Boolean);

  if (availableCategories.length === 0) {
    throw AppError.notFound('No vehicle categories available for this service');
  }

  // 3. Save quote (expires in 30 mins)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  
  const quote = await Quote.create({
    ...data,
    distanceKm,
    estimatedDuration,
    quoteSource,
    availableCategories,
    expiresAt,
  });

  return quote;
}

export async function getQuoteById(id) {
  const quote = await Quote.findById(id).populate('availableCategories.vehicleCategoryId');
  if (!quote) {
    throw AppError.notFound('Quote not found or expired');
  }
  return quote;
}
