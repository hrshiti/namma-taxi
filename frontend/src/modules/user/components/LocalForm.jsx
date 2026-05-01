import { InputField, DateTimePicker } from './FormFields';

const LocalForm = ({ 
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
    return (
        <div className="animate-slide-up space-y-3">
            <InputField 
                label="Live Pickup"
                placeholder="Pickup Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
            
            <InputField 
                label="Destination"
                placeholder="Where to?"
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
                label="Contact"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 Phone number" 
            />

            <button 
                onClick={() => setView('results')} 
                className="primary-btn flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
                <div className="w-5 h-5 bg-obsidian rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </div>
                <span>Search Cabs</span>
            </button>
        </div>
    );
};

export default LocalForm;
