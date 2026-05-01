import config from '../../config/env.js';

/**
 * Geocodes an address string to coordinates using Nominatim (OpenStreetMap)
 * @param {string} address 
 */
async function geocodeOSM(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NammaTaxi-App' } // Required by Nominatim policy
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null;
  } catch (error) {
    console.error('MAPS: OSM Geocoding failed:', error.message);
    return null;
  }
}

/**
 * Calculates distance/duration using OSRM (OpenStreetMap)
 */
async function getDistanceOSRM(origin, destination) {
  try {
    const start = await geocodeOSM(origin);
    const end = await geocodeOSM(destination);

    if (!start || !end) return null;

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) return null;

    return {
      distanceKm: data.routes[0].distance / 1000,
      durationMins: Math.round(data.routes[0].duration / 60),
      status: 'OK_OSRM'
    };
  } catch (error) {
    console.error('MAPS: OSRM Routing failed:', error.message);
    return null;
  }
}

/**
 * Primary interface for distance and duration.
 * Strategy: Google Maps (if key exists) -> OSRM (Free) -> Static Fallback
 */
export async function getDistanceAndDuration(origin, destination) {
  if (!origin || !destination) return null;

  const apiKey = config.maps.googleApiKey;

  // 1. Try Google Maps if API key is present
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distanceKm: element.distance.value / 1000,
          durationMins: Math.round(element.duration.value / 60),
          status: 'OK_GOOGLE'
        };
      }
    } catch (error) {
      console.warn('MAPS: Google Maps request failed, falling back to OSRM.');
    }
  }

  // 2. Fallback to OSRM (Free Road-based routing)
  console.info('MAPS: Using OSRM for distance calculation...');
  const osrmData = await getDistanceOSRM(origin, destination);
  if (osrmData) return osrmData;

  // 3. Final Fallback (Estimation) is handled by the caller (quoteService)
  return null;
}
