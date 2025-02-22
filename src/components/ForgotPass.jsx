import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Squares from './Squares';
import { motion } from 'framer-motion';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const isValidPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const ForgotPass = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { server_url } = require('../config/config.json');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing token.', { theme: 'dark' });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!isValidPassword(password)) {
      toast.warning('Password must be at least 8 characters long, include a letter, a number, and a special character.', { theme: 'dark' });
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match.', { theme: 'dark' });
      return;
    }

    try {
      const response = await fetch(`${server_url}/pass/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Password reset successfully! Redirecting to sign-in...', { theme: 'dark' });
        setTimeout(() => navigate('/'), 3000);
      } else {
        toast.error(data.error || 'Failed to reset password.', { theme: 'dark' });
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.', { theme: 'dark' });
    }
  };

  return (
    <div className='h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center'>
      <div className='inset-0 absolute z-10'>
        <Squares speed={0.2} borderColor='#262626' className='z-10' />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className='relative z-50 bg-white p-10 rounded-2xl shadow-xl w-[90%] max-w-md'
      >
        <h1 className='text-3xl font-bold text-center text-gray-800'>Forgot Password</h1>
        <p className='text-gray-600 text-center mt-2'>Reset your password.</p>

        <form className='mt-5' onSubmit={handleSubmit}>
          <div className='mb-5'>
            <label className='block text-sm font-medium text-gray-700'>New Password</label>
            <input 
              type='password' 
              placeholder='Enter your new password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm' 
              required
            />
            <label className='block text-sm font-medium text-gray-700 mt-5'>Confirm New Password</label>
            <input 
              type='password' 
              placeholder='Confirm your new password' 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm' 
              required
            />
          </div>
          
          <motion.button 
            type='submit' 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className='w-full bg-black text-white py-2 rounded-lg text-lg font-semibold shadow-md hover:bg-zinc-900 transition-all duration-200'
          >
            Submit
          </motion.button>
        </form>
      </motion.div>
      
      <ToastContainer 
        position='top-center' 
        autoClose={5000} 
        hideProgressBar={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
        theme='dark' 
        transition={Bounce} 
      />
    </div>
  );
};

export default ForgotPass;