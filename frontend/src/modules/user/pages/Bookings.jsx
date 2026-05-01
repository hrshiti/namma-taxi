import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import socket from '../../../lib/socket';

const Bookings = () => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookings = async (isSilent = false) => {
        try {
            if (!isSilent) setIsLoading(true);
            const res = await api.get('/bookings/my');
            setHistory(res.data);
            
            // If a booking is currently selected, update its data too
            if (selectedBooking) {
                const updated = res.data.find(b => b._id === selectedBooking._id);
                if (updated) setSelectedBooking(updated);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        
        // Listen for real-time updates
        const handleUpdate = (updatedBooking) => {
            fetchBookings(true); // Silent refresh
        };

        socket.on('booking_updated', handleUpdate);
        socket.on('booking_cancelled', handleUpdate);

        return () => {
            socket.off('booking_updated', handleUpdate);
            socket.off('booking_cancelled', handleUpdate);
        };
    }, [selectedBooking?._id]);

    if (selectedBooking) {
        return (
            <div className="animate-slide-up px-6 pt-6">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => setSelectedBooking(null)} 
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-black">Trip Details</h1>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm space-y-6 mb-32">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</p>
                            <h2 className="text-lg font-black text-obsidian">{selectedBooking.bookingRef}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {selectedBooking.paymentStatus}
                                </span>
                                {selectedBooking.refundStatus && selectedBooking.refundStatus !== 'none' && (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        selectedBooking.refundStatus === 'processed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        Refund: {selectedBooking.refundStatus}
                                    </span>
                                )}
                            </div>
                            {selectedBooking.startOTP && !['completed', 'cancelled'].includes(selectedBooking.status) && (
                                <div className="mt-4 bg-[#F7DC9D]/20 border border-[#F7DC9D]/30 rounded-2xl p-3 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Start OTP</span>
                                    <span className="text-lg font-black text-black tracking-[0.3em]">{selectedBooking.startOTP}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                ['new', 'confirmed', 'assigned'].includes(selectedBooking.status) ? 'bg-blue-100 text-blue-600' : 
                                ['enroute', 'arrived', 'started'].includes(selectedBooking.status) ? 'bg-orange-100 text-orange-600' :
                                selectedBooking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'
                            }`}>
                                {selectedBooking.status}
                            </span>
                            {['new', 'confirmed', 'assigned', 'enroute', 'arrived'].includes(selectedBooking.status) && (
                                <button 
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to cancel this trip?')) {
                                            try {
                                                await api.post(`/bookings/${selectedBooking._id}/cancel`, { reason: 'User cancelled' });
                                                fetchBookings();
                                            } catch (err) {
                                                alert(err.response?.data?.message || 'Failed to cancel booking');
                                            }
                                        }
                                    }}
                                    className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                >
                                    Cancel Trip
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase">Pickup Location</p>
                                <p className="text-sm font-bold text-obsidian">{selectedBooking.tripSummary?.pickupLocation}</p>
                            </div>
                        </div>
                        {selectedBooking.tripSummary?.dropLocation && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-obsidian/5 flex items-center justify-center text-obsidian flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Drop-off Destination</p>
                                    <p className="text-sm font-bold text-obsidian">{selectedBooking.tripSummary?.dropLocation}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase">Vehicle Assigned</p>
                            <p className="text-sm font-black text-obsidian">{selectedBooking.selectedVehicleCategory?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase">Total Fare</p>
                            <p className="text-xl font-black text-primary">₹{selectedBooking.fareDetails?.computedFare}</p>
                        </div>
                    </div>

                    {selectedBooking.assignedDriver && (
                        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shadow-inner flex-shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBooking.assignedDriver.name)}&background=random`} alt="driver" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-sm uppercase tracking-tight">{selectedBooking.assignedDriver.name}</h4>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                        {selectedBooking.assignedDriver.vehicleNumber}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="text-[10px] font-black">5.0 • Driver Assigned</span>
                                </div>
                            </div>
                            <a href={`tel:${selectedBooking.assignedDriver.phone}`} className="bg-obsidian text-white p-3.5 rounded-2xl shadow-xl active:scale-95 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-up px-6 pt-6">
            <h1 className="text-2xl font-black mb-8">My Bookings</h1>
            
            <div className="space-y-4 mb-32">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-400 font-bold">Loading...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold">No bookings found.</div>
                ) : history.map(item => (
                    <div 
                        key={item._id} 
                        onClick={() => setSelectedBooking(item)}
                        className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group active:scale-[0.98]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                    {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <h3 className="font-black text-base group-hover:text-primary transition-colors">{item.selectedVehicleCategory?.name}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                ['new', 'confirmed', 'assigned'].includes(item.status) ? 'bg-blue-100 text-blue-600' : 
                                ['enroute', 'arrived', 'started'].includes(item.status) ? 'bg-orange-100 text-orange-600' :
                                item.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-[11px] font-medium">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                <span className="truncate">{item.tripSummary?.pickupLocation}</span>
                            </div>
                            {item.tripSummary?.dropLocation && (
                                <>
                                    <svg className="w-3 h-3 flex-shrink-0 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-obsidian flex-shrink-0"></div>
                                        <span className="truncate">{item.tripSummary?.dropLocation}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bookings;
