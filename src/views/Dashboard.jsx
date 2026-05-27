import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { LogOut, User, Home, FileText, Sparkles, LayoutDashboard } from 'lucide-react';
import { Link } from '@/utils/navigation';
import { getImageUrl } from '../api/config';

const Dashboard = () => {
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        // Any dashboard specific initialization
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center shadow-2xl backdrop-blur-xl bg-[#0f2223]/80">

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-8 text-primary">
                        <Sparkles size={24} className="animate-pulse" />
                        <h2 className="text-xl font-bold tracking-wider uppercase">Welcome to Dashboard</h2>
                    </div>

                    {/* Profile Section */}
                    <div className="relative mb-6 group">
                        <div className="size-32 rounded-full overflow-hidden border-4 border-primary/20 p-1 shadow-[0_0_30px_rgba(0,234,255,0.3)] group-hover:border-primary/50 transition-all duration-500">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                                {user.image_url ? (
                                    <img src={getImageUrl(user.image_url)} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-[#0f2223] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            {user.role}
                        </div>
                    </div>

                    <h1 className="text-3xl font-black mb-1">{user.name}</h1>
                    <p className="text-slate-400 text-sm mb-10">{user.email}</p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-10">
                        <Link to="/" className="flex flex-col items-center gap-2 group">
                            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-[#0f2223] group-hover:border-primary transition-all duration-300 shadow-lg">
                                <Home size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">Home</span>
                        </Link>

                        <Link to="/form" className="flex flex-col items-center gap-2 group">
                            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-[#0f2223] group-hover:border-primary transition-all duration-300 shadow-lg">
                                <FileText size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">Voice Form</span>
                        </Link>

                        <Link to="/schemes" className="flex flex-col items-center gap-2 group">
                            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-[#0f2223] group-hover:border-primary transition-all duration-300 shadow-lg">
                                <LayoutDashboard size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">Schemes</span>
                        </Link>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Logout Account</span>
                    </button>

                </div>
            </div>
        </div>
    );

};

export default Dashboard;
