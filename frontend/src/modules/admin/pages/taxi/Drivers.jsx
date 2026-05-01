import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, ChevronLeft, ChevronRight, ListFilter, UserPlus, Phone, CreditCard, Calendar, Edit, X, Banknote, IndianRupee, BarChart3 } from 'lucide-react';
import api from '../../../../lib/api';

const Drivers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [vehicleCategories, setVehicleCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    
    const initialDriverState = {
        name: '',
        phone: '',
        email: '',
        licenseNumber: '',
        vehicleNumber: '',
        vehicleCategoryId: '',
        status: 'available',
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            upiId: ''
        }
    };

    const [newDriver, setNewDriver] = useState(initialDriverState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [driversRes, categoriesRes] = await Promise.all([
                api.get('/drivers'),
                api.get('/vehicle-categories')
            ]);
            
            if (driversRes && driversRes.data) setDrivers(driversRes.data);
            if (categoriesRes && categoriesRes.data) setVehicleCategories(categoriesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', newDriver);
            setShowAddModal(false);
            setNewDriver(initialDriverState);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to add driver');
        }
    };

    const handleEditDriver = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/drivers/${selectedDriver._id}`, selectedDriver);
            setShowEditModal(false);
            setSelectedDriver(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to update driver');
        }
    };

    const openEditModal = (driver) => {
        setSelectedDriver({
            ...driver,
            bankDetails: driver.bankDetails || initialDriverState.bankDetails
        });
        setShowEditModal(true);
    };

    const toggleStatus = async (id, currentIsActive) => {
        try {
            await api.patch(`/drivers/${id}`, { isActive: !currentIsActive });
            fetchData();
        } catch {
            alert('Failed to update status');
        }
    };

    const handleViewEarnings = (driver) => {
        setSelectedDriver(driver);
        setShowEarningsModal(true);
    };

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm) ||
        d.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const BankDetailsForm = ({ data, setData }) => (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                <Banknote size={12} /> Payout Bank Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <input 
                        type="text" 
                        placeholder="Account Holder Name" 
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        value={data.bankDetails.accountHolderName}
                        onChange={e => setData({...data, bankDetails: {...data.bankDetails, accountHolderName: e.target.value}})}
                    />
                </div>
                <input 
                    type="text" 
                    placeholder="Account Number" 
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    value={data.bankDetails.accountNumber}
                    onChange={e => setData({...data, bankDetails: {...data.bankDetails, accountNumber: e.target.value}})}
                />
                <input 
                    type="text" 
                    placeholder="IFSC Code" 
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    value={data.bankDetails.ifscCode}
                    onChange={e => setData({...data, bankDetails: {...data.bankDetails, ifscCode: e.target.value}})}
                />
                <input 
                    type="text" 
                    placeholder="Bank Name" 
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    value={data.bankDetails.bankName}
                    onChange={e => setData({...data, bankDetails: {...data.bankDetails, bankName: e.target.value}})}
                />
                <input 
                    type="text" 
                    placeholder="UPI ID (Optional)" 
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    value={data.bankDetails.upiId}
                    onChange={e => setData({...data, bankDetails: {...data.bankDetails, upiId: e.target.value}})}
                />
            </div>
        </div>
    );

    return (
        <div className="p-1 md:p-3 bg-white min-h-screen font-inter animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-[22px] font-black text-black uppercase tracking-tight font-roboto">FLEET MANAGEMENT</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Manage Drivers & Bank Payouts</p>
            </div>

            <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-full max-w-[320px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Drivers..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:border-black transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-black text-[#F7DC9D] px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                >
                    <PlusCircle size={16} /> Add Driver
                </button>
            </div>

            <div className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                <table className="w-full border-collapse min-w-[1000px] text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Sr.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Driver / ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">License & Vehicle</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Payout Info</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Refreshing fleet...</td></tr>
                        ) : filteredDrivers.length === 0 ? (
                            <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No drivers registered</td></tr>
                        ) : filteredDrivers.map((item, index) => (
                            <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-[12px] font-bold text-gray-400">{index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black text-[#F7DC9D] rounded-xl flex items-center justify-center font-black text-sm">
                                            {item.name[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-black uppercase">{item.name}</span>
                                            <span className="text-[9px] font-bold text-gray-400">{item.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-[#E53935] uppercase">{item.vehicleNumber}</span>
                                        <span className="text-[9px] text-gray-400 font-bold">LIC: {item.licenseNumber}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.bankDetails?.accountNumber ? (
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <CreditCard size={14} />
                                            <span className="text-[10px] font-black uppercase">Linked</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-amber-500 uppercase italic opacity-50">Missing Bank Info</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                        ${item.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-3">
                                        <button 
                                            onClick={() => handleViewEarnings(item)}
                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="View Detailed Earnings"
                                        >
                                            <IndianRupee size={16} />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(item)}
                                            className="p-2 text-gray-400 hover:text-black transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => toggleStatus(item._id, item.isActive)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.isActive ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                        >
                                            {item.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        <div className="bg-black p-8 text-[#F7DC9D] flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{showEditModal ? 'Edit Driver' : 'Register New Driver'}</h2>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Fleet Profile & Payout Setup</p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-white/40 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={showEditModal ? handleEditDriver : handleAddDriver} className="p-8 space-y-6 overflow-y-auto">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <input required type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm" 
                                            value={showEditModal ? selectedDriver.name : newDriver.name} 
                                            onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, name: e.target.value}) : setNewDriver({...newDriver, name: e.target.value})} />
                                    </div>
                                    <input required type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm" 
                                        value={showEditModal ? selectedDriver.phone : newDriver.phone} 
                                        onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, phone: e.target.value}) : setNewDriver({...newDriver, phone: e.target.value})} />
                                    <input type="email" placeholder="Email (Optional)" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm" 
                                        value={showEditModal ? selectedDriver.email : newDriver.email} 
                                        onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, email: e.target.value}) : setNewDriver({...newDriver, email: e.target.value})} />
                                </div>
                                
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2 pt-4">Vehicle & License</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="text" placeholder="License Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm" 
                                        value={showEditModal ? selectedDriver.licenseNumber : newDriver.licenseNumber} 
                                        onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, licenseNumber: e.target.value}) : setNewDriver({...newDriver, licenseNumber: e.target.value})} />
                                    <input required type="text" placeholder="Vehicle Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm" 
                                        value={showEditModal ? selectedDriver.vehicleNumber : newDriver.vehicleNumber} 
                                        onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, vehicleNumber: e.target.value}) : setNewDriver({...newDriver, vehicleNumber: e.target.value})} />
                                    <div className="col-span-2">
                                        <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black text-sm appearance-none"
                                            value={showEditModal ? selectedDriver.vehicleCategoryId : newDriver.vehicleCategoryId}
                                            onChange={e => showEditModal ? setSelectedDriver({...selectedDriver, vehicleCategoryId: e.target.value}) : setNewDriver({...newDriver, vehicleCategoryId: e.target.value})}
                                        >
                                            <option value="" disabled>Select Vehicle Type</option>
                                            {vehicleCategories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2 pt-4">Bank Payout Details</h4>
                                <BankDetailsForm 
                                    data={showEditModal ? selectedDriver : newDriver} 
                                    setData={showEditModal ? setSelectedDriver : setNewDriver} 
                                />
                            </div>
                            
                            <button type="submit" className="w-full py-5 bg-black text-[#F7DC9D] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-[0.98] mt-4">
                                {showEditModal ? 'Save Profile Changes' : 'Register Driver'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showEarningsModal && (
                <DriverEarningsModal 
                    driver={selectedDriver} 
                    onClose={() => {
                        setShowEarningsModal(false);
                        setSelectedDriver(null);
                    }} 
                />
            )}

            <div className="mt-12 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest py-6 border-t border-gray-50">
                NAMMA TAXI FLEET OPERATIONS PANEL
            </div>
        </div>
    );
};

const DriverEarningsModal = ({ driver, onClose }) => {
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/drivers/earnings/all?driverId=${driver._id}`);
                if (res && res.data) {
                    setEarnings(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch earnings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, [driver._id]);

    const totalEarned = earnings.reduce((acc, curr) => acc + (curr.earningAmount || 0), 0);
    const pendingSettlement = earnings.filter(e => e.settlementStatus === 'pending').reduce((acc, curr) => acc + (curr.earningAmount || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
                <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Earnings Breakdown</h2>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1 italic">{driver.name} • {driver.vehicleNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Lifetime Earnings</p>
                            <h3 className="text-2xl font-black text-emerald-700">₹{totalEarned.toLocaleString()}</h3>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Pending Payout</p>
                            <h3 className="text-2xl font-black text-amber-700">₹{pendingSettlement.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Recent Payout Logs</h4>
                        {loading ? (
                            <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase animate-pulse tracking-widest">Polling Ledger...</div>
                        ) : earnings.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No earning records found</div>
                        ) : (
                            <div className="space-y-2">
                                {earnings.map((entry) => (
                                    <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${entry.settlementStatus === 'settled' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <IndianRupee size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-black uppercase tracking-tight">#{entry.bookingRef}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(entry.createdAt).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-black">₹{entry.earningAmount}</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${entry.settlementStatus === 'settled' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {entry.settlementStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-400">
                        <BarChart3 size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ledger Verified</span>
                    </div>
                    <button onClick={onClose} className="px-6 py-2 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all">
                        Close Audit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Drivers;
