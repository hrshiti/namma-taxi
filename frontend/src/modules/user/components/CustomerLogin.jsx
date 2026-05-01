import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const CustomerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            await api.post('/auth/customer/request-otp', { phone });
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!code || code.length < 4) {
            setError('Please enter a valid OTP');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await api.post('/auth/customer/verify-otp', { phone, code });
            if (res && res.data) {
                login(res.data.user, res.data.token);
                navigate('/user/profile');
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-slide-up px-6 pt-12 min-h-[60vh] flex flex-col justify-center">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-black mb-2">Login Required</h1>
                <p className="text-gray-400 text-xs mb-8">Access your profile, bookings, and addresses</p>

                {error && (
                    <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl mb-6 font-bold">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Phone Number</label>
                            <input 
                                type="tel" 
                                placeholder="Enter your 10-digit number"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending OTP...' : 'Get OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                        <p className="text-xs text-center font-bold text-gray-500">OTP sent to {phone}</p>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Enter OTP</label>
                            <input 
                                type="text" 
                                placeholder="123456 (Dev Mode)"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-center tracking-[0.5em] focus:outline-none focus:border-primary focus:bg-white transition-all"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-black p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="w-full bg-white text-gray-500 p-4 rounded-2xl font-bold text-[11px] hover:bg-gray-50 transition-all"
                        >
                            Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CustomerLogin;
