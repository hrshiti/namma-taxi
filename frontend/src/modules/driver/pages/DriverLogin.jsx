import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import api from '../../../lib/api';

const DriverLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && user.role === 'driver') {
            navigate('/driver/bookings');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/driver/login', { phone, password });
            if (res && res.data) {
                login(res.data.user, res.data.token);
                navigate('/driver/bookings');
            }
        } catch (err) {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Login failed. Check your phone and PIN.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center p-8 font-outfit">
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-black tracking-tight text-black uppercase">Driver Portal</h1>
                    <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Sign in to manage your rides</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                                <Phone size={18} />
                            </div>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                placeholder="Enter PIN"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                            <p className="text-xs font-bold text-red-600 text-center uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center gap-3 py-4 bg-black text-[#F7DC9D] text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-[0.98]"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Need help accessing your account?<br />
                        Contact Dispatch Support
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DriverLogin;
