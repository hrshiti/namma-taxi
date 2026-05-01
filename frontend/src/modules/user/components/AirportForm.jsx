import React from 'react';
import { InputField, DateTimePicker } from './FormFields';

const AirportForm = ({ 
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
    setView 
}) => {
    const handleModeChange = (mode) => {
        setAirportMode(mode);
        if (mode === 'drop') {
            setDropLocation('Kempegowda International Airport (BLR)');
            setLocation('');
        } else if (mode === 'pickup') {
            setLocation('Kempegowda International Airport (BLR)');
            setDropLocation('');
        }
    };

    return (
        <div className="animate-slide-up">
            <div className="flex gap-2 mb-4">
                {['pickup', 'drop'].map(mode => (
                    <button 
                        key={mode} 
                        onClick={() => handleModeChange(mode)} 
                        className={`flex-1 py-2.5 text-[9px] font-black uppercase rounded-2xl transition-all ${airportMode === mode ? 'bg-obsidian text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
            
            <div className="space-y-3">
                <InputField 
                    label={airportMode === 'pickup' ? "Airport" : "Live Pickup"}
                    placeholder={airportMode === 'pickup' ? "Airport Pickup" : "Enter Pickup Location"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <InputField 
                    label={airportMode === 'drop' ? "Airport" : "Drop-off"}
                    placeholder={airportMode === 'drop' ? "Airport Drop" : "Enter Drop Location"}
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                />

                <DateTimePicker 
                    dateValue={pickupDate}
                    onDateChange={setPickupDate}
                    timeValue={pickupTime}
                    onTimeChange={setPickupTime}
                />

                <InputField 
                    placeholder="+91 Phone number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    label="Contact"
                />

                <button 
                    onClick={() => setView('results')} 
                    className="primary-btn flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <span>Search Cabs</span>
                </button>
            </div>
        </div>
    );
};

export default AirportForm;
