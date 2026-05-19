import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowDown, ExternalLink, ShieldCheck } from 'lucide-react';

const JobSchemeResults = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const jobsSectionRef = useRef(null);

    const results = state?.results || { schemes: [], jobs: [] };
    const { schemes, jobs } = results;

    const scrollToJobs = () => {
        jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-10">
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-16">

                {/* Schemes Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Eligible <span className="text-primary">Schemes</span></h2>
                        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white">Back to Home</button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {schemes.length > 0 ? schemes.map((scheme, index) => (
                            <div key={index} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">{scheme.scheme_type}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{scheme.scheme_name}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3 text-ellipsis">{scheme.description}</p>
                                <a
                                    href={scheme.official_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-semibold"
                                >
                                    Apply Now <ExternalLink size={14} />
                                </a>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <span>Match Score: {scheme.match_score}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 col-span-3 text-center py-10">No specific schemes found matching your profile.</p>
                        )}
                    </div>

                    <div className="flex justify-center mt-12">
                        <button
                            onClick={scrollToJobs}
                            className="bg-primary text-background-dark font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.3)] animate-bounce"
                        >
                            <span>Find Jobs</span>
                            <ArrowDown size={20} />
                        </button>
                    </div>
                </div>

                {/* Jobs Section */}
                <div ref={jobsSectionRef} className="pt-10 scroll-mt-10">
                    <h2 className="text-3xl font-bold mb-8">Recommended <span className="text-green-400">Job Portals</span></h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.length > 0 ? jobs.map((job, index) => (
                            <div key={index} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-green-400/50 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                        <Briefcase size={24} />
                                    </div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">{job.type}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">{job.name}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3 text-ellipsis">{job.description}</p>
                                <a
                                    href={job.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-green-400 hover:text-white transition-colors text-sm font-semibold"
                                >
                                    Visit Portal <ExternalLink size={14} />
                                </a>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <span>AI Match: {job.match_score > 0 ? 'High Relevance' : 'General'}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 col-span-3 text-center py-10">No specific job portals found.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JobSchemeResults;
