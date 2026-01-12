import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import API from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = ({ text }) => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            await API.post('/auth/google/', {
                credential: credentialResponse.credential,
            });

            await refreshUser();
            toast.success('Logged in with Google');
            navigate('/');
        } catch {
            toast.error('Google authentication failed');
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Google login failed')}
            text={text}
        />
    );
};

export default GoogleAuthButton;
