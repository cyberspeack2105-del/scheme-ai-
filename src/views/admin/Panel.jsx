import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Layers, Activity, Clock, Star, Zap } from 'lucide-react';

const TickerCard = ({ title, value, change, isPositive, icon: Icon }) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">{title}</span>
            <Icon size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
        <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono text-slate-100">{value}</span>
            <span className={`text-[10px] font-bold flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                {change}
            </span>
        </div>
        <div className={`absolute bottom-0 left-0 h-0.5 w-full ${isPositive ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />
    </div>
);

const MarketChart = ({ data, loading }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm h-[450px]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-mono text-slate-400 flex items-center tracking-tighter">
                <TrendingUp size={16} className="mr-2 text-emerald-500" />
                APP_USAGE_VS_USER_RATING (LIVE_MARKET)
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-400">USERS</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-slate-400">RATING</span>
                </div>
            </div>
        </div>
        {loading ? (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis yAxisId="left" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[0, 5]} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px' }}
                        itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                    <Area yAxisId="right" type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                </AreaChart>
            </ResponsiveContainer>
        )}
    </div>
);

const TradeLog = ({ logs, loading }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm h-[450px] flex flex-col">
        <h3 className="text-sm font-mono text-slate-400 mb-6 flex items-center tracking-tighter">
            <Clock size={16} className="mr-2 text-blue-500" />
            REALTIME_FEED
        </h3>
        <div className="space-y-4 font-mono text-[10px] overflow-y-auto flex-1">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-600 italic">NO_ACTIVITY_RECORDED</div>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-slate-800/50 pb-3 last:border-0 hover:bg-slate-800/30 p-2 rounded transition-colors group">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400">USER_SIGNAL</span>
                                <span className="text-slate-600 px-1 bg-emerald-500/10 rounded">#{1000 + i}</span>
                            </div>
                            <span className="text-slate-400 uppercase">{log.action}: {log.target}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 block">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}</span>
                            <span className="text-[9px] text-emerald-500/80 font-bold">STABLE</span>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-mono text-slate-600 border-t border-slate-800">
            <span>TERMINAL_CONNECTED</span>
            <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                LIVE
            </div>
        </div>
    </div>
);

const AdminPanel = () => {
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activityLogs, setActivityLogs] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [stats, setStats] = useState({ total_users: 0, active_now: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [usageRes, statsRes, activityRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/analytics/usage`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/admin/activity`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUsageData(usageRes.data);
                setStats(statsRes.data);
                setActivityLogs(Array.isArray(activityRes.data) ? activityRes.data : []);
            } catch (err) {
                console.error("Error fetching trading data", err);
            } finally {
                setLoading(false);
                setActivityLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            {/* Ticker Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <TickerCard title="TOTAL_TRADERS" value={stats.total_users || 0} change="+2.4%" isPositive={true} icon={Users} />
                <TickerCard title="MARKET_SENTIMENT" value="4.8/5" change="+0.2%" isPositive={true} icon={Star} />
                <TickerCard title="SYSTEM_LATENCY" value="24ms" change="-12%" isPositive={true} icon={Zap} />
                <TickerCard title="ACTIVE_SESSIONS" value={stats.active_now || 0} change="+4.1%" isPositive={true} icon={Activity} />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MarketChart data={usageData} loading={loading} />
                </div>
                <div className="lg:col-span-1">
                    <TradeLog logs={activityLogs} loading={activityLoading} />
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
