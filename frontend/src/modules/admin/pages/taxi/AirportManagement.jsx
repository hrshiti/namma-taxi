import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, Save, X, Loader2, 
    MapPin, Navigation, Phone, Clock, Mail, Info
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import api from '../../../../lib/api';

const AirportManagement = ({ defaultTab = 'DISTANCE' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        type: activeTab,
        from: '',
        to: '',
        distance: '',
        duration: '',
        priceStart: '',
        description: '',
        department: '',
        phone: '',
        email: '',
        hours: ''
    });

    const tabs = [
        { id: 'DISTANCE', label: 'Distances', icon: MapPin },
        { id: 'ROUTE', label: 'Popular Routes', icon: Navigation },
        { id: 'CONTACT', label: 'Support Contacts', icon: Phone }
    ];

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/airport?type=${activeTab}`);
            if (res && res.data) {
                setItems(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch airport data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item._id);
            setFormData(item);
        } else {
            setEditingId(null);
            setFormData({
                type: activeTab,
                from: '',
                to: '',
                distance: '',
                duration: '',
                priceStart: '',
                description: '',
                department: '',
                phone: '',
                email: '',
                hours: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (editingId) {
                await api.patch(`/airport/${editingId}`, formData);
            } else {
                await api.post('/airport', formData);
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            alert('Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/airport/${id}`);
                fetchItems();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 animate-in fade-in duration-500 font-sans text-left">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-4">
                <PageHeader 
                    title="Bangalore Airport Management" 
                    subtitle="Control center for distances, routes, and emergency contacts."
                />
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-[#F7DC9D] rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                >
                    <Plus size={16} strokeWidth={3} />
                    Create New Entry
                </button>
            </header>

            {/* Tabs Selector */}
            <div className="flex bg-gray-100 p-1 rounded-none border border-black/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-black text-[#F7DC9D] shadow-md' : 'text-gray-400 hover:text-black'
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-black/5">
                                {activeTab === 'DISTANCE' && (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Departure</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Arrival</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Range</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                    </>
                                )}
                                {activeTab === 'ROUTE' && (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Route Path</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Pricing Starts</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Overview</th>
                                    </>
                                )}
                                {activeTab === 'CONTACT' && (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Department</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol Contact</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Hours</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Database...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No entries found for this category</td></tr>
                            ) : items.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                    {activeTab === 'DISTANCE' && (
                                        <>
                                            <td className="px-6 py-4 text-[12px] font-black text-black uppercase">{item.from}</td>
                                            <td className="px-6 py-4 text-[12px] font-black text-black uppercase">{item.to}</td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase">{item.distance} KM</td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase">{item.duration} MIN</td>
                                        </>
                                    )}
                                    {activeTab === 'ROUTE' && (
                                        <>
                                            <td className="px-6 py-4 text-[12px] font-black text-black uppercase tracking-tight">{item.from} ➔ {item.to}</td>
                                            <td className="px-6 py-4 text-[12px] font-black text-primary uppercase">From {item.priceStart}</td>
                                            <td className="px-6 py-4 text-[11px] text-gray-400 font-medium line-clamp-1 mt-3 italic">{item.description}</td>
                                        </>
                                    )}
                                    {activeTab === 'CONTACT' && (
                                        <>
                                            <td className="px-6 py-4 text-[12px] font-black text-black uppercase tracking-tight">{item.department}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-black text-black">{item.phone}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-gray-50/50">{item.hours}</td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-black transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-black/5">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-300 hover:text-red-600 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-black/5">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl relative z-10 shadow-2xl animate-in zoom-in duration-200 border border-black/10">
                        <div className="bg-black p-4 flex items-center justify-between">
                            <h2 className="text-[#F7DC9D] text-[12px] font-black uppercase tracking-[0.2em]">{editingId ? 'Modify Record' : 'Initial Registration'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {activeTab === 'DISTANCE' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Departure Point</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="CITY CENTER..." value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Arrival Point</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="AIRPORT T1..." value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Distance (KM)</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="35..." value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Estimated Time</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="45 MINS..." value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ROUTE' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Start Location</label>
                                            <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">End Location</label>
                                            <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Base Price Start</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="₹1200..." value={formData.priceStart} onChange={e => setFormData({...formData, priceStart: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Short Description</label>
                                        <textarea required rows="2" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[10px] font-bold focus:outline-none focus:border-black resize-none" placeholder="RELIABLE DROP SERVICES FOR ALL TERMINALS..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'CONTACT' && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Department / Office</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="AIRPORT OPERATIONS..." value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Hotline Phone</label>
                                            <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black focus:outline-none focus:border-black" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Email Support</label>
                                            <input required type="email" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black focus:outline-none focus:border-black" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Service Hours</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 border border-black/5 rounded-none text-[11px] font-black uppercase focus:outline-none focus:border-black" placeholder="24/7 AVAILABILITY..." value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full py-4 bg-black text-[#F7DC9D] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {editingId ? 'COMMIT_REVISION' : 'INITIALIZE_PUBLISH'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirportManagement;
