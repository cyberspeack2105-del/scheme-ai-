import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, ExternalLink, ArrowLeft, Loader2, Home } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const JobResults = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    const userProfile = state?.userProfile;

    const [displayedJobs, setDisplayedJobs] = useState([]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let allJobs = [];
            const cachedData = sessionStorage.getItem('jobResults');
            const cachedIndex = sessionStorage.getItem('jobIndex');

            if (cachedData) {
                // Use cached jobs if available
                allJobs = JSON.parse(cachedData);
                // Get current starting index
                let currentIndex = parseInt(cachedIndex || '0');
                setJobs(allJobs);
                setDisplayedJobs(allJobs.slice(currentIndex, currentIndex + 6));
            } else if (userProfile) {
                // Fetch new if no cache
                const response = await axios.post(`${API_URL}/recommend`, userProfile);
                allJobs = response.data.jobs || [];

                // Save to cache
                sessionStorage.setItem('jobResults', JSON.stringify(allJobs));
                sessionStorage.setItem('jobIndex', '0');

                setJobs(allJobs);
                setDisplayedJobs(allJobs.slice(0, 6));
            } else {
                setLoading(false);
                return;
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError("Failed to fetch jobs.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        const cachedIndex = sessionStorage.getItem('jobIndex');
        let newIndex = parseInt(cachedIndex || '0') + 6;
        if (newIndex >= jobs.length) newIndex = 0; // Loop back

        sessionStorage.setItem('jobIndex', newIndex.toString());
        setDisplayedJobs(jobs.slice(newIndex, newIndex + 6));

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const logActivity = async (portalName) => {
        if (!userProfile?.email) return;
        try {
            await axios.post(`${API_URL}/activity/log`, {
                user_email: userProfile.email,
                action: "VISITED_JOB_PORTAL",
                target: portalName
            });
        } catch (error) {
            console.error("Error logging activity", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [userProfile]);

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-10 relative overflow-hidden">
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pt-4">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tight">AI Recommended <span className="text-primary">Portals</span></h2>
                        <p className="text-slate-400 text-sm">Top 6 career platforms matched for your profile</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10"
                        >
                            <span className="material-symbols-outlined {loading ? 'animate-spin' : ''}">refresh</span>
                            <span>Next 6 Jobs</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#0f2223] hover:brightness-110 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,234,255,0.2)]"
                        >
                            <Home size={20} />
                            <span>Home</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-primary animate-pulse font-bold">Matching career opportunities...</p>
                    </div>
                ) : error ? (
                    <div className="glass-panel p-10 text-center rounded-2xl border border-red-500/20">
                        <p className="text-red-400 font-bold mb-4">{error}</p>
                        <button onClick={fetchJobs} className="px-6 py-2 bg-primary text-[#0f2223] rounded-lg font-bold">Retry</button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
                        {displayedJobs.length > 0 ? displayedJobs.map((job, index) => (
                            <div key={index} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all group shadow-lg hover:shadow-primary/10 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-[#0f2223] transition-all duration-300">
                                        <Briefcase size={28} />
                                    </div>
                                    <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5 uppercase tracking-widest">{job.type}</span>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{job.name}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">{job.description}</p>

                                <div className="mt-auto">
                                    <a
                                        href={job.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => logActivity(job.name)}
                                        className="block w-full text-center bg-white/5 hover:bg-primary hover:text-[#0f2223] border border-white/10 hover:border-transparent py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(0,234,255,0.3)]"
                                    >
                                        <span>Visit Portal</span>
                                        <ExternalLink size={16} />
                                    </a>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    <span>Match Score: {job.match_score}</span>
                                    {job.match_score > 0 && <span className="text-primary flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div> Verified</span>}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 glass-panel rounded-xl">
                                <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400 text-lg font-bold">No matching data found.</p>
                                <button onClick={() => navigate('/job-preferences')} className="mt-4 text-primary font-bold hover:underline">Revise Profile</button>
                            </div>
                        )}
                    </div>
                )}

                {state?.userProfile && (
                    <div className="flex justify-end gap-4 pt-6 border-t border-white/10 w-full mt-4">
                        <button
                            onClick={() => navigate('/review-application', { state: state.userProfile })}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold transition-all border border-white/10 hover:border-white/20"
                        >
                            <ArrowLeft size={18} />
                            <span>Back to Review</span>
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default JobResults;
