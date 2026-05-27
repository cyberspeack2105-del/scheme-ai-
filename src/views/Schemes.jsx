import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@/utils/navigation';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { Home, ArrowLeft } from 'lucide-react';

const Schemes = () => {
    const navigate = useNavigate();
    const { formData } = useVoice();
    const { user, isAuthenticated } = useAuth();
    const [schemes, setSchemes] = useState([]);

    const { state } = useLocation(); // Get form data passed from Review
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            try {
                let allSchemes = [];
                const cachedData = sessionStorage.getItem('schemeResults');
                const cachedIndex = sessionStorage.getItem('schemeIndex');

                if (cachedData && JSON.parse(cachedData).length > 0) {
                    // Use cached data if available and not empty
                    allSchemes = JSON.parse(cachedData);
                    // Increment index for "Refresh" behavior (Next 6)
                    let newIndex = parseInt(cachedIndex || '0') + 6;
                    if (newIndex >= allSchemes.length) newIndex = 0; // Loop back to start

                    sessionStorage.setItem('schemeIndex', newIndex.toString());
                    setSchemes(allSchemes.slice(newIndex, newIndex + 6));
                } else {
                    // Fetch new data if no cache (first visit from Review)
                    // Use state (formData) from navigation or fallback to context/empty
                    const dataToSend = state || formData || {};

                    // Call backend (ensure URL is correct)
                    const response = await fetch(`${API_URL}/recommend`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    });

                    if (!response.ok) throw new Error('Failed to fetch');

                    const result = await response.json();
                    const rawSchemes = result.schemes || [];

                    // Map backend keys to frontend keys
                    allSchemes = rawSchemes.map(s => ({
                        id: s.scheme_id,
                        name: s.scheme_name,
                        sector: s.scheme_type,
                        benefit: s.description,
                        link: s.official_link
                    }));

                    // Save to cache
                    sessionStorage.setItem('schemeResults', JSON.stringify(allSchemes));
                    sessionStorage.setItem('schemeIndex', '0');

                    // Show first 6
                    setSchemes(allSchemes.slice(0, 6));
                }
            } catch (error) {
                console.error("Error loading schemes:", error);
                // Fallback to sample data if API fails
                const sampleSchemes = [
                    { id: 1, name: 'PM Kisan Samman Nidhi', sector: 'Agriculture', benefit: '₹6000 per year', link: 'https://pmkisan.gov.in/' },
                    { id: 2, name: 'Ayushman Bharat', sector: 'Health', benefit: '₹5 Lakh per family', link: 'https://pmjay.gov.in/' },
                    { id: 3, name: 'PM Awas Yojana', sector: 'Housing', benefit: 'Financial help for house', link: 'https://pmay-urban.gov.in/' },
                    { id: 4, name: 'Mudra Loan Yojana', sector: 'Business', benefit: 'Loan up to ₹10 Lakh', link: 'https://www.mudra.org.in/' },
                    { id: 5, name: 'PM Matru Vandana', sector: 'Women', benefit: '₹5000 for mothers', link: 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana' },
                    { id: 6, name: 'Skill India', sector: 'Education', benefit: 'Free Training', link: 'https://www.skillindia.gov.in/' }
                ];
                setSchemes(sampleSchemes);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, []); // Run once on mount

    const handleRefresh = () => {
        const cachedData = sessionStorage.getItem('schemeResults');
        const cachedIndex = sessionStorage.getItem('schemeIndex');
        if (cachedData) {
            const allSchemes = JSON.parse(cachedData);
            let newIndex = parseInt(cachedIndex || '0') + 6;

            // Loop back to start if we run out of schemes
            if (newIndex >= allSchemes.length) newIndex = 0;

            sessionStorage.setItem('schemeIndex', newIndex.toString());
            setSchemes(allSchemes.slice(newIndex, newIndex + 6));

            // Optional: Scroll to top of grid
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tight">Recommended <span className="text-primary">Schemes</span></h2>
                        <p className="text-slate-400">Personalized opportunities based on your profile</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 bg-white/5 text-white px-5 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 hover:text-primary hover:border-primary/50 transition-all shadow-lg"
                        >
                            <span className="material-symbols-outlined text-[20px]">refresh</span>
                            <span>Refresh</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-white/5 text-white px-5 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all shadow-lg"
                        >
                            <Home size={20} />
                            <span>Home</span>
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {schemes.map((scheme) => (
                        <div key={scheme.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">{scheme.sector}</span>
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{scheme.name}</h3>
                            <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-primary">verified</span>
                                Benefit: <span className="text-white font-bold">{scheme.benefit}</span>
                            </p>
                            <a
                                href={scheme.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-white/5 hover:bg-primary hover:text-[#0f2223] border border-white/10 hover:border-transparent py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Apply Now
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">

                    <div className="mt-12 flex items-center justify-between w-full">
                        <button
                            onClick={() => navigate('/review-application')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-all px-6 py-3"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Review</span>
                        </button>



                        {/* Conditional Job Button Bottom Right */}
                        {(state?.occupation?.toLowerCase().includes('student') || state?.occupation?.toLowerCase().includes('unemployed')) && (
                            <button
                                onClick={() => navigate('/job-preferences', { state: state })}
                                className="flex items-center gap-2 bg-primary text-[#0f2223] px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(0,234,255,0.3)] transition-all"
                            >
                                <span className="material-symbols-outlined">work</span>
                                <span>Find  Jobs</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schemes;
