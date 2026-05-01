import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import DriverLogin from './pages/DriverLogin';
import DriverBookings from './pages/DriverBookings';
import DriverBookingDetail from './pages/DriverBookingDetail';
import DriverEarnings from './pages/DriverEarnings';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Wallet, LogOut } from 'lucide-react';

const DriverModule = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-outfit">
      <div className="w-12 h-12 border-4 border-[#F7DC9D] border-t-black rounded-full animate-spin" />
    </div>
  );

  // If not logged in as driver, only allow login page
  if (!user || user.role !== 'driver') {
    return (
      <Routes>
        <Route path="login" element={<DriverLogin />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  // Driver is logged in
  return (
    <div className="min-h-screen bg-gray-50 font-outfit flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-black text-white p-5 sticky top-0 z-[100] flex justify-between items-center shadow-2xl">
        <div className="flex flex-col">
          <span className="font-serif font-black tracking-tighter uppercase text-xl text-[#F7DC9D]">Namma Driver</span>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Operational Portal</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-white leading-none mb-1">{user.name}</span>
              <span className="text-[8px] font-bold text-[#F7DC9D] uppercase tracking-widest leading-none">Online</span>
            </div>
            <button onClick={() => logout()} className="p-2 bg-white/10 rounded-lg hover:bg-red-500 transition-colors">
              <LogOut size={16} />
            </button>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <div className="flex-1 p-4 pb-32">
        <Routes>
          <Route path="bookings" element={<DriverBookings />} />
          <Route path="booking/:id" element={<DriverBookingDetail />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="/" element={<Navigate to="bookings" replace />} />
          <Route path="*" element={<Navigate to="bookings" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation (Floating Style) */}
      <div className="fixed bottom-6 left-6 right-6 z-[100]">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-[2.5rem] flex justify-around items-center shadow-2xl">
            <NavLink 
              to="/driver/bookings" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all px-8 py-2 rounded-2xl ${isActive ? 'bg-[#F7DC9D] text-black scale-105' : 'text-gray-500'}`}
            >
              <ClipboardList size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Rides</span>
            </NavLink>
            <NavLink 
              to="/driver/earnings" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all px-8 py-2 rounded-2xl ${isActive ? 'bg-[#F7DC9D] text-black scale-105' : 'text-gray-500'}`}
            >
              <Wallet size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Earnings</span>
            </NavLink>
          </div>
      </div>
    </div>
  );
};

export default DriverModule;
