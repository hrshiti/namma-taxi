import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user: customer, logout: logoutCustomer } = useAuth();
    
    // Fallback if somehow rendered without customer (should not happen with ProtectedRoute)
    if (!customer) return null;

    const menuItems = [
        { id: 'edit', title: 'Edit Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: '/user/edit-profile' },
        { id: 'address', title: 'Manage Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', path: '/user/manage-address' },
        { id: 'support', title: 'Help & Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', path: '/user/support' },
        { id: 'terms', title: 'Terms & Conditions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/user/terms' },
        { id: 'privacy', title: 'Privacy Policy', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/user/privacy' },
        { id: 'logout', title: 'Logout', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', color: 'text-red-500', path: '/' }
    ];

    return (
        <div className="animate-slide-up px-6 pt-6">
            <h1 className="text-2xl font-black mb-8">My Profile</h1>
            
            <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-[32px] shadow-sm">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-white shadow-sm flex items-center justify-center text-primary font-black text-xl uppercase overflow-hidden">
                    {customer.profileImage ? (
                        <img src={customer.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>{customer.name?.[0] || 'U'}</span>
                    )}
                </div>
                <div>
                    <h2 className="font-extrabold text-lg leading-tight capitalize">{customer.name}</h2>
                    <p className="text-gray-400 text-xs font-medium">{customer.email || customer.phone}</p>
                    <p className="text-primary text-[10px] font-black mt-1 uppercase">Gold Member</p>
                </div>
            </div>

            <div className="space-y-3 mb-10">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Account Settings</h3>
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
                    {menuItems.map((item, index) => (
                        <button 
                            key={item.id} 
                            onClick={() => {
                                if (item.id === 'logout') {
                                    logoutCustomer();
                                    navigate('/');
                                } else if (item.path !== '#') {
                                    navigate(item.path);
                                }
                            }}
                            className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl ${item.color ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'} flex items-center justify-center`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <span className={`font-bold text-sm ${item.color || 'text-gray-700'}`}>{item.title}</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-obsidian rounded-[32px] p-6 text-white mb-32">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">Contact Information</h4>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed opacity-80 italic">Manage your saved addresses in Account Settings</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div className="text-[11px] font-medium opacity-80">
                            <p>{customer.phone}</p>
                            <p className="opacity-50 italic text-[9px]">Primary Contact</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <div className="text-[11px] font-medium opacity-80">
                            <p>{customer.email || 'No email provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
