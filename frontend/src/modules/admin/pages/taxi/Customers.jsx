import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Mail, ChevronLeft, ChevronRight, ListFilter, User, Phone, Calendar, Loader2, Eye, UserX, UserCheck, ShieldCheck, ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../lib/api';

const Customers = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/customers?search=${searchTerm}`);
            if (res && res.data) {
                setCustomers(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/customers/${id}`, { isActive: !currentStatus });
            setCustomers(customers.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="p-1 md:p-3 bg-white min-h-screen font-inter animate-in fade-in duration-500 text-left">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
                .font-roboto { font-family: 'Roboto', sans-serif; }
                `}
            </style>

            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-[22px] font-black text-black uppercase tracking-tight font-roboto">CUSTOMER LIST</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Managing Platform Users & Loyalty</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Registered</p>
                        <p className="text-xl font-black text-black">{loading ? '...' : customers.length}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <User className="text-black" size={24} />
                </div>
            </div>

            {/* Action Bar */}
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-full max-w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Name Email Number .." 
                            className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-none text-[13px] focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-gray-50/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchCustomers}
                        className="px-8 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-[14px] rounded-none transition-all uppercase tracking-tight shadow-lg"
                    >
                        Search
                    </button>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 mr-1">
                    <button className="text-[#F9A825] hover:scale-110 transition-transform active:scale-95" title="Bulk Email Dispatch">
                        <div className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                            <Mail size={18} fill="#F9A825" className="text-white" />
                        </div>
                    </button>
                    <button className="hover:scale-110 transition-transform active:scale-95 group" title="New Manual Customer">
                        <div className="w-10 h-10 bg-gradient-to-br from-black to-zinc-800 rounded-full flex items-center justify-center shadow-xl border border-white/10">
                            <PlusCircle size={28} className="text-[#F7DC9D] group-hover:scale-110 transition-transform" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Customer Table */}
            <div className="border border-gray-200 rounded-none overflow-hidden overflow-x-auto bg-white shadow-sm">
                <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-[#FDFDFD] border-b border-gray-200">
                            <th className="px-4 py-4 text-left text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200 w-[70px]">Sr No.</th>
                            <th className="px-4 py-4 text-left text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200">Customer Identity</th>
                            <th className="px-4 py-4 text-left text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200">Contact Channels</th>
                            <th className="px-4 py-4 text-center text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200 w-[120px]">Rides</th>
                            <th className="px-4 py-4 text-left text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200 w-[150px]">Verification</th>
                            <th className="px-4 py-4 text-left text-[11px] font-black text-black uppercase tracking-widest border-r border-gray-200">Enrollment Date</th>
                            <th className="px-4 py-4 text-right text-[11px] font-black text-black uppercase tracking-widest">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-black" size={32} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing User Ledger...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-20 text-center text-gray-400 italic font-medium">No customers found matching your criteria.</td>
                            </tr>
                        ) : customers.map((item, index) => (
                            <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-4 py-4 text-[12px] font-black text-gray-400 border-r border-gray-200">{index + 1}</td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black text-xs shadow-lg overflow-hidden shrink-0">
                                            {item.profileImage ? (
                                                <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                item.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-black uppercase tracking-tight group-hover:text-footerBg transition-colors">{item.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UID: {item._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-600">{item.email || 'NO_EMAIL'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} className="text-gray-400" />
                                            <span className="text-[12px] font-black text-black tracking-tighter">{item.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-[14px] font-black text-black border-r border-gray-200 text-center bg-gray-50/30">
                                    {item.rideCount || 0}
                                </td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <span className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest
                                        ${item.isPhoneVerified !== false ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}
                                    >
                                        {item.isPhoneVerified !== false ? 'Verified' : 'Pending'}
                                    </span>
                                    <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Platform Auth</p>
                                </td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-gray-400" />
                                        <p className="text-[11px] font-black text-gray-500 uppercase">
                                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{(new Date(item.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => navigate(`/admin/users/view/${item._id}`)}
                                            className="p-2 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                            title="Inspect Profile"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(item._id, item.isActive !== false)}
                                            className={`p-2 rounded-lg transition-all ${item.isActive !== false ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                                            title={item.isActive !== false ? 'Suspend Account' : 'Restore Account'}
                                        >
                                            {item.isActive !== false ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Copyright */}
            <div className="mt-12 text-center text-[10px] font-bold text-gray-300 py-6 border-t border-gray-50 uppercase tracking-[0.4em]">
                NAMMA TAXI • CUSTOMER RELATIONS LEDGER
            </div>
        </div>
    );
};

export default Customers;
