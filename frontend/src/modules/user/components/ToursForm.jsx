import React, { useState, useEffect } from 'react';
import { InputField, DateTimePicker } from './FormFields';
import api from '../../../lib/api';

const ToursForm = ({ 
    selectedPackage, 
    setSelectedPackage, 
    location, 
    setLocation, 
    pickupDate, 
    setPickupDate, 
    pickupTime, 
    setPickupTime, 
    phoneNumber, 
    setPhoneNumber, 
    setView 
}) => {
    const [dynamicPackages, setDynamicPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fallbackPackages = [
        { value: "1day_450km_arunachalam", label: "1 DAY TRIP ARUNACHALAM/TIRUVANNAMALAI PACKAGE 450 KM" },
        { value: "1day_300km_hogenakkal", label: "1 DAY TRIP HOGENAKKAL FALLS PACKAGE 300 KM" },
        { value: "1day_300km_lepakshi", label: "1 DAY TRIP LEPAKSHI & ISHA/ADIYOGI PACKAGE 300 KM" },
        { value: "3day_mysore_coorg", label: "3 DAY TRIP MYSORE & COORG/MADIKERI PACKAGE KM" },
        { value: "4hr_40km", label: "4 Hours 40 KM" },
        { value: "8hr_160km_isha", label: "8 Hours 8 hrs Isha Foundation Chikkaballapura 160 km KM" },
        { value: "8hr_160km_nandi", label: "8 Hours 8 hrs Nandi Hills Roundtrip 160 km KM" },
        { value: "8hr_80km", label: "8 Hours 80 KM" },
        { value: "10hr_200km_nandi_isha", label: "10 Hours 10 HRS Nandi Hills + Isha Foundation 200 KM" },
        { value: "10hr_200km_kotilingeshwara", label: "10 Hours KOTILINGESHWARA+ 200KM PACKAGE KM" },
        { value: "12hr_300km_koti_isha", label: "12 Hours KOTILINGESHWARA + ISHA FOUNDATION 300KM PACKAGE KM" },
        { value: "24hr_mysore", label: "24 Hours DAY TRIP MYSORE PACKAGE KM" }
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsLoading(true);
                const res = await api.get('/tours');
                if (res && res.data && res.data.length > 0) {
                    const mapped = res.data.map(pkg => ({
                        value: pkg.slug,
                        label: pkg.name
                    }));
                    setDynamicPackages(mapped);
                }
            } catch (err) {
                console.error('Failed to fetch tours packages:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const displayPackages = dynamicPackages.length > 0 ? dynamicPackages : fallbackPackages;

    return (
        <div className="animate-slide-up space-y-3 text-left">
            <div className="relative group">
                <select 
                    className="form-input appearance-none pr-8" 
                    value={selectedPackage} 
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="">{isLoading ? 'Loading Packages...' : 'Select Package'}</option>
                    {displayPackages.map((pkg, index) => (
                        <option key={index} value={pkg.value}>{pkg.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1 z-10">Tours Package</span>
            </div>
            
            <InputField 
                label="Live Pickup"
                placeholder="Pickup Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <DateTimePicker 
                dateValue={pickupDate}
                onDateChange={setPickupDate}
                timeValue={pickupTime}
                onTimeChange={setPickupTime}
            />

            <InputField 
                label="Contact"
                placeholder="+91 Phone number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <button 
                onClick={() => setView('results')} 
                className="primary-btn flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
                <div className="w-5 h-5 bg-obsidian rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </div>
                <span>Check Packages</span>
            </button>
        </div>
    );
};

export default ToursForm;
