import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Calendar, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../../lib/api';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications/my');
                if (res && res.data) {
                    setNotifications(res.data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getIcon = (eventKey) => {
        switch (eventKey) {
            case 'booking_created': return <Clock className="text-amber-500" size={18} />;
            case 'driver_assigned': return <Info className="text-blue-500" size={18} />;
            case 'payment_success': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'booking_cancelled': return <XCircle className="text-red-500" size={18} />;
            default: return <Bell className="text-primary" size={18} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="animate-slide-up px-6 pt-6 min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} className="text-obsidian" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-obsidian tracking-tight">Alerts</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Live Updates Center</p>
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-3 mb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Feed...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-gray-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-200" size={32} />
                        </div>
                        <h3 className="font-bold text-obsidian mb-1 text-left">No Alerts Yet</h3>
                        <p className="text-xs text-gray-400 text-left">We will notify you about your ride updates here.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif._id}
                            className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex gap-4 relative overflow-hidden group hover:border-primary/30 transition-all active:scale-[0.98]"
                        >
                            <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center`}>
                                {getIcon(notif.eventKey)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-[13px] text-obsidian uppercase tracking-tight">
                                        {notif.subject?.replace(' - ', ' // ') || 'ALERT_UPDATE'}
                                    </h4>
                                    <span className="text-[8px] font-bold text-gray-300 uppercase shrink-0 mt-0.5">
                                        {formatDate(notif.createdAt)}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                    {notif.messageBody}
                                </p>
                            </div>
                            
                            {/* Unread Indicator if status is queued/skipped (simulating for now) */}
                            {notif.status === 'queued' && (
                                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#F7DC9D]"></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer Tag */}
            <div className="fixed bottom-24 left-0 w-full flex justify-center pointer-events-none">
                <div className="bg-obsidian/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/50">
                    <p className="text-[7px] font-black text-obsidian/30 uppercase tracking-[0.5em]">Namma_Taxi_Realtime_v3.0</p>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
