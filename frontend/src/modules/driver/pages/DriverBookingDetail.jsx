import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Navigation, CheckCircle, ChevronLeft, ArrowRight, User, ShieldCheck, Clock, Check, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import socket from '../../../lib/socket';

const DriverBookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [otp, setOtp] = useState('');

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/driver/bookings/${id}`);
            if (res && res.data) {
                setBooking(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch booking details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();

        const handleUpdate = (updatedBooking) => {
            if (updatedBooking._id === id) {
                fetchBooking();
            }
        };

        socket.on('booking_updated', handleUpdate);
        socket.on('booking_cancelled', handleUpdate);

        return () => {
            socket.off('booking_updated', handleUpdate);
            socket.off('booking_cancelled', handleUpdate);
        };
    }, [id]);

    const handleStatusUpdate = async (nextStatus) => {
        if (nextStatus === 'started' && (!otp || otp.length < 4)) {
            alert('Please enter a valid 4-digit OTP provided by the customer.');
            return;
        }

        if (!window.confirm(`Are you sure you want to mark this ride as ${nextStatus.toUpperCase()}?`)) return;
        
        try {
            setActionLoading(true);
            const res = await api.patch(`/driver/bookings/${id}/status`, { status: nextStatus, otp });
            if (res && res.data) {
                setBooking(res.data);
                if (nextStatus === 'completed') {
                    alert('Ride Completed! Great Job.');
                    navigate('/driver/bookings');
                }
            }
        } catch (error) {
            console.error('Failed to update status', error);
            alert(error.response?.data?.message || 'Update failed. Please check network.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 font-outfit">
            <div className="w-12 h-12 border-[6px] border-[#F7DC9D]/20 border-t-black rounded-full animate-spin mb-6" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Job Details...</span>
        </div>
    );

    if (!booking) return (
        <div className="p-10 text-center font-outfit">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-red-500 opacity-20" size={40} />
            </div>
            <h3 className="font-black text-xl mb-2 text-black uppercase">Ride Link Broken</h3>
            <p className="text-gray-400 text-xs mb-8">We couldn't retrieve this ride details. It might be assigned to another driver.</p>
            <button onClick={() => navigate('/driver/bookings')} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Return to List</button>
        </div>
    );

    // Contextual Action Determination
    const getStatusInfo = () => {
        console.log('Current Status:', booking.status); // Debug Log
        switch (booking.status) {
            case 'confirmed': 
            case 'assigned': return { next: 'enroute', label: 'Start Enroute', color: 'bg-black text-[#F7DC9D]', icon: <Navigation size={20} /> };
            case 'enroute': return { next: 'arrived', label: 'Mark Arrived', color: 'bg-cyan-500 text-white', icon: <CheckCircle size={20} /> };
            case 'arrived': return { next: 'started', label: 'Start Trip/OTP', color: 'bg-orange-500 text-white', icon: <ArrowRight size={20} /> };
            case 'started': return { next: 'completed', label: 'Finish Ride', color: 'bg-emerald-500 text-white', icon: <Check size={24} /> };
            default: return null;
        }
    };

    const nextAction = getStatusInfo();

    return (
        <div className="space-y-6 font-outfit pb-40 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/driver/bookings')}
                    className="w-12 h-12 bg-white rounded-2xl border border-black/5 flex items-center justify-center text-black shadow-sm active:scale-90"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-serif font-black uppercase leading-none">{booking.bookingRef}</h2>
                        <span className="text-[8px] font-black bg-[#F7DC9D] text-black px-2 py-1 rounded-lg uppercase tracking-widest">{booking.status}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Reference ID</p>
                </div>
            </div>

            {/* STATUS CONTROL CENTER (THE ACTION PANEL) */}
            <div className="bg-[#F7DC9D] p-6 rounded-[2.5rem] shadow-xl border-4 border-black/10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none mb-1">Operational Control</span>
                        <h3 className="text-lg font-black text-black">Update Ride Status</h3>
                    </div>
                    <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
                        <Clock size={20} className="text-black/60" />
                    </div>
                </div>
                
                {nextAction?.next === 'started' && (
                    <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-black/5 rounded-3xl p-4 border-2 border-dashed border-black/10">
                            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block mb-3 text-center">Ask Customer for Start OTP</span>
                            <input 
                                type="text" 
                                maxLength={4}
                                placeholder="ENTER 4-DIGIT OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-white py-4 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-black outline-none border-2 border-transparent focus:border-black transition-all placeholder:text-black/10 placeholder:tracking-normal placeholder:text-xs"
                            />
                        </div>
                    </div>
                )}

                {nextAction ? (
                    <button 
                        onClick={() => handleStatusUpdate(nextAction.next)}
                        disabled={actionLoading}
                        className={`w-full flex items-center justify-between p-5 rounded-[2rem] shadow-lg active:scale-[0.98] transition-all border-2 border-white/20 ${nextAction.color}`}
                    >
                        <div className="flex items-center gap-4 pl-2">
                            <div className="bg-white/20 p-2 rounded-xl">
                                {nextAction.icon}
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider">{nextAction.label}</span>
                        </div>
                        {actionLoading ? (
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <ArrowRight size={20} className="mr-2" />
                        )}
                    </button>
                ) : (
                    <div className="bg-white/50 p-6 rounded-3xl text-center border border-black/5 flex flex-col items-center">
                        <AlertCircle size={32} className="text-black/20 mb-2" />
                        <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">Ride in Final State: {booking.status}</span>
                    </div>
                )}
            </div>

            {/* Customer Details Card */}
            <div className="bg-white p-7 rounded-[2.5rem] border border-black/5 shadow-sm relative">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-black text-[#F7DC9D] rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl">
                            {booking.customerInfo.name?.[0] || 'C'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-black uppercase block leading-none">{booking.customerInfo.name}</span>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                <ShieldCheck size={10} /> Verified Customer
                            </span>
                        </div>
                    </div>
                    <a href={`tel:${booking.customerInfo.phone}`} className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                        <Phone size={24} fill="currentColor" />
                    </a>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black border border-black/5">
                            <MapPin size={18} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Pick-up Location</span>
                            <span className="text-[13px] font-bold text-black leading-snug">{booking.tripSummary.pickupLocation}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 border-t border-gray-50 pt-8">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border border-black/5">
                            <Navigation size={18} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Drop-off Location</span>
                            <span className="text-[13px] font-bold text-black leading-snug">{booking.tripSummary.dropLocation || 'As directed by customer'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fare Summary */}
            <div className="bg-obsidian p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[#F7DC9D] uppercase tracking-[0.3em] block mb-2 opacity-60">Estimated Fare</span>
                    <span className="text-3xl font-serif font-black">₹{booking.fareDetails.computedFare}</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest block mb-2 opacity-40">Vehicle Type</span>
                    <div className="px-5 py-2.5 bg-white/10 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black text-[#F7DC9D] uppercase tracking-tighter">{booking.selectedVehicleCategory.name}</span>
                    </div>
                </div>
            </div>

            {/* Quick Action FAB */}
            {nextAction && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-[1000]">
                    <button 
                        onClick={() => handleStatusUpdate(nextAction.next)}
                        disabled={actionLoading}
                        className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all border-4 border-white/20 ${nextAction.color}`}
                    >
                        <div className="flex flex-col items-start pl-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-0.5 text-left">Slide to Progress</span>
                            <span className="text-sm font-black uppercase tracking-[0.1em]">{nextAction.label}</span>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            {actionLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={28} />}
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DriverBookingDetail;
