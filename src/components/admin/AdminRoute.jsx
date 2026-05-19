import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-emerald-500 font-mono">
                <div className="animate-pulse">INITIALIZING_SECURE_CONNECTION...</div>
            </div>
        );
    }

    // Allow access if role is admin OR email is the hardcoded admin email
    if (!user || (user.role !== 'admin' && user.email !== 'admin@freedy.ai')) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
