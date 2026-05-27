import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from '@/utils/navigation';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Brain, Database, MessageCircle, ArrowRight, CheckCircle, Smartphone, Lock, Search, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import { API_URL, getImageUrl } from '../api/config';
import Chatbot from '../components/Chatbot';

const Home = () => {
    const navigate = useNavigate();
    const { speak } = useTextToSpeech();
    const { resetForm } = useVoice();
    const { isAuthenticated, user, logout } = useAuth();

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const handleInteraction = () => {
            // Check if welcome message has already been spoken in this session
            const hasSpokenWelcome = sessionStorage.getItem('hasSpokenWelcome');
            if (!hasSpokenWelcome) {
                const hour = new Date().getHours();
                let greeting = (hour < 12) ? 'Good Morning' : (hour < 18) ? 'Good Afternoon' : 'Good Evening';
                const welcomeMessage = `${greeting}. My name is Keran. Welcome to the voice-enabled data collection with an AI-powered government and private scheme recommendation system. Please click Start Submission to begin your voice-guided data entry session.`;

                speak(welcomeMessage);
                sessionStorage.setItem('hasSpokenWelcome', 'true');
            }
        };

        // Add interaction listeners
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });

        // Fetch Reviews for landing page display
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_URL}/community/reviews`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch landing reviews", error);
            }
        };
        fetchReviews();

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, [speak]);

    const handleStartSubmission = () => {
        if (isAuthenticated) {
            resetForm();
            navigate('/form');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden bg-transparent">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh pointer-events-none opacity-20"></div>

            <div className="auth-background">
                <div className="gradient-orb gradient-orb-1 opacity-20"></div>
                <div className="gradient-orb opacity-10" style={{ top: '40%', left: '10%', width: '300px', height: '300px', background: 'cyan' }}></div>
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 glass-panel">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,234,255,0.2)]">
                        <span className="material-symbols-outlined text-2xl">shield_lock</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Secure<span className="text-primary">Portal</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-green-400 bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/20 transition-all">
                                    <LayoutDashboard size={18} />
                                    <span className="hidden sm:inline">Admin Panel</span>
                                </Link>
                            )}
                            <Link to="/community" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors px-2">
                                <span className="material-symbols-outlined text-[18px]">groups</span>
                                <span className="hidden sm:inline">Community</span>
                            </Link>
                            {/* Profile Info */}
                            <Link to="/dashboard" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-full border border-white/5 transition-all cursor-pointer">
                                <div className="size-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30">
                                    {user.image_url ? (
                                        <img src={getImageUrl(user.image_url)} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-primary">{user.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-white hidden sm:block">{user.name}</span>
                            </Link>


                            <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/20 transition-all">
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors px-2">
                                <LogIn size={18} />
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="flex items-center gap-2 text-sm font-bold text-background-dark bg-primary px-5 py-2 rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,234,255,0.3)]">
                                <UserPlus size={18} />
                                <span>Register</span>
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-4xl grid gap-8 lg:grid-cols-2 items-center mt-16">
                {/* Left Column */}
                <div className="flex flex-col gap-6 order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            System Operational • {user ? user.role : 'GUEST'}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                        AI-Powered Scheme  Recommendation <span className="text-primary">System</span>
                    </h2>


                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                        Application that provides voice-enabled data collection with an AI-powered government and private scheme recommendation system. The application features secure user authentication, voice-to-text form filling, and intelligent scheme matching based on user profiles.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        {isAuthenticated && (user?.role === 'admin' || user?.email?.toLowerCase() === 'raju36@gmail.com') ? (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-base px-8 py-3 rounded-lg hover:bg-green-600 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] group"
                            >
                                <span>Admin Panel</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">dataset</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStartSubmission}
                                className="flex items-center justify-center gap-2 bg-primary text-background-dark font-bold text-base px-8 py-3 rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,234,255,0.3)] group"
                            >
                                <span>Start Submission</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">arrow_forward</span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/learn-more')}
                            className="flex items-center justify-center gap-2 bg-transparent border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-medium text-base px-6 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">help</span>
                            <span>Learn More</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                            <span>256-bit Encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                            <span>GDPR Compliant</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Glass Card */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                    <div className="glass-panel p-6 md:p-8 rounded-xl w-full max-w-md relative overflow-hidden group">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white">Latest Activity</h3>
                                <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">Live</span>
                            </div>
                            <div className="space-y-4">
                                <div className="glass-card p-3 rounded-lg flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-white/20 rounded mb-1"></div>
                                        <div className="h-1.5 w-16 bg-white/10 rounded"></div>
                                    </div>
                                    <span className="text-xs text-slate-400">2m ago</span>
                                </div>
                                <div className="glass-card p-3 rounded-lg flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-32 bg-white/20 rounded mb-1"></div>
                                        <div className="h-1.5 w-20 bg-white/10 rounded"></div>
                                    </div>
                                    <span className="text-xs text-slate-400">14m ago</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-xs text-slate-400 mb-2">Secure Connection Established</p>
                                <div className="w-full bg-white/10 rounded-full h-1">
                                    <div className="bg-primary h-1 rounded-full w-[85%] shadow-[0_0_10px_rgba(0,234,255,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Reviews Section */}
            <div className="w-full max-w-6xl mx-auto mt-20 relative z-10 glass-panel p-8 rounded-3xl">
                <h2 className="text-3xl font-black text-center text-white mb-10">What our customers <span className="text-primary">think about us</span></h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reviews.length > 0 ? (
                        reviews.slice(0, 4).map((review, idx) => (
                            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
                                <div className="flex text-yellow-400 text-sm mb-4">
                                    {'★'.repeat(review.rating)}
                                    <span className="text-slate-600">{'★'.repeat(5 - review.rating)}</span>
                                </div>
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold border-2 border-primary/30 mb-4 shadow-[0_0_15px_rgba(0,234,255,0.3)]">
                                    {review.user_image ? (
                                        <img src={getImageUrl(review.user_image)} alt={review.user_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{review.user_name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <h4 className="font-bold text-white text-lg mb-1">{review.user_name}</h4>
                                <span className="text-xs text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded-full mb-4">{review.role}</span>
                                <div className="relative">
                                    <span className="absolute -top-2 -left-2 text-4xl text-primary/20 font-serif leading-none">"</span>
                                    <p className="text-slate-300 text-sm leading-relaxed px-2 italic line-clamp-4">
                                        {review.comment}
                                    </p>
                                    <span className="absolute -bottom-4 -right-2 text-4xl text-primary/20 font-serif leading-none">"</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 w-full">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Recently'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            Loading reviews...
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 w-full border-t border-white/10 mt-10 md:mt-20 py-8 bg-background-dark/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-sm">© 2026 Secure Data Systems. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-slate-500 hover:text-primary text-sm transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-slate-500 hover:text-primary text-sm transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
            {isAuthenticated && <Chatbot />}

            {/* WhatsApp Floating Button */}
            {isAuthenticated && (
                <a
                    href="https://wa.me/14155238886?text=join%20arose-sneeze"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 left-6 z-[9999] p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.5)] hover:scale-110 transition-all group border-2 border-white/20 flex items-center justify-center"
                    title="Chat on WhatsApp"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="fill-white stroke-white"
                    >
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.649.075-.99-.54-1.684-1.23-2.324-2.227-.33-.514.394-.48.971-1.637.101-.2.05-.37-.024-.523-.075-.153-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.005-.372-.005-.572-.005-.2 0-.523.074-.797.372-.27.297-1.023 1.003-1.023 2.449s1.048 2.853 1.198 3.056c.149.205 2.064 3.153 5.003 4.421 1.748.756 2.404.606 3.256.527.937-.087 1.767-.722 2.016-1.42.249-.7.249-1.302.174-1.424-.075-.124-.275-.198-.575-.348z" fill="white" stroke="none"></path>
                        <path d="M12.006 2a9.97 9.97 0 0 0-8.624 5.035l-1.382 5.044 5.162-1.354A9.957 9.957 0 0 0 12.006 22a10 10 0 0 0 0-20z" fill="none" stroke="white" strokeWidth="2"></path>
                    </svg>
                    <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl scale-90 group-hover:scale-100 origin-left">
                        Connect on WhatsApp
                    </span>
                </a>
            )}
        </div >
    );
};

export default Home;
