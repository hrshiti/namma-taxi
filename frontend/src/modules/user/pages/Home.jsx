import React from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ServiceGrid from '../components/ServiceGrid';
import AirportForm from '../components/AirportForm';
import ToursForm from '../components/ToursForm';
import OutstationForm from '../components/OutstationForm';
import LocalForm from '../components/LocalForm';
import Banners from '../components/Banners';
import heroTaxi from '../../../assets/hero_taxi.png';
import { services } from '../../../data';

const Home = ({ 
    activeService, 
    setActiveService, 
    airportMode, 
    setAirportMode, 
    location, 
    setLocation, 
    dropLocation, 
    setDropLocation, 
    pickupDate, 
    setPickupDate, 
    pickupTime, 
    setPickupTime, 
    phoneNumber, 
    setPhoneNumber, 
    selectedPackage, 
    setSelectedPackage, 
    outstationMode, 
    setOutstationMode, 
    returnDate, 
    setReturnDate,
    handleSearch,
    globalCategories = []
}) => {
    return (
        <div className="animate-slide-up">
            <SEO pageName="user" />
            <Header />
            <Hero heroTaxi={heroTaxi} />
            
            <ServiceGrid 
                services={services} 
                activeService={activeService} 
                setActiveService={setActiveService} 
            />

            <div className="px-4">
                <div className="booking-form">
                    {activeService === 'local' && (
                        <LocalForm 
                            location={location}
                            setLocation={setLocation}
                            dropLocation={dropLocation}
                            setDropLocation={setDropLocation}
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                            pickupTime={pickupTime}
                            setPickupTime={setPickupTime}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            setView={handleSearch}
                        />
                    )}
                    {activeService === 'airport' && (
                        <AirportForm 
                            airportMode={airportMode}
                            setAirportMode={setAirportMode}
                            location={location}
                            setLocation={setLocation}
                            dropLocation={dropLocation}
                            setDropLocation={setDropLocation}
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                            pickupTime={pickupTime}
                            setPickupTime={setPickupTime}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            setView={handleSearch}
                        />
                    )}
                    {activeService === 'tours' && (
                        <ToursForm 
                            selectedPackage={selectedPackage}
                            setSelectedPackage={setSelectedPackage}
                            location={location}
                            setLocation={setLocation}
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                            pickupTime={pickupTime}
                            setPickupTime={setPickupTime}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            setView={handleSearch}
                        />
                    )}
                    {activeService === 'outstation' && (
                        <OutstationForm 
                            outstationMode={outstationMode}
                            setOutstationMode={setOutstationMode}
                            location={location}
                            setLocation={setLocation}
                            dropLocation={dropLocation}
                            setDropLocation={setDropLocation}
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                            pickupTime={pickupTime}
                            setPickupTime={setPickupTime}
                            returnDate={returnDate}
                            setReturnDate={setReturnDate}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            setView={handleSearch}
                        />
                    )}
                </div>
            </div>

            {/* Dynamic Fleet Preview */}
            {globalCategories.length > 0 && (
                <div className="px-5 mt-10">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="font-extrabold text-sm uppercase tracking-tight">Our Premium Fleet</h2>
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">Real-time Availability</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                        {globalCategories.map(cat => (
                            <div key={cat._id} className="flex-shrink-0 w-[160px] bg-white p-4 rounded-[2rem] border border-black/5 shadow-sm text-center">
                                <div className="h-20 flex items-center justify-center mb-2">
                                    <img 
                                        src={cat.image} 
                                        className="w-full h-auto object-contain max-h-full drop-shadow-sm" 
                                        alt={cat.name} 
                                    />
                                </div>
                                <h3 className="font-black text-[10px] uppercase tracking-tight text-obsidian truncate">{cat.name}</h3>
                                <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">{cat.seats} Seater • AC</p>
                                <div className="mt-2 pt-2 border-t border-black/5">
                                    <span className="text-[9px] font-black text-primary uppercase">Starting ₹{cat.baseDisplayPrice || '??'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Banners />
            <div className="flex justify-center py-8 opacity-20">
                <p className="text-3xl font-black italic tracking-tighter text-obsidian">#goNammaTaxi</p>
            </div>
        </div>
    );
};

export default Home;
