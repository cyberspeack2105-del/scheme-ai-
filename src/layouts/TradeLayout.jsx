import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Layers,
    Settings,
    LogOut,
    TrendingUp,
    Activity,
    Menu,
    X,
    Cpu,
    Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TradeLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: Home, label: 'EXIT TO HOME' },
        { path: '/admin', icon: TrendingUp, label: 'TRADING (MARKET)' },
        { path: '/admin/users', icon: Users, label: 'USER TERMINAL' },
        { path: '/admin/schemes', icon: Layers, label: 'SCHEME ASSETS' },
        { path: '/admin/jobs', icon: Activity, label: 'JOB ASSETS' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-mono overflow-hidden selection:bg-emerald-900 selection:text-emerald-50">
            {/* Ticker Tape Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-50 text-xs">
                <div className="flex items-center text-emerald-400 font-bold mr-6">
                    <Cpu size={14} className="mr-2" />
                    SYSTEM_STATUS: ONLINE
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap">
                    <div className="animate-ticker flex space-x-8 text-slate-400">
                        <span>CPU_LOAD: 12%</span>
                        <span>MEMORY: 4.2GB</span>
                        <span>ACTIVE_USERS: 142 ▲ 2.4%</span>
                        <span>NEW_SCHEMES: 5</span>
                        <span>SERVER_TIME: {new Date().toISOString().split('T')[1].split('.')[0]}</span>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed top-10 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 z-40
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-4 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tighter text-emerald-500">
                        Keran<span className="text-slate-100">.AI</span>
                    </h1>
                    <div className="text-[10px] text-slate-500 mt-1">ADMIN_TERMINAL_V1</div>
                </div>

                <nav className="p-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center px-3 py-3 text-sm font-medium rounded-sm transition-all duration-200
                                    ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'}
                                `}
                            >
                                <Icon size={16} className="mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold text-rose-400 border border-rose-900/30 bg-rose-950/10 hover:bg-rose-900/20 rounded transition-colors"
                    >
                        <LogOut size={14} className="mr-2" />
                        DISCONNECT
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 mt-10 p-4 md:p-6 overflow-y-auto bg-slate-950 relative">
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-center mb-6">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-400 hover:text-white"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                    <span className="font-bold text-slate-200">Terminal View</span>
                </div>

                {/* Grid Background Effect */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        zIndex: 0
                    }}
                />

                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TradeLayout;
