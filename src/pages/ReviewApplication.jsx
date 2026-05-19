import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { Edit, ShieldCheck } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const ReviewApplication = () => {
    const { formData } = useVoice();
    const navigate = useNavigate();
    const { speak } = useTextToSpeech();

    useEffect(() => {
        if (formData && Object.keys(formData).length > 0) {
            speak("Please review your details. You can view recommended schemes based on your profile.");
        }
    }, [speak, formData]);

    // Check occupation for conditional button
    const occupationLower = formData?.occupation?.toLowerCase() || '';
    const showJobs = occupationLower.includes('student') || occupationLower.includes('unemployed');

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-3xl glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full mb-4 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Review Your <span className="text-primary">Details</span></h2>
                    <p className="text-slate-400">Please verify your information below.</p>
                </div>

                <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Full Name</label>
                            <p className="text-lg font-medium">{formData?.fullName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Age</label>
                            <p className="text-lg font-medium">{formData?.age || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Occupation</label>
                            <p className="text-lg font-medium">{formData?.occupation || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Annual Income</label>
                            <p className="text-lg font-medium">{formData?.income || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Father's Name</label>
                            <p className="text-lg font-medium">{formData?.fatherName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Mother's Name</label>
                            <p className="text-lg font-medium">{formData?.motherName || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('schemeResults');
                            sessionStorage.removeItem('schemeIndex');
                            navigate('/schemes', { state: formData });
                        }}
                        className="w-full max-w-sm bg-primary text-background-dark font-bold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)]"
                    >
                        <span className="material-symbols-outlined">dataset</span>
                        <span>Find Recommended Schemes</span>
                    </button>





                    <div className="flex gap-4 mt-4 w-full max-w-sm">
                        <button
                            onClick={() => navigate('/form')}
                            className="flex-1 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Edit size={16} />
                            <span>Edit Details</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewApplication;
