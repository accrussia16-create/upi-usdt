import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, KeyRound, ArrowRight } from 'lucide-react';

interface AdminPasswordGateProps {
  onUnlockSuccess?: () => void;
}

export const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({ onUnlockSuccess }) => {
  const { unlockAdminWithPassword, switchAccount, adminSecurityConfig, currentUser } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = unlockAdminWithPassword(password);
    if (success) {
      if (currentUser?.role !== 'admin') {
        switchAccount('USR-ADMIN-01');
      }
      if (onUnlockSuccess) onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect admin password. (Default is admin123)');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
          <KeyRound className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Admin Panel Locked</h2>
          <p className="text-xs text-slate-400 mt-1">
            Please enter your administrator password to access the Central Admin Dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter admin password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium mt-1 block">
              Default Master Password: <strong className="font-mono text-white">admin123</strong>
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Authorized administrator access only. All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
};
