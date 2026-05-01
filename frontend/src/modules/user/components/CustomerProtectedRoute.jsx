import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const CustomerProtectedRoute = ({ children }) => {
    const { user: customer, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!customer) {
        return <Navigate to="/user/login" replace />;
    }

    return children;
};

export default CustomerProtectedRoute;
