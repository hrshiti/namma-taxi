import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Plane, MapPin, Navigation, Phone, Mail, Clock } from 'lucide-react';

const AirportInfo = () => {
    const [distances, setDistances] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAirportData = async () => {
            try {
                const [distRes, routeRes, contactRes] = await Promise.all([
                    api.get('/airport?type=DISTANCE'),
                    api.get('/airport?type=ROUTE'),
                    api.get('/airport?type=CONTACT')
                ]);
                setDistances(distRes.data || []);
                setRoutes(routeRes.data || []);
                setContacts(contactRes.data || []);
            } catch (error) {
                console.error('Failed to fetch airport data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAirportData();
    }, []);

    return (
        <div className="animate-slide-up bg-gray-50 min-h-screen pb-32">
            {/* Hero Section */}
            <div className="bg-obsidian text-white px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Bangalore Airport <span className="text-primary">Taxi Guide</span></h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-[250px] leading-relaxed">
                        Real-time rates, popular routes, and 24/7 terminal support.
                    </p>
                </div>
                <Plane className="absolute -right-10 top-10 text-white/5 w-64 h-64 -rotate-12" />
            </div>

            {/* Quick Action */}
            <div className="px-6 -mt-10">
                <button 
                    onClick={() => navigate('/user')}
                    className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-[32px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Plane size={18} /> Book Airport Taxi Now
                </button>
            </div>

            <div className="px-6 py-10 space-y-12 text-left">
                {/* Popular Routes */}
                <section>
                    <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-6 border-l-4 border-primary pl-4">Popular Transfers</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[24px] animate-pulse"></div>) : 
                        routes.map(route => (
                            <div key={route._id} className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-black text-obsidian uppercase tracking-tight">{route.content.name}</h3>
                                    <span className="text-primary font-black text-sm">₹{route.content.price}*</span>
                                </div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase leading-relaxed">{route.content.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Rates & Distances */}
                <section>
                    <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-6 border-l-4 border-primary pl-4">Standard Rate Card</h2>
                    <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100/50 border-b border-black/5">
                                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">Destination</th>
                                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Est. Dist</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {loading ? [1, 2, 3, 4].map(i => <tr key={i}><td colSpan="2" className="px-6 py-4 h-12 animate-pulse"></td></tr>) : 
                                distances.map(dist => (
                                    <tr key={dist._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-obsidian uppercase">{dist.content.pickup} <span className="text-gray-300">→</span> {dist.content.drop}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[10px] font-bold text-gray-400">{dist.content.distance} KM</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Airport Contacts */}
                <section>
                    <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-6 border-l-4 border-primary pl-4">24/7 Terminal Support</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {loading ? [1, 2].map(i => <div key={i} className="h-20 bg-white rounded-[24px] animate-pulse"></div>) : 
                        contacts.map(contact => (
                            <div key={contact._id} className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col items-center text-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    {contact.content.type === 'PHONE' ? <Phone size={14} /> : <Mail size={14} />}
                                </div>
                                <span className="text-[9px] font-black uppercase text-gray-400">{contact.content.label}</span>
                                <a href={contact.content.type === 'PHONE' ? `tel:${contact.content.value}` : `mailto:${contact.content.value}`} className="text-[11px] font-black text-obsidian break-all">
                                    {contact.content.value}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AirportInfo;
