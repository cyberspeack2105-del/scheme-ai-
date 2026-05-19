import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ArrowLeft } from 'lucide-react';

const LearnMore = () => {
    const navigate = useNavigate();
    const { speak, cancel, isSpeaking } = useTextToSpeech();
    const [activeStep, setActiveStep] = React.useState(null);

    const steps = [
        {
            title: "Voice Input",
            icon: "mic",
            desc: "Simply speak your details. Our system listens and fills the form for you."
        },
        {
            title: "AI Processing",
            icon: "psychology", // Brain icon
            desc: "Karen AI analyzes your profile against hundreds of government and private schemes."
        },
        {
            title: "Recommendation",
            icon: "recommend",
            desc: "Get a personalized list of the best schemes that match your eligibility."
        },
        {
            title: "Apply",
            icon: "how_to_reg",
            desc: "Select a scheme and proceed with your application instantly."
        }
    ];

    const handleStepClick = (step, index) => {
        if (activeStep === index && isSpeaking) {
            cancel();
            setActiveStep(null);
            return;
        }

        setActiveStep(index);
        const textToSpeak = `${step.title}. ${step.desc}`;
        speak(textToSpeak, () => setActiveStep(null));
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-white p-4 lg:p-8 flex flex-col items-center">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="gradient-blob -top-32 -left-32"></div>
                <div className="gradient-blob top-1/2 right-0 transform translate-x-1/3 -translate-y-1/2 opacity-60"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col gap-10">
                {/* Header */}
                <header className="flex items-center justify-between pt-4 pb-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all border border-white/5"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Home</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">How It Works</h1>
                    <div className="w-24"></div> {/* Spacer for centering */}
                </header>

                {/* Introduction */}
                <div className="glass-panel p-8 rounded-2xl text-center">
                    <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">
                        Empowering You with Karen AI
                    </h2>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6">
                        Our platform revolutionizes how you discover benefits. Instead of searching through endless documents,
                        just talk to <strong>Karen AI</strong>. We combine advanced voice recognition with intelligent data matching
                        to connect you with the right government and private schemes in seconds.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-pulse">
                        <span className="material-symbols-outlined text-lg">volume_up</span>
                        <span>Click on any card below to hear Karen AI explain it</span>
                    </div>
                </div>

                {/* Visual Flow */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            onClick={() => handleStepClick(step, index)}
                            className={`glass-card p-6 rounded-xl relative group overflow-hidden border transition-all cursor-pointer
                                ${activeStep === index
                                    ? 'border-primary ring-2 ring-primary/30 transform scale-105 shadow-[0_0_20px_rgba(0,234,255,0.3)]'
                                    : 'border-white/10 hover:border-primary/50 hover:shadow-lg'
                                }`}
                        >
                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0"></div>
                            )}

                            <div className="relative z-10 flex flex-col items-center text-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-transform shadow-[0_0_15px_rgba(0,234,255,0.2)]
                                    ${activeStep === index ? 'bg-primary text-background-dark scale-110' : 'bg-primary/20 group-hover:scale-110'}`}>
                                    <span className={`material-symbols-outlined text-3xl ${activeStep === index ? 'text-background-dark' : 'text-primary'}`}>
                                        {activeStep === index ? 'record_voice_over' : step.icon}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{step.desc}</p>
                            </div>

                            {/* Number Watermark */}
                            <div className="absolute -bottom-4 -right-2 text-8xl font-black text-white/5 select-none group-hover:text-white/10 transition-colors">
                                {index + 1}
                            </div>

                            {/* Active Indicator Overlay */}
                            {activeStep === index && (
                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/form')}
                        className="bg-primary text-background-dark font-bold text-lg px-10 py-4 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,234,255,0.4)] flex items-center justify-center gap-3 mx-auto group"
                    >
                        <span>Try it Now</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <p className="mt-4 text-slate-500 text-sm">Join thousands of users finding their benefits today.</p>
                </div>
            </div>
        </div>
    );
};

export default LearnMore;
