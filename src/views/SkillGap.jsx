import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from '@/utils/navigation';
import axios from 'axios';
import { API_URL } from '../api/config';
import { ArrowRight, CheckCircle, XCircle, Youtube, Briefcase, ArrowLeft } from 'lucide-react';
const SkillGap = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const userProfile = state?.userProfile;

    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        if (!userProfile) {
            navigate('/dashboard'); // Fallback if no data
            return;
        }

        const fetchAnalysis = async () => {
            try {
                // Prepare list of skills
                const skillsList = userProfile.skills.split(',').map(s => s.trim());

                const response = await axios.post(`${API_URL}/analyze-skill-gap`, {
                    user_skills: skillsList,
                    target_role: userProfile.role
                });

                setAnalysis(response.data);
            } catch (error) {
                console.error("Error analyzing skills:", error);
                // Set default/empty state to avoid crash
                setAnalysis({
                    score: 0,
                    matched_skills: [],
                    missing_skills: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [userProfile, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!analysis) return null;

    // Determine readiness color
    const scoreColor = analysis.score >= 70 ? 'text-green-400' : analysis.score >= 40 ? 'text-yellow-400' : 'text-red-400';
    const progressColor = analysis.score >= 70 ? 'bg-green-400' : analysis.score >= 40 ? 'bg-yellow-400' : 'bg-red-400';

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Back Button */}
                <div className="absolute top-0 left-0">
                    <button
                        onClick={() => navigate('/job-preferences', { state: { ...userProfile, ...state } })}
                        className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Back to Preferences"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-10 pt-12">
                    <h1 className="text-4xl font-black mb-2">Skill Gap <span className="text-primary">Analysis</span></h1>
                    <p className="text-slate-400">Analysis for <span className="text-white font-bold">{userProfile.role}</span> role</p>
                </div>

                {/* New Vertical Layout */}
                <div className="flex flex-col gap-8 mb-10">

                    {/* 1. Readiness Score (Top, Centered) */}
                    <div className="flex justify-center">
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center w-full max-w-xl bg-white/5 backdrop-blur-sm">
                            <div className="relative size-40 mb-4">
                                <svg className="size-full" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-700"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        className={scoreColor}
                                        strokeDasharray={`${analysis.score}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className={`text-4xl font-black ${scoreColor}`}>{analysis.score}%</span>
                                    <span className="text-xs uppercase font-bold text-slate-500">Ready</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Your Readiness</h3>
                            <p className="text-slate-400">You have {analysis.matched_skills.length} out of {analysis.matched_skills.length + analysis.missing_skills.length} skills required for this role.</p>
                        </div>
                    </div>

                    {/* 2. Matched Skills */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-green-400 font-bold flex items-center gap-2 mb-4 text-xl">
                            <CheckCircle size={24} />
                            Matched Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matched_skills.length > 0 ? (
                                analysis.matched_skills.map((skill, idx) => (
                                    <span key={idx} className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg text-sm font-bold border border-green-500/20">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500 text-sm">No specific skills matched yet.</span>
                            )}
                        </div>
                    </div>

                    {/* 3. Missing Skills (2 Columns) */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                        <h3 className="text-red-400 font-bold flex items-center gap-2 mb-6 text-xl">
                            <XCircle size={24} />
                            Missing Skills (Recommended to Learn)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.missing_skills.length > 0 ? (
                                analysis.missing_skills.map((item, idx) => (
                                    <div key={idx} className="flex flex-col xl:flex-row xl:items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/10 hover:bg-red-500/20 transition-all gap-4">
                                        <span className="text-slate-200 font-bold text-lg">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            {/* Free Course Button */}
                                            <a
                                                href={item.course_link || `https://www.classcentral.com/search?q=${encodeURIComponent(item.name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
                                            >
                                                <Briefcase size={16} />
                                                Free Course
                                            </a>

                                            {/* YouTube Button */}
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                                            >
                                                <Youtube size={16} />
                                                Video
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : analysis.matched_skills.length > 0 ? (
                                <div className="col-span-2 text-center text-slate-500 text-lg py-10">Great! You have all the core skills for this role.</div>
                            ) : (
                                <div className="col-span-2 text-center text-slate-500 text-lg py-10">No specific skill data found for this role. Try a broader role name.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/mock-interview', { state: { userProfile } })}
                        className="bg-purple-600 text-white text-lg font-bold py-4 px-8 rounded-2xl hover:bg-purple-500 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                    >
                        <span>Practice Interview</span>
                        <Briefcase size={24} />
                    </button>

                    <button
                        onClick={() => navigate('/job-results', { state: { userProfile: userProfile } })}
                        className="bg-primary text-background-dark text-lg font-bold py-4 px-10 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,234,255,0.4)]"
                    >
                        <span>View Matching Jobs</span>
                        <ArrowRight size={24} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SkillGap;
