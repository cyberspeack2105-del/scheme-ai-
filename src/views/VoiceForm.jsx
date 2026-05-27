import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/utils/navigation';
import { ArrowRight, User, Calendar, Briefcase, IndianRupee, Mic, MicOff, UserCircle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoice } from '../context/VoiceContext';
import { API_URL } from '../api/config';
import axios from 'axios';

const VoiceForm = () => {
    const navigate = useNavigate();
    const { transcript, isListening, startListening, stopListening, supported, setTranscript } = useSpeechToText();
    const { speak } = useTextToSpeech();
    const { formData, updateField, setBulkFormData, saveSession } = useVoice();

    // State for individual field input
    const [activeField, setActiveField] = useState(null);
    
    // State for Smart Fill (Global AI Extraction)
    const [isSmartFilling, setIsSmartFilling] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [smartFillStatus, setSmartFillStatus] = useState(''); // 'listening', 'analyzing', 'success', 'error'

    useEffect(() => {
        const message = "Welcome. You can manually type your details, use individual microphones for each field, or use our new Smart AI Assistant at the top to describe yourself in any language.";
        speak(message);
    }, [speak]);

    // Update form when transcript changes
    useEffect(() => {
        if (transcript && activeField) {
            updateField(activeField, transcript);
        }
    }, [transcript, activeField, updateField]);

    const handleChange = (e) => {
        updateField(e.target.name, e.target.value);
    };

    const handleVoiceInput = (fieldName) => {
        // If smart filling, stop it first
        if (isSmartFilling) {
            stopListening();
            setIsSmartFilling(false);
            setSmartFillStatus('');
        }

        if (isListening && activeField === fieldName) {
            stopListening();
            setActiveField(null);
        } else {
            setActiveField(fieldName);
            if (setTranscript) setTranscript('');
            startListening();
        }
    };

    const handleSmartFillToggle = () => {
        if (isSmartFilling) {
            stopListening();
            setIsSmartFilling(false);
            processSmartFill(transcript);
        } else {
            setActiveField(null);
            setIsSmartFilling(true);
            setSmartFillStatus('listening');
            if (setTranscript) setTranscript('');
            startListening();
            speak("I'm listening. Please describe yourself, including your name, age, occupation, and family details in any language.");
        }
    };

    const processSmartFill = async (text) => {
        if (!text || text.length < 5) {
            setSmartFillStatus('');
            setIsSmartFilling(false);
            return;
        }

        setIsProcessing(true);
        setSmartFillStatus('analyzing');
        
        try {
            const response = await axios.post(`${API_URL}/api/analyze-form`, {
                message: text
            });

            const extractedData = response.data;
            
            if (extractedData && !extractedData.error) {
                setBulkFormData(extractedData);
                setSmartFillStatus('success');
                speak("Understood! I've filled the form for you. Please verify the details.");
                
                // Reset status after a few seconds
                setTimeout(() => setSmartFillStatus(''), 5000);
            } else {
                setSmartFillStatus('error');
                speak("I had some trouble understanding that. Could you please try again or fill the fields manually?");
            }
        } catch (error) {
            console.error('Smart Fill Error:', error);
            setSmartFillStatus('error');
        } finally {
            setIsProcessing(false);
            setIsSmartFilling(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveSession();
        navigate('/review-application');
    };

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh pointer-events-none opacity-20"></div>
            <div className="auth-background">
                <div className="gradient-orb gradient-orb-1 opacity-20"></div>
                <div className="gradient-orb opacity-10" style={{ top: '40%', left: '10%', width: '300px', height: '300px', background: 'cyan' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-6">
                {/* Smart AI Assistant Card */}
                <div className={`glass-panel p-6 rounded-3xl border transition-all duration-500 ${isSmartFilling ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'border-white/10'}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${isSmartFilling ? 'bg-primary text-background-dark scale-110' : 'bg-primary/10 text-primary'}`}>
                            {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                Smart <span className="text-primary font-black">AI Assistant</span>
                                {smartFillStatus === 'success' && <CheckCircle2 className="text-green-400 animate-bounce" size={20} />}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                {isSmartFilling 
                                    ? "I'm listening... Speak naturally in any language." 
                                    : isProcessing 
                                    ? "Analyzing your description..." 
                                    : "Describe yourself in one go and I'll fill the whole form for you!"}
                            </p>
                            {isSmartFilling && transcript && (
                                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-primary text-xs italic animate-pulse">
                                    "{transcript}..."
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleSmartFillToggle}
                            disabled={isProcessing}
                            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl ${
                                isSmartFilling 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-primary text-background-dark hover:scale-105 active:scale-95'
                            } disabled:opacity-50`}
                        >
                            {isSmartFilling ? <><MicOff size={18} /> Finish Speaking</> : <><Mic size={18} /> Start Smart Fill</>}
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                            <UserCircle size={32} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Personal <span className="text-primary">Information</span></h2>
                        <p className="text-slate-400 text-sm mt-2">Fill the fields below manually or click individual mic icons for specific fields.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-5">
                                {[
                                    { name: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: "e.g. raju" },
                                    { name: 'fatherName', label: "Father's Name", icon: User, type: 'text', placeholder: "e.g. murugan" },
                                    { name: 'motherName', label: "Mother's Name", icon: User, type: 'text', placeholder: "e.g. jothi" }
                                ].map((field) => (
                                    <div key={field.name} className="group">
                                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5 ml-1">{field.label}</label>
                                        <div className="relative flex items-center gap-2">
                                            <div className="relative flex-1 group-focus-within:text-primary transition-colors">
                                                <field.icon className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-primary w-5 h-5 transition-colors" />
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-slate-900 outline-none text-white transition-all hover:border-white/20"
                                                    required
                                                />
                                            </div>
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
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                {[
                                    { name: 'age', label: 'Age', icon: Calendar, type: 'number', placeholder: "e.g. 25" },
                                    { name: 'income', label: 'Annual Income', icon: IndianRupee, type: 'text', placeholder: "e.g. 500000" }
                                ].map((field) => (
                                    <div key={field.name} className="group">
                                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5 ml-1">{field.label}</label>
                                        <div className="relative flex items-center gap-2">
                                            <div className="relative flex-1 group-focus-within:text-primary transition-colors">
                                                <field.icon className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-primary w-5 h-5 transition-colors" />
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-slate-900 outline-none text-white transition-all hover:border-white/20"
                                                    required
                                                />
                                            </div>
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

                                <div className="group">
                                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5 ml-1">Occupation</label>
                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex-1 group-focus-within:text-primary transition-colors">
                                            <Briefcase className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-primary w-5 h-5 transition-colors" />
                                            <select
                                                name="occupation"
                                                value={formData.occupation || ''}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-slate-900 outline-none text-white transition-all hover:border-white/20 appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="" disabled className="bg-slate-900 text-slate-400">Select Occupation</option>
                                                <option value="student" className="bg-slate-900">Student</option>
                                                <option value="unemployed" className="bg-slate-900">Unemployed</option>
                                                <option value="employed" className="bg-slate-900">Employed</option>
                                                <option value="business" className="bg-slate-900">Business</option>
                                                <option value="farmer" className="bg-slate-900">Farmer</option>
                                                <option value="retired" className="bg-slate-900">Retired</option>
                                                <option value="other" className="bg-slate-900">Other</option>
                                            </select>
                                        </div>
                                        {supported && (
                                            <button
                                                type="button"
                                                onClick={() => handleVoiceInput('occupation')}
                                                className={`p-3 rounded-xl border transition-all ${activeField === 'occupation' && isListening
                                                    ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse'
                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-primary hover:border-primary'
                                                    }`}
                                                title="Click to Speak"
                                            >
                                                {activeField === 'occupation' && isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)] hover:shadow-[0_0_30px_rgba(0,234,255,0.6)] hover:-translate-y-1 transform duration-200 mt-2"
                        >
                            <span>Next Step</span>
                            <ArrowRight size={20} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full mt-4 text-slate-500 hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancel & Return Home
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VoiceForm;
