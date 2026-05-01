import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    ClipboardList,
    Clock,
    Banknote,
    Car,
    AlertTriangle,
    Shield,
    AlertCircle
} from 'lucide-react';
import api from '../../../lib/api';
import socket from '../../../lib/socket';

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d');

    useEffect(() => {
        const fetchDashboardData = async (isSilent = false) => {
            try {
                if (!isSilent) setLoading(true);
                const res = await api.get(`/analytics/dashboard-summary?range=${range}`);
                if (res && res.data) {
                    setData(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                if (!isSilent) setLoading(false);
            }
        };

        fetchDashboardData();

        // Socket listeners for real-time updates
        const handleUpdate = () => fetchDashboardData(true);
        socket.on('booking_created', handleUpdate);
        socket.on('booking_updated', handleUpdate);
        socket.on('booking_cancelled', handleUpdate);

        return () => {
            socket.off('booking_created', handleUpdate);
            socket.off('booking_updated', handleUpdate);
            socket.off('booking_cancelled', handleUpdate);
        };
    }, [range]);

    const stats = useMemo(() => {
        if (!data) return [];

        return [
            {
                label: 'Gross Revenue',
                value: `₹${(data.revenue?.gross || 0).toLocaleString()}`,
                icon: Banknote,
                color: 'text-emerald-600',
                trend: range === 'all' ? 'All Time' : `Last ${range}`
            },
            {
                label: 'Net Realized',
                value: `₹${(data.revenue?.net || 0).toLocaleString()}`,
                icon: Banknote,
                color: 'text-footerBg',
                trend: 'After Refunds'
            },
            {
                label: 'Total Bookings',
                value: data.bookings?.total || 0,
                icon: ClipboardList,
                color: 'text-blue-600',
                trend: range === 'all' ? 'Volume' : `New (${range})`
            },
            {
                label: 'Active Drivers',
                value: `${data.drivers?.available || 0} / ${data.drivers?.total || 0}`,
                icon: Car,
                color: 'text-purple-600',
                trend: 'Available'
            },
            {
                label: 'Upcoming Unassigned',
                value: data.planning?.unassignedUpcoming || 0,
                icon: Clock,
                color: 'text-amber-600',
                trend: 'Needs Action'
            },
            {
                label: 'Late / Attention',
                value: data.planning?.late || 0,
                icon: AlertTriangle,
                color: 'text-red-600',
                trend: 'Past Pickup'
            }
        ];
    }, [data, range]);

    return (
        <div className="space-y-10 font-outfit text-left">
            {/* Header with Range Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Taxi Analytics Dashboard</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Real-time performance overview of Namma Taxi</p>
                </div>
                <div className="flex gap-2">
                    {['today', '7d', '30d', 'all'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === r
                                    ? 'bg-black text-[#F7DC9D]'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-gray-200 transition-all group relative text-left">
                        <div className="flex items-center justify-between mb-6">
                            <stat.icon size={22} className={stat.color} strokeWidth={2.5} />
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${stat.trend === 'Live' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                } uppercase tracking-tight`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-footerBg mt-1">{loading ? '...' : stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Operational Alert Health Strip */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-wrap gap-12 items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-50 rounded-2xl">
                        <AlertCircle className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-black uppercase tracking-tight">System Health</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Active operational alerts</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Critical</span>
                        <h4 className={`text-2xl font-black ${data?.alerts?.critical > 0 ? 'text-red-600' : 'text-black'}`}>
                            {loading ? '...' : data?.alerts?.critical || 0}
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">High/Med</span>
                        <h4 className="text-2xl font-black text-black">
                            {loading ? '...' : (data?.alerts?.high || 0) + (data?.alerts?.medium || 0)}
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Active</span>
                        <h4 className="text-2xl font-black text-black">
                            {loading ? '...' : data?.alerts?.total || 0}
                        </h4>
                    </div>
                </div>

                <Link to="/admin/alerts" className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">
                    Manage Alerts
                </Link>
            </div>

            {/* Finance Health Strip */}
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-wrap gap-12 items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Realized Profit</span>
                    <h4 className="text-2xl font-black text-black">
                        {loading ? '...' : `₹${(data?.finance?.realizedNet || 0).toLocaleString()}`}
                    </h4>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase mt-1">Post Payouts & Refunds</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payout Liability</span>
                    <h4 className="text-2xl font-black text-black">
                        {loading ? '...' : `₹${(data?.finance?.pendingLiability || 0).toLocaleString()}`}
                    </h4>
                    <span className="text-[8px] font-bold text-amber-500 uppercase mt-1">Pending Driver Earnings</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recon Exceptions</span>
                    <div className="flex items-center gap-2">
                        <h4 className={`text-2xl font-black ${data?.finance?.exceptionCount > 0 ? 'text-red-500' : 'text-black'}`}>
                            {loading ? '...' : data?.finance?.exceptionCount || 0}
                        </h4>
                        {data?.finance?.exceptionCount > 0 && <AlertTriangle size={16} className="text-red-500" />}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Requires Audit Attention</span>
                </div>
                <Link to="/admin/reconciliation" className="px-6 py-3 bg-black text-[#F7DC9D] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                    Full Reconciliation
                </Link>
            </div>

            {/* Support Health Strip */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-wrap gap-12 items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                        <Shield className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-black uppercase tracking-tight">Support Health</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Active operational cases</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Open Cases</span>
                        <h4 className="text-2xl font-black text-black">
                            {loading ? '...' : data?.support?.open || 0}
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stale (&gt;48h)</span>
                        <div className="flex items-center gap-2">
                            <h4 className={`text-2xl font-black ${data?.support?.stale > 0 ? 'text-red-500' : 'text-black'}`}>
                                {loading ? '...' : data?.support?.stale || 0}
                            </h4>
                            {data?.support?.stale > 0 && <AlertTriangle size={16} className="text-red-500" />}
                        </div>
                    </div>
                </div>

                <Link to="/admin/support" className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                    Manage Support
                </Link>
            </div>

            {/* Action Widgets Section */}
            <div className="grid grid-cols-1 gap-8 text-left">
                {/* Recent Bookings Widget */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-black text-footerBg uppercase tracking-tight">Recent Booking Queue</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Last 10 customer ride requests</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking Ref</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Details</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fare</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-8 text-center text-gray-400 font-medium">Loading recent bookings...</td></tr>
                                ) : !data?.recentBookings || data.recentBookings.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-8 text-center text-gray-400 font-medium">No bookings yet.</td></tr>
                                ) : data.recentBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-footerBg text-xs">{booking.bookingRef}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{(new Date(booking.createdAt)).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-footerBg text-xs">{booking.customerInfo?.name || 'Guest User'}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{booking.customerInfo?.phone || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-footerBg text-xs uppercase">{booking.tripSummary?.serviceType}</p>
                                            <p className="text-[9px] text-[#F7DC9D] font-bold uppercase mt-1">{booking.tripSummary?.tripMode}</p>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <p className="font-black text-footerBg text-xs">₹{booking.fareDetails?.computedFare || '0'}</p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                        'bg-blue-50 text-blue-600'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
