import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Lock, User as UserIcon, X, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(phone, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        } else {
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        }
      } else {
        const res = await register(phone, password, fullName);
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else {
          setSuccessMsg('Account created with encrypted credentials!');
          setTimeout(() => {
            onClose();
          }, 700);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Sign In to UPI-Pay' : 'Create Free Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access your multi-currency wallet, UPI deposits & orders'
              : 'Sign up using your phone number and secure password'}
          </p>
        </div>

        {/* Demo Fast Autofill Chips */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>⚡ Demo 1-Click Credentials</span>
            <span className="text-emerald-400 font-normal">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('+92 312 9876543', 'user123')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs transition cursor-pointer"
            >
              <div className="font-semibold text-emerald-400">Client Demo</div>
              <div className="text-[10px] text-slate-400 font-mono">+92 312 9876543</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('+92 300 1234567', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-left text-xs transition cursor-pointer"
            >
              <div className="font-semibold text-amber-400">Admin Demo</div>
              <div className="text-[10px] text-slate-400 font-mono">+92 300 1234567</div>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Hassan"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. +92 300 1234567 or +91 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Include country code for Pakistani or Indian numbers.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Passwords securely salted & hashed using SHA-256</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Securing Session...' : mode === 'login' ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
