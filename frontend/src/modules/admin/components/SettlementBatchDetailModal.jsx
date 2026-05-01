import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, ArrowUpRight, User, Hash, Banknote, Calendar } from 'lucide-react';
import api from '../../../lib/api';

const SettlementBatchDetailModal = ({ batchId, onClose, onBatchProcessed }) => {
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/drivers/batches/${batchId}`);
            if (res && res.data) {
                setBatch(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch batch details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (batchId) fetchDetails();
    }, [batchId]);

    const handleProcess = async () => {
        if (!window.confirm('Process this payout batch and mark all earnings as settled?')) return;
        try {
            setProcessing(true);
            await api.patch(`/drivers/batches/${batchId}/process`);
            if (onBatchProcessed) onBatchProcessed();
            onClose();
        } catch (error) {
            alert('Failed to process batch: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    if (!batchId) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="px-10 py-8 bg-black text-[#F7DC9D] flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-serif font-black uppercase tracking-tight">
                                {loading ? 'Loading Batch...' : batch?.batchRef}
                            </h2>
                            {!loading && (
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                    batch?.status === 'processed' ? 'border-emerald-500 text-emerald-500' : 'border-[#F7DC9D] text-[#F7DC9D]'
                                }`}>
                                    {batch?.status}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Payout Batch Audit & Details</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-full transition-all text-[#F7DC9D]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20">
                        <div className="w-10 h-10 border-4 border-[#F7DC9D] border-t-black rounded-full animate-spin mb-4" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Retrieving Batch Records...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-10 font-outfit">
                        {/* Summary Row */}
                        <div className="grid grid-cols-4 gap-6 mb-10">
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payout</p>
                                <p className="text-2xl font-black text-black">₹{batch.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Trip Count</p>
                                <p className="text-2xl font-black text-black">{batch.totalTrips}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Created By</p>
                                <p className="text-sm font-black text-black uppercase">{batch.createdBy?.name || 'Admin'}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-sm font-black text-black">{(new Date(batch.createdAt)).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Earnings Table */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Hash size={12} />
                                Included Earnings ({batch.earningIds?.length})
                            </h3>
                            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Trip Ref</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Driver</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fare</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Earning</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {batch.earningIds?.map((e) => (
                                            <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-[10px] font-black text-black uppercase">{e.bookingRef}</p>
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{(new Date(e.createdAt)).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[10px] font-black text-black uppercase italic">{e.driverId?.name}</p>
                                                    <div className="mt-1 flex flex-col gap-0.5">
                                                        <p className="text-[8px] text-gray-400 font-bold uppercase">{e.driverId?.phone}</p>
                                                        {e.driverId?.bankDetails?.accountNumber ? (
                                                            <div className="mt-1 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                                                                <p className="text-[7px] font-black text-emerald-700 uppercase">Bank: {e.driverId.bankDetails.bankName}</p>
                                                                <p className="text-[7px] font-black text-emerald-700">A/C: {e.driverId.bankDetails.accountNumber}</p>
                                                                <p className="text-[7px] font-black text-emerald-700 uppercase">IFSC: {e.driverId.bankDetails.ifscCode}</p>
                                                            </div>
                                                        ) : e.driverId?.bankDetails?.upiId ? (
                                                            <div className="mt-1 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                                                <p className="text-[7px] font-black text-blue-700 uppercase">UPI: {e.driverId.bankDetails.upiId}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[7px] font-black text-red-400 uppercase italic mt-1">Bank details missing</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-black">₹{e.tripFare}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-[10px] font-black text-black">₹{e.earningAmount}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Processing Info */}
                        {batch.status === 'processed' && (
                            <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-emerald-600">
                                    <CheckCircle size={24} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Settled Successfully</p>
                                        <p className="text-xs font-bold opacity-80">This batch was processed by {batch.processedBy?.name} on {(new Date(batch.processedAt)).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                    >
                        Close Window
                    </button>
                    {batch?.status === 'draft' && (
                        <button 
                            onClick={handleProcess}
                            disabled={processing}
                            className="flex items-center gap-2 px-8 py-4 bg-black text-[#F7DC9D] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-3 h-3 border-2 border-[#F7DC9D] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Banknote size={16} />
                            )}
                            Process Payout Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettlementBatchDetailModal;
