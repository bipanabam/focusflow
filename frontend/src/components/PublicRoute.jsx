// PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
    const { auth, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to home
    if (auth) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, show the public page (login/register)
    return children;
};

export default PublicRoute;
