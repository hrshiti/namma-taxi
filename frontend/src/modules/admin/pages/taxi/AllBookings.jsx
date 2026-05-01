import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Trash2, CheckCircle, XCircle, Clock, ChevronDown, Bell, Calendar, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../../../lib/api';
import socket from '../../../../lib/socket';
import SmartDispatchPicker from '../../components/SmartDispatchPicker';
import BookingAuditModal from '../../components/BookingAuditModal';
import CreateSupportCaseModal from '../../components/CreateSupportCaseModal';
import { Shield } from 'lucide-react';

const AllBookings = ({ title: propTitle = "All Bookings", filterStatus: propFilterStatus = null }) => {
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [range, setRange] = useState('all');
    const [auditBookingId, setAuditBookingId] = useState(null);
    const [showCreateCase, setShowCreateCase] = useState(false);
    const [selectedBookingForCase, setSelectedBookingForCase] = useState(null);

    // Determine section from path segments
    const getSectionConfig = () => {
        const segments = location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        const configs = {
            'new': { title: "New Bookings", status: "new", desc: "Incoming requests pending confirmation" },
            'today': { title: "Today's Bookings", range: "today", desc: "All rides scheduled for today" },
            'cancelled': { title: "Cancelled Bookings", status: "cancelled", desc: "History of cancelled ride requests" },
            'completed': { title: "Completed Bookings", status: "completed", desc: "Successfully finished trips" },
            'running': { title: "Running Bookings", status: "assigned,enroute,arrived,started", desc: "Trips currently in progress" },
            'online': { title: "Online Bookings", paymentMethod: "online", desc: "Bookings paid via online channels" },
            'offline': { title: "Offline Bookings", paymentMethod: "cash", desc: "Bookings with cash payment" },
            'advanced': { title: "Advanced Bookings", range: "advanced", desc: "Future scheduled rides (from tomorrow onwards)" },
            'free-vehicles': { title: "Unassigned Bookings", range: "unassigned", desc: "Confirmed rides waiting for driver dispatch" }
        };

        return configs[lastSegment] || { title: propTitle, status: propFilterStatus, desc: "Master log of all ride requests" };
    };

    const section = getSectionConfig();

    const STATUS_FLOW = {
        'new': ['confirmed', 'cancelled'],
        'confirmed': ['assigned', 'cancelled'],
        'assigned': ['enroute', 'cancelled'],
        'enroute': ['arrived', 'cancelled'],
        'arrived': ['started', 'cancelled'],
        'started': ['completed'],
        'completed': [],
        'cancelled': []
    };

    const fetchData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            
            let queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            
            // Priority 1: Status from subsection
            if (section.status) {
                queryParams.append('status', section.status);
            }
            
            // Priority 2: Range (Subsection range overrides the local tab state if it exists)
            const activeRange = section.range || range;
            if (activeRange && activeRange !== 'all') {
                queryParams.append('range', activeRange);
            }

            // Priority 3: Payment Method
            if (section.paymentMethod) {
                queryParams.append('paymentMethod', section.paymentMethod);
            }

            const [bookingsRes, driversRes] = await Promise.all([
                api.get(`/bookings?${queryParams.toString()}`),
                api.get('/drivers?isActive=true&status=available')
            ]);
            
            if (bookingsRes?.data) setBookings(bookingsRes.data);
            if (driversRes?.data) setDrivers(driversRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Listen for real-time updates
        const handleSocketUpdate = () => {
            fetchData(true); // Silent refresh
        };

        socket.on('booking_created', handleSocketUpdate);
        socket.on('booking_updated', handleSocketUpdate);
        socket.on('booking_cancelled', handleSocketUpdate);

        // Polling as a fallback every 30 seconds
        const interval = setInterval(() => fetchData(true), 30000);
        
        return () => {
            clearInterval(interval);
            socket.off('booking_created', handleSocketUpdate);
            socket.off('booking_updated', handleSocketUpdate);
            socket.off('booking_cancelled', handleSocketUpdate);
        };
    }, [range, searchTerm, location.pathname]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status: newStatus });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (error) {
            console.error('Failed to update status', error);
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAssignDriver = async (bookingId, driverId) => {
        if (!driverId) return;
        try {
            const res = await api.patch(`/bookings/${bookingId}/assign-driver`, { driverId });
            if (res && res.data) {
                setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
                alert('Driver assigned successfully');
            }
        } catch (error) {
            console.error('Failed to assign driver', error);
            alert(error.message || 'Failed to assign driver');
        }
    };

    const handleExport = async () => {
        try {
            let queryParams = new URLSearchParams();
            if (section.status) queryParams.append('status', section.status);
            if (section.range) queryParams.append('range', section.range);
            else if (range !== 'all') queryParams.append('range', range);
            if (section.paymentMethod) queryParams.append('paymentMethod', section.paymentMethod);
            if (searchTerm) queryParams.append('search', searchTerm);

            const res = await api.get(`/bookings/export?${queryParams.toString()}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bookings_${section.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export bookings');
        }
    };

    // Filter and search logic
    const filteredBookings = bookings; // Filtering now handled by API

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'assigned': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'enroute': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'arrived': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
            case 'started': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            case 'new': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={12} />;
            case 'confirmed': return <Clock size={12} />;
            case 'assigned': return <Clock size={12} className="animate-pulse" />;
            case 'enroute': return <Clock size={12} className="animate-pulse" />;
            case 'arrived': return <CheckCircle size={12} />;
            case 'started': return <CheckCircle size={12} />;
            case 'cancelled': return <XCircle size={12} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-left font-outfit">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif font-black text-black tracking-tight uppercase">{section.title}</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{section.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F7DC9D] hover:text-black transition-all shadow-lg active:scale-95"
                    >
                        <Download size={14} />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Planning Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: 'upcoming', label: 'Upcoming', icon: <Calendar size={12} /> },
                    { id: 'today', label: 'Today', icon: <Clock size={12} /> },
                    { id: 'tomorrow', label: 'Tomorrow', icon: <Calendar size={12} /> },
                    { id: 'unassigned', label: 'Unassigned', icon: <Sparkles size={12} /> },
                    { id: 'all', label: 'All History', icon: <Filter size={12} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setRange(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            range === tab.id 
                                ? 'bg-black text-[#F7DC9D] shadow-lg shadow-black/10' 
                                : 'bg-white text-gray-400 hover:text-black border border-black/5 hover:border-black/10'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-black/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F7DC9D] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Customer or Phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent focus:border-[#F7DC9D]/30 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-[#F7DC9D] transition-colors border border-transparent hover:border-[#F7DC9D]/10">
                        <Filter size={18} />
                    </button>
                    <select className="bg-gray-50 border border-transparent focus:border-[#F7DC9D]/30 rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer pr-10 relative">
                        <option>Sort By: Newest</option>
                        <option>Sort By: Oldest</option>
                        <option>Sort By: Amount</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5">Booking & Schedule</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5">Customer Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 text-center">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5">Driver / Dispatch</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-gray-400 font-medium">Loading bookings...</td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-gray-400 font-medium">No bookings found.</td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-black uppercase tracking-wider">{booking.bookingRef}</span>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                    booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                    booking.paymentStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                                } border`}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded-xl border border-black/5">
                                                <Calendar size={12} className="text-black" />
                                                <span className="text-[10px] font-black text-black uppercase">{booking.tripSummary.pickupDate}</span>
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                <Clock size={12} className="text-black" />
                                                <span className="text-[10px] font-black text-black uppercase">{booking.tripSummary.pickupTime}</span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold text-[#F7DC9D] italic">{booking.selectedVehicleCategory?.name || 'N/A'}</span>
                                                {booking.notificationCount > 0 && (
                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md border border-blue-100" title="Notifications sent">
                                                        <Bell size={10} />
                                                        <span className="text-[9px] font-black">{booking.notificationCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-black uppercase tracking-wider">{booking.customerInfo?.name || 'Guest'}</span>
                                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">{booking.customerInfo?.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-serif font-black text-black">₹{booking.fareDetails?.computedFare || '0'}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {['confirmed', 'assigned'].includes(booking.status) ? (
                                            <SmartDispatchPicker 
                                                booking={booking} 
                                                onAssign={(driverId) => handleAssignDriver(booking._id, driverId)} 
                                            />
                                        ) : booking.status === 'new' ? (
                                            <div className="flex flex-col items-center opacity-40">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">Confirm first</span>
                                            </div>
                                        ) : booking.assignedDriver ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-black uppercase tracking-tight">{booking.assignedDriver.name}</span>
                                                <span className="text-[9px] font-bold text-gray-400">{booking.assignedDriver.vehicleNumber}</span>
                                                <span className="text-[9px] font-bold text-gray-400">{booking.assignedDriver.phone}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Not Assignable</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center items-center gap-2">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="relative group/menu">
                                                <button className="p-2 text-gray-400 hover:text-black rounded-lg transition-all flex items-center gap-1 bg-gray-50 border border-transparent hover:border-gray-200">
                                                    <span className="text-[9px] font-black uppercase">Update</span>
                                                    <ChevronDown size={12} />
                                                </button>
                                                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-10 hidden group-hover/menu:block text-left">
                                                    {(STATUS_FLOW[booking.status] || []).map(st => (
                                                        <button 
                                                            key={st}
                                                            onClick={() => updateStatus(booking._id, st)}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
                                                        >
                                                            {st}
                                                        </button>
                                                    ))}
                                                    {STATUS_FLOW[booking.status]?.length === 0 && (
                                                        <div className="px-4 py-2 text-[9px] font-bold text-gray-400 uppercase italic">Final State</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedBookingForCase(booking);
                                                    setShowCreateCase(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" 
                                                title="Open Support Case"
                                            >
                                                <Shield size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setAuditBookingId(booking._id)}
                                                className="p-2 text-gray-400 hover:text-[#F7DC9D] hover:bg-[#F7DC9D]/10 rounded-lg transition-all" 
                                                title="View Audit Trail"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                {!loading && filteredBookings.length > 0 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-black/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredBookings.length} bookings</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-black/5 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-black transition-all">Prev</button>
                            <button className="px-4 py-2 bg-black text-white border border-black/5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {auditBookingId && (
                <BookingAuditModal 
                    bookingId={auditBookingId} 
                    onClose={() => setAuditBookingId(null)} 
                />
            )}

            {showCreateCase && (
                <CreateSupportCaseModal 
                    booking={selectedBookingForCase}
                    onClose={() => {
                        setShowCreateCase(false);
                        setSelectedBookingForCase(null);
                    }}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default AllBookings;
