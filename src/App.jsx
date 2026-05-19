import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VoiceForm from './pages/VoiceForm';
import Preview from './pages/Preview';
import Schemes from './pages/Schemes';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ReviewApplication from './pages/ReviewApplication';
import JobSchemeResults from './pages/JobSchemeResults';
import JobResults from './pages/JobResults';
import SkillGap from './pages/SkillGap';
import LearnMore from './pages/LearnMore';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { VoiceProvider } from './context/VoiceContext';
import { AuthProvider } from './context/AuthContext';

// Admin Imports
import TradeLayout from './layouts/TradeLayout';
import AdminRoute from './components/admin/AdminRoute';
import AdminPanel from './pages/admin/Panel';
import UsersView from './pages/admin/UsersView';
import SchemesView from './pages/admin/SchemesView';
import JobsView from './pages/admin/JobsView';

import JobPreferences from './pages/JobPreferences';
import MockInterviewLanding from './pages/MockInterviewLanding';
import MockInterviewSession from './pages/MockInterviewSession';
import BackgroundEffect from './components/BackgroundEffect';

import Community from './pages/Community';

function App() {
    return (
        <AuthProvider>
            <VoiceProvider>
                <Router>
                    <BackgroundEffect />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/form" element={<VoiceForm />} />
                        <Route path="/preview" element={<Preview />} />
                        <Route path="/schemes" element={<Schemes />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/review-application" element={<ReviewApplication />} />
                        <Route path="/job-preferences" element={<JobPreferences />} />
                        <Route path="/results" element={<JobSchemeResults />} />
                        <Route path="/job-results" element={<JobResults />} />
                        <Route path="/skill-analysis" element={<SkillGap />} />
                        <Route path="/mock-interview" element={<MockInterviewLanding />} />
                        <Route path="/mock-interview/session" element={<MockInterviewSession />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute>
                                <TradeLayout />
                            </AdminRoute>
                        }>
                            <Route index element={<AdminPanel />} />
                            <Route path="users" element={<UsersView />} />
                            <Route path="schemes" element={<SchemesView />} />
                            <Route path="jobs" element={<JobsView />} />
                        </Route>

                        <Route path="/learn-more" element={<LearnMore />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                    </Routes>
                </Router>
            </VoiceProvider>
        </AuthProvider>
    );
}

export default App;
