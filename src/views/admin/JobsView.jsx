import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Globe, TrendingUp, Search } from 'lucide-react';

const JobsView = () => {
    const [analytics, setAnalytics] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [analyticsRes, inventoryRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/analytics/jobs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/admin/inventory/jobs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setAnalytics(analyticsRes.data);
                setInventory(inventoryRes.data);
            } catch (error) {
                console.error("Error fetching job data", error);
            } finally {
                setLoading(false);
            }
        };

        const pollAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/admin/analytics/jobs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(response.data);
            } catch (error) {
                console.error("Polling error", error);
            }
        };

        fetchData();
        const interval = setInterval(pollAnalytics, 5000); // 5s live update
        return () => clearInterval(interval);
    }, []);

    const logActivity = async (portalName) => {
        try {
            await axios.post(`${API_URL}/activity/log`, {
                user_email: "admin@freedy.ai",
                action: "VISITED_JOB_PORTAL",
                target: portalName
            });
        } catch (error) {
            console.error("Test log failed", error);
        }
    };

    const filteredInventory = (inventory || []).filter(j =>
        j.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tighter uppercase">Job_Terminal</h2>
                    <p className="text-slate-500 text-xs font-mono">Dataset_Source: job.csv</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="FILTER_PORTALS_BY_NAME_OR_TYPE..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Popularity Area Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm h-[350px]">
                <div className="flex items-center gap-2 mb-6 text-slate-400 font-mono text-xs uppercase">
                    <Globe size={16} className="text-blue-500" />
                    REALTIME_CAREER_PORTAL_ENGAGEMENT
                </div>
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={analytics}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="name"
                                stroke="#475569"
                                tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#94a3b8' }}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={60}
                            />
                            <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px' }}
                                itemStyle={{ color: '#3b82f6', fontSize: '10px', fontFamily: 'monospace' }}
                                labelStyle={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Job Portals Inventory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-sm overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <div className="flex items-center gap-2 text-slate-300 font-mono text-xs uppercase">
                        <Briefcase size={14} className="text-purple-500" />
                        GLOBAL_PORTAL_INVENTORY_PORTFOLIO
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-500 border-b border-slate-800 uppercase">
                                <th className="p-4 font-bold w-16">ID</th>
                                <th className="p-4 font-bold w-64">PORTAL_NAME</th>
                                <th className="p-4 font-bold w-32">CATEGORY</th>
                                <th className="p-4 font-bold">REACH_DESCRIPTION</th>
                                <th className="p-4 font-bold w-40">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredInventory.map((job, index) => (
                                <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 text-slate-500">#{job.id}</td>
                                    <td className="p-4">
                                        <span className="text-slate-200 font-bold group-hover:text-blue-400 transition-colors uppercase block">
                                            {job.name}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${job.type?.toLowerCase() === 'government' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {job.type?.toUpperCase() || 'PRIVATE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </td>
                                    <td className="p-4">
                                        <a
                                            href={job.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => logActivity(job.name)}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-sm transition-all text-[9px] border border-slate-700 hover:border-transparent"
                                        >
                                            OPEN_PORTAL
                                            <TrendingUp size={10} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredInventory.length === 0 && (
                    <div className="p-12 text-center text-slate-600 font-mono italic">
                        NO_PORTALS_FOUND_IN_TERMINAL
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsView;
