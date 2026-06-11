import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Google Login failed');
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = googleClientId && 
    googleClientId !== "your_google_client_id_here.apps.googleusercontent.com" &&
    !googleClientId.includes("your_google_client_id_here");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[400px] space-y-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4">STUDY<span className="text-accent">VAULT</span></h1>
          <p className="text-muted-foreground font-medium">Log in to your second brain</p>
        </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="input h-12 rounded-xl" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                  <Link to="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Forgot?</Link>
                </div>
                <input 
                  type="password" 
                  required 
                  className="input h-12 rounded-xl" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full h-14 rounded-xl text-lg tracking-tight">
              Continue
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          New here? <Link to="/signup" className="text-foreground font-bold hover:text-accent transition-colors">Create an account</Link>
        </p>
    </div>
  );
};

export default Login;
