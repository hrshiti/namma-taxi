import serviceAirport from './assets/service_airport-removebg-preview - Copy.png'
import serviceTours from './assets/service_tours-removebg-preview - Copy.png'
import serviceOutstation from './assets/service_outstation_-_Copy-removebg-preview - Copy.png'


export const services = [
    { id: 'local', name: 'Local City Ride', img: serviceTours },
    { id: 'airport', name: 'Airport Transfer', img: serviceAirport },
    { id: 'tours', name: 'Tours Packages', img: serviceTours },
    { id: 'outstation', name: 'Outstation', img: serviceOutstation }
];

export const imageMap = {
    'service_airport-removebg-preview - Copy.png': serviceAirport,
    'service_tours-removebg-preview - Copy.png': serviceTours,
    'service_outstation_-_Copy-removebg-preview - Copy.png': serviceOutstation,
};
