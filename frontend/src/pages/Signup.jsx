import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Google Signup failed');
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
          <p className="text-muted-foreground font-medium">Create your digital second brain</p>
        </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="input h-12 rounded-xl" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leonardo da Vinci"
                />
              </div>

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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</label>
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
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Already a member? <Link to="/login" className="text-foreground font-bold hover:text-accent transition-colors">Log in</Link>
        </p>
    </div>
  );
};

export default Signup;
