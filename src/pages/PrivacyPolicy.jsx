import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy = () => {
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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Privacy Policy</h1>
                </header>

                {/* Content */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 text-slate-300 leading-relaxed">
                    <p className="text-sm text-slate-500">Last Updated: January 2026</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <Shield size={20} className="text-primary" />
                            1. Information We Collect
                        </h2>
                        <p>
                            We collect personal information that you voluntarily provide to us when you use the SecurePortal application. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Personal details (Name, Age, Father/Mother's Name)</li>
                            <li>Financial information (Annual Income)</li>
                            <li>Professional details (Occupation)</li>
                            <li>Voice data (audio recordings for form filling)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <Eye size={20} className="text-primary" />
                            2. How We Use Your Information
                        </h2>
                        <p>
                            We use the collected information solely for the purpose of:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Providing personalized government and private scheme recommendations.</li>
                            <li>Improving our AI algorithms (Karen AI) for better accuracy.</li>
                            <li>Facilitating the application process for selected schemes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <Lock size={20} className="text-primary" />
                            3. Data Security
                        </h2>
                        <p>
                            We implement industry-standard security measures, including 256-bit encryption, to protect your personal information. Your data is stored securely and is not shared with third parties without your explicit consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Your Rights</h2>
                        <p>
                            You have the right to access, correct, or delete your personal information at any time. Please contact our support team if you wish to exercise these rights.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
