import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LogIn,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

import { API_URL } from '../api/config';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});

    /* ------------------ VALIDATION ------------------ */
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ------------------ INPUT CHANGE ------------------ */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    /* ------------------ SUBMIT ------------------ */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.email.toLowerCase().trim());
        formDataToSend.append('password', formData.password);

        try {
            const response = await axios.post(
                `${API_URL}/login`,
                formDataToSend
            );

            const user = response.data.user;

            console.log('Login Response:', user);

            // Save user & token
            login(user, response.data.access_token);

            setMessage({ type: 'success', text: 'Login successful!' });

            // ✅ ADMIN CHECK (SAFE & CASE-INSENSITIVE)
            const isAdmin =
                user?.role?.toLowerCase() === 'admin' ||
                user?.email?.toLowerCase() === 'admin@freedy.ai';

            const targetPath = isAdmin ? '/admin' : '/dashboard';

            console.log('Is Admin:', isAdmin);
            console.log('Redirecting to:', targetPath);

            setTimeout(() => navigate(targetPath), 800);

        } catch (error) {
            console.error('Login error:', error);
            let errorMsg = 'Invalid email or password';

            if (error.code === 'ERR_NETWORK') {
                errorMsg = 'Server is taking too long to respond. Please check database connection.';
            } else if (error.response?.status === 500) {
                errorMsg = 'Server error. Database might be unreachable.';
            } else if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            }

            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb gradient-orb-1"></div>
                <div className="gradient-orb gradient-orb-2"></div>
                <div className="gradient-orb gradient-orb-3"></div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon login-icon">
                        <LogIn size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue</p>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.type === 'success'
                            ? <CheckCircle size={20} />
                            : <AlertCircle size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* EMAIL */}
                    <div className="input-group">
                        <div className="input-icon">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div className="input-group">
                        <div className="input-icon">
                            <Lock size={20} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?
                        <Link to="/register"> Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
