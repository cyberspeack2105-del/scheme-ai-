import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table, Layers, TrendingUp, Search, Filter } from 'lucide-react';

const SchemesView = () => {
    const [analytics, setAnalytics] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [analyticsRes, inventoryRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/analytics/schemes`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/admin/inventory/schemes`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setAnalytics(analyticsRes.data);
                setInventory(inventoryRes.data);
            } catch (error) {
                console.error("Error fetching scheme data", error);
            } finally {
                setLoading(false);
            }
        };

        const pollAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/admin/analytics/schemes`, {
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

    const filteredInventory = (inventory || []).filter(s =>
        s.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    const logActivity = async (schemeName) => {
        try {
            await axios.post(`${API_URL}/activity/log`, {
                user_email: "admin@freedy.ai",
                action: "VIEWED_DETAILS",
                target: schemeName
            });
        } catch (error) {
            console.error("Test log failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tighter uppercase">Scheme_Terminal</h2>
                    <p className="text-slate-500 text-xs font-mono">Dataset_Source: schemes.csv</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="FILTER_SCHEMES_BY_NAME_OR_DESC..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-all text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Top Row: Analytics Graph */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-400 font-mono text-xs uppercase">
                    <TrendingUp size={16} className="text-emerald-500" />
                    USER_ENGAGEMENT_POPULARITY_RANKING
                </div>
                <div className="h-[300px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#94a3b8' }}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px' }}
                                    itemStyle={{ color: '#10b981', fontSize: '10px', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                                    {analytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Schemes Inventory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-sm overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <div className="flex items-center gap-2 text-slate-300 font-mono text-xs uppercase">
                        <Layers size={14} className="text-blue-500" />
                        GLOBAL_DATASET_INVENTORY_PORTFOLIO
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-500 border-b border-slate-800 uppercase">
                                <th className="p-4 font-bold w-16">ID</th>
                                <th className="p-4 font-bold w-64">SCHEME_NAME</th>
                                <th className="p-4 font-bold w-32">TYPE</th>
                                <th className="p-4 font-bold">DESCRIPTION</th>
                                <th className="p-4 font-bold w-40">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredInventory.map((scheme, index) => (
                                <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 text-slate-500">#{scheme.scheme_id}</td>
                                    <td className="p-4">
                                        <span className="text-slate-200 font-bold group-hover:text-emerald-400 transition-colors uppercase block">
                                            {scheme.scheme_name}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-bold">
                                            {scheme.scheme_type?.toUpperCase() || 'GENERAL'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 line-clamp-2 leading-relaxed">
                                        {scheme.description}
                                    </td>
                                    <td className="p-4">
                                        <a
                                            href={scheme.official_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => logActivity(scheme.scheme_name)}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 rounded-sm transition-all text-[9px] border border-slate-700 hover:border-transparent"
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
                        NO_RECORDS_FOUND_IN_TERMINAL
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchemesView;
