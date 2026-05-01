import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, CheckCircle, Package } from 'lucide-react';
import api from '../../../lib/api';
import socket from '../../../lib/socket';

const DriverBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/driver/bookings');
            if (res && res.data) {
                setBookings(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        const handleUpdate = () => fetchBookings();
        socket.on('booking_updated', handleUpdate);
        socket.on('booking_created', handleUpdate);
        socket.on('booking_cancelled', handleUpdate);

        return () => {
            socket.off('booking_updated', handleUpdate);
            socket.off('booking_created', handleUpdate);
            socket.off('booking_cancelled', handleUpdate);
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'assigned': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'enroute': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'arrived': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
            case 'started': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-1 mb-8">
                <h2 className="text-2xl font-serif font-black uppercase text-black">Your Rides</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Viewing all assigned jobs</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <div className="w-8 h-8 border-4 border-[#F7DC9D] border-t-black rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Updating Jobs...</span>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-black/5 text-gray-400">
                    <Package size={40} className="mb-4 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Active Bookings</span>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <div 
                            key={booking._id} 
                            onClick={() => navigate(`/driver/booking/${booking._id}`)}
                            className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-black uppercase tracking-wider">{booking.bookingRef}</span>
                                    <span className="text-[10px] font-bold text-[#F7DC9D] uppercase tracking-tight mt-0.5">{booking.selectedVehicleCategory?.name}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin size={14} className="text-black mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup</span>
                                        <span className="text-xs font-bold text-black line-clamp-1">{booking.tripSummary.pickupLocation}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock size={14} className="text-gray-300 mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                                        <span className="text-xs font-bold text-black">{booking.tripSummary.pickupDate} at {booking.tripSummary.pickupTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                                <span className="text-sm font-serif font-black text-black">₹{booking.fareDetails.computedFare}</span>
                                <div className="flex items-center gap-1 text-[#F7DC9D] group-hover:text-black transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Open Job</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                            
                            {/* Visual indicator for new jobs */}
                            {booking.status === 'assigned' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#F7DC9D]" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Refresh FAB */}
            <button 
                onClick={fetchBookings}
                className="fixed bottom-6 right-6 p-4 bg-black text-[#F7DC9D] rounded-2xl shadow-2xl active:scale-90 transition-all z-50 border-2 border-[#F7DC9D]/20"
            >
                <Clock size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
    );
};

export default DriverBookings;
