import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-white p-4 lg:p-8 flex flex-col items-center">
            <div className="relative z-10 w-full max-w-4xl flex flex-col gap-8">
                {/* Header */}
                <header className="flex items-center justify-between pt-4 pb-2 border-b border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all border border-white/5"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Home</span>
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Terms of Service</h1>
                </header>

                {/* Content */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 text-slate-300 leading-relaxed">
                    <p className="text-sm text-slate-500">Last Updated: January 2026</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <CheckCircle size={20} className="text-primary" />
                            2. Use License
                        </h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on SecurePortal for personal, non-commercial transitory viewing only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <AlertCircle size={20} className="text-primary" />
                            3. Disclaimer
                        </h2>
                        <p>
                            The materials on SecurePortal are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties. The scheme recommendations provided by Karen AI are for informational purposes only and do not guarantee eligibility or approval.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. User Conduct</h2>
                        <p>
                            You agree not to use the website for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the website in any way that could damage the website, the services, or the general business of SecurePortal.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
