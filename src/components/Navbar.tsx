import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Headphones
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSupport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenSupport }) => {
  const {
    currentUser,
    users,
    logout,
    switchAccount,
    activeTab,
    setActiveTab,
    deposits,
    withdrawals,
    exchangeOrders
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);

  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const totalPending = pendingDeposits + pendingWithdrawals;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20">
              ⚡
            </div>
            <div className="text-left">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                UPI-Pay
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase">Recharge & Cashout</span>
            </div>
          </button>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={() => setActiveTab('exchange')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'exchange'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer relative ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
              {totalPending > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[9px] font-black rounded-full bg-red-500 text-white">
                  {totalPending}
                </span>
              )}
            </button>
          </nav>

          {/* Right Header Area */}
          <div className="flex items-center gap-2">
            {/* Support Desk */}
            <button
              onClick={onOpenSupport}
              title="Support Desk"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Balance Badge */}
                <div className="relative">
                  <button
                    onClick={() => setShowWalletDetails(!showWalletDetails)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-left transition cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Balance</div>
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        ₨{currentUser.balance.pkr.toLocaleString()}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletDetails && (
                    <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs">
                      <span className="font-bold text-slate-300 block mb-2">My Balances</span>
                      <div className="space-y-1.5 mb-3 font-mono">
                        <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                          <span className="text-slate-400">PKR</span>
                          <span className="font-bold text-white">₨{currentUser.balance.pkr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                          <span className="text-slate-400">INR</span>
                          <span className="font-bold text-emerald-300">₹{currentUser.balance.inr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                          <span className="text-slate-400">USDT</span>
                          <span className="font-bold text-amber-300">${currentUser.balance.usdt.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('deposit');
                            setShowWalletDetails(false);
                          }}
                          className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-center cursor-pointer"
                        >
                          + Deposit
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('withdraw');
                            setShowWalletDetails(false);
                          }}
                          className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-medium rounded-lg text-center cursor-pointer"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account / User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.role === 'admin' ? 'A' : 'U'}
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs">
                      <div className="p-2 border-b border-slate-800 mb-2">
                        <span className="font-bold text-white block">{currentUser.fullName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{currentUser.phone}</span>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full mt-2 py-1.5 rounded-lg bg-red-950/50 text-red-300 border border-red-800/40 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
