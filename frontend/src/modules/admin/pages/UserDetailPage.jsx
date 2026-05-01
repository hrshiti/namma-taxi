import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    User as UserIcon,
    MapPin,
    Package,
    Heart,
    Bookmark,
    Clock,
    ShieldOff,
    ShieldCheck,
    ChevronRight,
    IndianRupee
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const fetchUserDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/customers/${id}`);
            if (res && res.data) {
                setUser(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch user details:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const handleToggleBlock = async () => {
        try {
            const newStatus = !user.isActive;
            await api.patch(`/customers/${id}`, { isActive: newStatus });
            setUser({ ...user, isActive: newStatus });
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const userOrders = user?.bookings || [];

    if (!user) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold text-gray-400">User Not Found</h2>
                <button onClick={() => navigate('/admin/users')} className="mt-4 text-primary font-bold hover:underline underline-offset-4 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Back to Users
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">User Profile</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Detailed overview of customer #{user.id?.slice(-6)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleToggleBlock}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${!user.isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white'
                            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white'
                            }`}
                    >
                        {!user.isActive ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                        {!user.isActive ? 'Restore Account' : 'Suspend Account'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card & Addresses */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center text-center text-left">
                            <div className="w-24 h-24 bg-gray-50 text-footerBg rounded-[2rem] flex items-center justify-center font-black text-3xl border-2 border-gray-100 mb-4">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <h2 className="text-2xl font-black text-footerBg">{user.name || 'Anonymous User'}</h2>
                            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">Super Customer</p>

                            <div className="w-full h-px bg-gray-50 my-8"></div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-footerBg">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                        <p className="text-sm font-bold text-footerBg">{user.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Member Since</p>
                                        <p className="text-sm font-bold text-footerBg">
                                            {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Addresses */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" />
                            Saved Addresses
                        </h3>
                        {user.addresses?.length > 0 ? (
                            <div className="space-y-4">
                                {user.addresses.map((addr, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-gray-200">
                                                {addr.type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                            {addr.address}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-gray-400 text-center py-4 uppercase tracking-widest">No addresses saved</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Order History & Interests */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Total Rides', value: user.rideCount || 0, icon: Car },
                            { label: 'Total Spent', value: `₹${(user.spentAmount || 0).toLocaleString()}`, icon: IndianRupee },
                            { label: 'Join Date', value: new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), icon: Calendar },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className={`bg-gray-50 text-footerBg p-3 rounded-2xl mb-3`}>
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-footerBg mt-0.5">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Package size={18} className="text-gray-400" />
                                Full Order History
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {userOrders.length > 0 ? userOrders.map((order) => (
                                <div key={order._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer text-left" onClick={() => navigate(`/admin/bookings/view/${order._id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-footerBg">#{order.bookingRef}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{(new Date(order.createdAt)).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-footerBg">₹{order.fareDetails?.computedFare || '0'}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{order.tripSummary?.serviceType}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-footerBg group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No orders found for this user</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
