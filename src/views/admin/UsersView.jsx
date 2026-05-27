import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../api/config';
import { User, Mail, Shield, X, Search, MoreVertical } from 'lucide-react';

const UsersView = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`${API_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Ensure response data is an array before setting state
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching users", error);
                setUsers([]); // Fallback to empty array
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = (users || []).filter(user => {
        const name = user?.name?.toLowerCase() || '';
        const email = user?.email?.toLowerCase() || '';
        const search = searchTerm?.toLowerCase() || '';
        return name.includes(search) || email.includes(search);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tighter uppercase">User_Terminal</h2>
                    <p className="text-slate-500 text-xs font-mono">Total_Active_Traders: {users.length}</p>
                </div>
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH_BY_EMAIL_OR_NAME..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredUsers.map((user, idx) => (
                        <div
                            key={user.email || user.username || idx}
                            onClick={() => setSelectedUser(user)}
                            className="bg-slate-900 border border-slate-800 p-4 rounded-sm cursor-pointer hover:border-emerald-500/30 group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {user.image_url ? (
                                        <img src={getImageUrl(user.image_url)} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover border border-slate-700 group-hover:border-emerald-500/50" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
                                            <User size={24} />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                                        {user.name || user.username || 'Anonymous_Explorer'}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 truncate font-mono">
                                        {user.email || 'NO_EMAIL_RECORDED'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-[10px] font-mono">
                                <span className={`px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {user.role?.toUpperCase() || 'USER'}
                                </span>
                                <span className="text-slate-600">
                                    ID: {user.email?.split('@')[0].slice(0, 6) || user.username?.slice(0, 6) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <span className="text-xs font-mono text-slate-400 uppercase">Profile_Details</span>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <div className="relative mb-6">
                                {selectedUser.image_url ? (
                                    <img
                                        src={getImageUrl(selectedUser.image_url)}
                                        alt={selectedUser.name || 'User'}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-800 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border-4 border-slate-800">
                                        <User size={64} />
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 p-2 bg-emerald-500 rounded-full border-4 border-slate-900 shadow-lg">
                                    <Shield size={16} className="text-slate-950" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-1">{selectedUser.name || selectedUser.username || 'Anonymous_Explorer'}</h2>
                            <p className="text-emerald-500 text-sm font-mono mb-6">{selectedUser.email || 'NO_EMAIL_RECORDED'}</p>

                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-4 border border-slate-800 rounded-sm">
                                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Access_Level</span>
                                    <span className="text-slate-200 font-mono">{selectedUser.role?.toUpperCase() || 'USER'}</span>
                                </div>
                                <div className="bg-slate-800/30 p-4 border border-slate-800 rounded-sm">
                                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Status</span>
                                    <span className="text-emerald-400 font-mono">ACTIVE</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="mt-8 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono transition-colors rounded-sm"
                            >
                                CLOSE_TERMINAL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersView;
