import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      toast.success('Logged out successfully.', { theme: 'dark' });
    } else {
      toast.warning('No active session found.', { theme: 'dark' });
    }

    navigate('/');
  }, [navigate]);

  return null;
};

export default Logout;