import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, BookOpen, Mic, MicOff, Briefcase, ArrowLeft } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const JobPreferences = () => {
    const navigate = useNavigate();
    const { state } = useLocation(); // Contains previous form data (name, occupation, etc.)
    const { transcript, isListening, startListening, stopListening, supported } = useSpeechToText();
    const { speak } = useTextToSpeech();

    // State to track which field is currently receiving voice input
    const [activeField, setActiveField] = useState(null);
    const [showReview, setShowReview] = useState(false);

    const [jobData, setJobData] = useState({
        role: '',
        course: '',
        skills: '',
        location: ''
    });

    useEffect(() => {
        const message = !showReview
            ? "Please tell us your job preferences. We need your course, skills, and preferred location."
            : "Please review your details before we find matching jobs.";
        speak(message);
    }, [speak, showReview]);

    // Update form when transcript changes
    useEffect(() => {
        if (transcript && activeField) {
            setJobData(prev => ({ ...prev, [activeField]: transcript }));
        }
    }, [transcript, activeField]);

    const handleChange = (e) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleVoiceInput = (fieldName) => {
        if (isListening && activeField === fieldName) {
            stopListening();
            setActiveField(null);
        } else {
            setActiveField(fieldName);
            startListening();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowReview(true);
    };

    const handleFinalSubmit = () => {
        // Merge previous profile data with new job preferences
        const fullProfile = {
            ...state,
            ...jobData
        };
        navigate('/skill-analysis', { state: { userProfile: fullProfile } });
    };

    const fields = [
        { name: 'role', label: 'Preferred Job Role', icon: Briefcase, type: 'text', placeholder: "e.g. Software Engineer, Data Scientist" },
        { name: 'course', label: 'Course / Qualification', icon: BookOpen, type: 'text', placeholder: "e.g. B.Tech, MBA, or High School" },
        { name: 'skills', label: 'Key Skills', icon: Briefcase, type: 'text', placeholder: "e.g. Python, React, Communication" },
        { name: 'location', label: 'Preferred Location', icon: MapPin, type: 'text', placeholder: "e.g. Bangalore, Remote, Chennai" }
    ];

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration matching Home.jsx */}
            <div className="fixed inset-0 z-0 bg-mesh pointer-events-none opacity-20"></div>
            <div className="auth-background">
                <div className="gradient-orb gradient-orb-1 opacity-20"></div>
                <div className="gradient-orb opacity-10" style={{ top: '40%', left: '10%', width: '300px', height: '300px', background: 'cyan' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-lg glass-panel p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
                {/* Header with Back Button */}
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate('/schemes', { state: state })}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Back to Schemes"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary animate-pulse">
                        <Briefcase size={32} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Job <span className="text-primary">Preferences</span></h2>
                    <p className="text-slate-400 text-sm mt-2">Help us find the best career opportunities for you.</p>
                </div>

                {!showReview ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {fields.map((field) => (
                            <div key={field.name} className="group">
                                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5 ml-1">{field.label}</label>
                                <div className="relative flex items-center gap-2">
                                    <div className="relative flex-1 group-focus-within:text-primary transition-colors">
                                        <field.icon className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-primary w-5 h-5 transition-colors" />
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={jobData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-slate-900 outline-none text-white transition-all hover:border-white/20"
                                            required
                                        />
                                    </div>
                                    {/* Mic Button */}
                                    {supported && (
                                        <button
                                            type="button"
                                            onClick={() => handleVoiceInput(field.name)}
                                            className={`p-3 rounded-xl border transition-all ${activeField === field.name && isListening
                                                ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse'
                                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-primary hover:border-primary'
                                                }`}
                                            title="Click to Speak"
                                        >
                                            {activeField === field.name && isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)] hover:shadow-[0_0_30px_rgba(0,234,255,0.6)] hover:-translate-y-1 transform duration-200 mt-2"
                        >
                            <span>Proceed to Review</span>
                            <ArrowRight size={20} />
                        </button>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/schemes', { state: state })}
                                className="flex-1 bg-white/5 text-slate-300 hover:text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 bg-white/5 text-slate-300 hover:text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                            >
                                Home
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full mb-4 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight mb-2">Review Your <span className="text-primary">Preferences</span></h2>
                            <p className="text-slate-400 text-sm">Please verify your information below.</p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-white/10 pb-2">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Name</label>
                                    <p className="text-lg font-medium">{state?.fullName || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Age</label>
                                    <p className="text-lg font-medium">{state?.age || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all md:col-span-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Occupation</label>
                                    <p className="text-lg font-medium">{state?.occupation || 'N/A'}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-white/10 pb-2 pt-2">Job Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all md:col-span-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Preferred Role</label>
                                    <p className="text-lg font-medium">{jobData.role}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Qualification</label>
                                    <p className="text-lg font-medium">{jobData.course}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Location</label>
                                    <p className="text-lg font-medium">{jobData.location}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all md:col-span-2">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Key Skills</label>
                                    <p className="text-lg font-medium">{jobData.skills}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowReview(false)}
                                className="flex-1 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">edit</span>
                                <span>Edit Details</span>
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                className="flex-[2] bg-primary text-background-dark font-bold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)]"
                            >
                                <span>Find Matching Jobs</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobPreferences;
