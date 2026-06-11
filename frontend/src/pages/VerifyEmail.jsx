import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full card p-12 text-center"
      >
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-6">
            <Loader2 size={64} className="text-accent animate-spin" />
            <h2 className="text-3xl font-black tracking-tight">Verifying your email...</h2>
            <p className="text-muted-foreground font-medium">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-green-500">Success!</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">{message}</p>
            <Link to="/login" className="btn btn-primary w-full h-14 rounded-2xl text-lg gap-2 mt-4">
              Go to Login
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle size={48} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-red-500">Verification Failed</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">{message}</p>
            <Link to="/signup" className="btn btn-outline w-full h-14 rounded-2xl text-lg mt-4">
              Try Signing Up Again
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
