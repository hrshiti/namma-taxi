import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Navigation, Clock, User, 
    Trash2, ListFilter, Calendar, ArrowRight, Download
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import api from '../../../../lib/api';

const SearchHistoryPage = ({ defaultCategory = '' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState(defaultCategory);

    const fetchHistories = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/search-history?category=${categoryFilter}`);
            if (res && res.data) {
                setHistories(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch search histories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistories();
    }, [categoryFilter]);

    useEffect(() => {
        setCategoryFilter(defaultCategory);
    }, [defaultCategory]);

    const handleDelete = async (id) => {
        if (window.confirm('Remove this search record?')) {
            try {
                await api.delete(`/search-history/${id}`);
                fetchHistories();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const filteredData = histories.filter(h => 
        h.pickup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.drop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        };
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 animate-in fade-in duration-500 font-sans text-left">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-4">
                <PageHeader 
                    title={`${categoryFilter === 'BANGALORE_AIRPORT' ? 'Airport' : 'Namma Taxi'} Search Intelligence`} 
                    subtitle="Analyze real-time demand and customer search patterns across the platform."
                />
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Filter by location or user..." 
                            className="pl-9 pr-4 py-2.5 bg-gray-50 border border-black/5 rounded-none text-[11px] font-bold focus:outline-none focus:border-black min-w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-black text-[#F7DC9D] hover:bg-zinc-800 transition-all shadow-md">
                        <Download size={16} />
                    </button>
                </div>
            </header>

            {/* Quick Stats Overlay (Optional but nice) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-black/5 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Search Events</p>
                    <p className="text-2xl font-black text-black">{histories.length}</p>
                </div>
                <div className="bg-white p-4 border border-black/5 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Today's Volume</p>
                    <p className="text-2xl font-black text-primary">High</p>
                </div>
                <div className="bg-white p-4 border border-black/5 shadow-sm col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Active Region</p>
                    <p className="text-2xl font-black text-black uppercase truncate">Bangalore Metropolitan</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-black/5">
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Journey Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Environment</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 w-[100px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Scanning Intelligence Logs...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono">End of stream. No matching records.</td></tr>
                            ) : filteredData.map(h => {
                                const { time, full } = formatDate(h.createdAt);
                                return (
                                    <tr key={h._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-black">{time}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{full}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.userId ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-black uppercase tracking-tight">{h.userId.name}</span>
                                                    <span className="text-[9px] font-bold text-primary">{h.userId.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">Anonymous User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col gap-1 max-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                                                        <span className="text-[11px] font-black text-black uppercase truncate">{h.pickup}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
                                                        <span className="text-[11px] font-black text-black uppercase truncate">{h.drop}</span>
                                                    </div>
                                                </div>
                                                <div className="hidden lg:flex items-center text-gray-300">
                                                    <ArrowRight size={16} />
                                                </div>
                                                <div className="hidden lg:block">
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                                                        h.category === 'BANGALORE_AIRPORT' ? 'border-primary/20 text-primary bg-primary/5' : 'border-black/5 text-gray-400 bg-gray-50'
                                                    }`}>
                                                        {h.category?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={10} className="text-gray-300" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[150px]">{h.device || 'WEB_BROWSER'}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-zinc-300">{h.ip || '0.0.0.0'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleDelete(h._id)} className="p-2 text-zinc-300 hover:text-red-600 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-black/5 rounded-none">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="pt-8 border-t border-black/5 flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Intelligence data is retained for 90 days.</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-[10px] font-black uppercase border border-black/10 hover:bg-gray-50 transition-colors">Prev</button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase bg-black text-white hover:bg-zinc-800 transition-colors">Next</button>
                </div>
            </footer>
        </div>
    );
};

export default SearchHistoryPage;
