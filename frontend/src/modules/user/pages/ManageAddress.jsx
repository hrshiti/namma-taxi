import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Briefcase, Plus, Trash2, Edit3, Navigation, ChevronLeft, Map } from 'lucide-react';
import api from '../../../lib/api';

const ManageAddress = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isAdding, setIsAdding] = useState(false);
    const [newAddr, setNewAddr] = useState({ type: '', address: '' });
    const [editId, setEditId] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/addresses');
            setAddresses(res.data || []);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(addresses.filter(a => a._id !== id));
        } catch (err) {
            console.error('Failed to delete address:', err);
            alert('Failed to delete address');
        }
    };

    const handleAdd = async () => {
        if (!newAddr.type || !newAddr.address) {
            alert('Please fill all fields');
            return;
        }
        try {
            const res = await api.post('/addresses', newAddr);
            setAddresses([res.data, ...addresses]);
            setNewAddr({ type: '', address: '' });
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to add address:', err);
            alert('Failed to add address');
        }
    };

    const handleUpdate = async (id, text) => {
        if (!text) return;
        try {
            const res = await api.patch(`/addresses/${id}`, { address: text });
            setAddresses(addresses.map(a => a._id === id ? res.data : a));
            setEditId(null);
        } catch (err) {
            console.error('Failed to update address:', err);
            alert('Failed to update address');
        }
    };

    const handleUseCurrentLocation = () => {
        if ("geolocation" in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                            headers: { 'User-Agent': 'NammaTaxiApp/1.0' }
                        });
                        const data = await response.json();
                        
                        if (data && data.display_name) {
                            setNewAddr(prev => ({ ...prev, address: data.display_name }));
                        } else {
                            alert('Could not fetch address for this location.');
                        }
                    } catch (err) {
                        console.error("Geocoding error:", err);
                        alert('Error fetching address.');
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Location error:", error);
                    alert('Permission denied or location unavailable.');
                    setIsLocating(false);
                }
            );
        }
    };

    const getIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('home')) return <Home size={20} />;
        if (t.includes('work') || t.includes('office')) return <Briefcase size={20} />;
        return <MapPin size={20} />;
    };

    return (
        <div className="animate-slide-up px-6 pt-6 pb-32 min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} className="text-obsidian" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-obsidian tracking-tight">Saved Places</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Manage Your Destinations</p>
                </div>
            </div>

            {/* Address List */}
            <div className="space-y-4 mb-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Fetching Addresses...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-gray-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Map className="text-gray-200" size={32} />
                        </div>
                        <h3 className="font-bold text-obsidian mb-1">No Saved Addresses</h3>
                        <p className="text-xs text-gray-400 px-4">Save your home, office or frequent spots for faster booking.</p>
                    </div>
                ) : (
                    addresses.map(item => (
                        <div key={item._id} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex gap-4 animate-scale-in group hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-[13px] text-obsidian uppercase tracking-tight truncate pr-2">{item.type}</h3>
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setEditId(item._id)}
                                            className="text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                {editId === item._id ? (
                                    <div className="mt-2">
                                        <input 
                                            autoFocus
                                            className="text-[11px] font-medium border-b-2 border-primary w-full outline-none py-1 bg-primary/5 px-2 rounded-t-lg"
                                            defaultValue={item.address}
                                            onBlur={(e) => handleUpdate(item._id, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item._id, e.target.value)}
                                        />
                                        <p className="text-[8px] font-black text-primary uppercase mt-1 ml-1">Press Enter to save</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed mt-0.5 line-clamp-2">{item.address}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add New Section */}
            {isAdding ? (
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-primary/20 space-y-4 mb-8 animate-slide-up">
                    <div className="relative">
                        <input 
                            placeholder="Type (e.g. Home, Office, Gym)" 
                            className="form-input text-xs font-bold"
                            value={newAddr.type}
                            onChange={e => setNewAddr({ ...newAddr, type: e.target.value })}
                        />
                        <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1">Label</span>
                    </div>
                    
                    <button 
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-4 py-3 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all disabled:opacity-50 w-full justify-center"
                    >
                        <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        {isLocating ? 'Locating...' : 'Use Current Location'}
                    </button>

                    <div className="relative">
                        <textarea 
                            placeholder="Full address details..." 
                            className="form-input text-xs font-medium min-h-[100px] py-4"
                            value={newAddr.address}
                            onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
                        />
                        <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1">Address Details</span>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleAdd} 
                            className="primary-btn text-[10px] py-4 flex-1 shadow-lg shadow-primary/20"
                        >
                            Save Location
                        </button>
                        <button 
                            onClick={() => setIsAdding(false)} 
                            className="flex-1 bg-gray-50 text-gray-400 font-black text-[10px] uppercase rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[32px] flex items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-95 group"
                >
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Plus size={18} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-[0.2em]">Add New Place</span>
                </button>
            )}

            {/* Float Badge */}
            <div className="fixed bottom-24 left-0 w-full flex justify-center pointer-events-none">
                <div className="bg-obsidian/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/50">
                    <p className="text-[7px] font-black text-obsidian/30 uppercase tracking-[0.5em]">Address_Manager_v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default ManageAddress;
