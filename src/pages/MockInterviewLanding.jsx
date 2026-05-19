import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Mic, Brain, Languages, Play, ArrowLeft } from 'lucide-react';

const MockInterviewLanding = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const userProfile = state?.userProfile;

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            {/* Background Bubbles - Removed (Global) */}

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => userProfile ? navigate('/skill-analysis', { state: { userProfile } }) : navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold hidden md:inline">Back to Analysis</span>
                </button>
            </div>

            <div className="relative z-10 max-w-4xl w-full text-center space-y-12">

                {/* Hero */}
                <div className="space-y-6">
                    <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-full text-primary mb-4 shadow-[0_0_40px_rgba(0,234,255,0.2)]">
                        <Bot size={64} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                        Master Your <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Interview</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Practice with our advanced AI Coach. Get real-time feedback, model answers, and explanations in your preferred language.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-400 mb-4">
                            <Brain size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Smart Practice</h3>
                        <p className="text-slate-400 text-sm">Two modes: Learn with explanations or simulate a real high-pressure interview.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="bg-cyan-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-cyan-400 mb-4">
                            <Languages size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
                        <p className="text-slate-400 text-sm">Get explanations in English, Tamil, or Malayalam to understand complex concepts better.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="bg-pink-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-pink-400 mb-4">
                            <Mic size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Voice Interaction</h3>
                        <p className="text-slate-400 text-sm">Speak your answers naturally. The AI analyzes your speech clarity and confidence.</p>
                    </div>
                </div>

                {/* Action */}
                <div>
                    <button
                        onClick={() => navigate('/mock-interview/session', { state: { userProfile } })}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary text-[#0a1a1b] text-xl font-black rounded-full hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,234,255,0.4)] hover:shadow-[0_0_50px_rgba(0,234,255,0.6)]"
                    >
                        <span>Start AI Interview</span>
                        <div className="bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                            <Play size={20} fill="currentColor" />
                        </div>
                    </button>
                    <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest">No setup required</p>
                </div>

            </div>
        </div>
    );
};

export default MockInterviewLanding;
