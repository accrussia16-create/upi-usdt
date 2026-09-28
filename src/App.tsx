/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ExchangeView } from './components/ExchangeView';
import { DepositView } from './components/DepositView';
import { WithdrawalView } from './components/WithdrawalView';
import { OrdersTrackerView } from './components/OrdersTrackerView';
import { AdminPanel } from './components/AdminPanel';
import { AdminPasswordGate } from './components/AdminPasswordGate';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';
import {
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

function MainAppContent() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    switchAccount,
    isAdminUnlocked,
    deposits,
    withdrawals
  } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const totalPending = pendingDeposits + pendingWithdrawals;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar (Optimized for both Desktop & Mobile) */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Main Content Area - pb-24 on mobile for bottom bar comfort */}
      <main className="flex-1 pb-24 md:pb-12">
        {activeTab === 'exchange' && <ExchangeView />}
        {activeTab === 'deposit' && (
          <DepositView onOpenSupport={() => setIsSupportOpen(true)} />
        )}
        {activeTab === 'withdraw' && <WithdrawalView />}
        {activeTab === 'orders' && <OrdersTrackerView />}
        {activeTab === 'admin' && (
          !isAdminUnlocked ? (
            <AdminPasswordGate onUnlockSuccess={() => {}} />
          ) : (
            <AdminPanel />
          )
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Accessible on Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1 shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'deposit'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownCircle className={`w-5 h-5 ${activeTab === 'deposit' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'withdraw'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className={`w-5 h-5 ${activeTab === 'withdraw' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">Withdraw</span>
        </button>

        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'exchange'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className={`w-5 h-5 ${activeTab === 'exchange' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">Swap</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'orders'
              ? 'text-slate-100 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">History</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
            activeTab === 'admin'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-bold">Admin</span>
          {totalPending > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-1 right-3 animate-pulse" />
          )}
        </button>
      </nav>

      {/* Footer (Desktop & Tablet) */}
      <footer className="hidden md:block border-t border-slate-900 bg-slate-950/95 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                ⚡
              </div>
              <span className="font-extrabold text-sm text-white">UPI-Pay & Exchange</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Premier peer-to-peer exchange facilitating instant settlements between EasyPaisa, JazzCash, UPI, and USDT.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Supported Rails</h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• UPI Automated Redirect Gateway (INR)</li>
              <li>• EasyPaisa Wallet (PKR)</li>
              <li>• JazzCash Mobile Money (PKR)</li>
              <li>• Tether USDT (TRC-20 & BEP-20)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Security & Standards</h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• SHA-256 Salted Password Encryption</li>
              <li>• Dynamic UPI Link Expiry Protection</li>
              <li>• Atomic Wallet Ledger Deductions</li>
              <li>• 24/7 Human Operator Escalation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Live Support</h4>
            <p className="text-[11px] text-slate-400 mb-2">
              Assistance with UTR verification, rate lock renewals, or banking escalations.
            </p>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/60 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Open Helpdesk Desk</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <span>© {new Date().getFullYear()} UPI-Pay Global Exchange. All rights reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('exchange')} className="hover:text-slate-300 cursor-pointer">
              Exchange
            </button>
            <button onClick={() => setActiveTab('deposit')} className="hover:text-slate-300 cursor-pointer">
              Deposit
            </button>
            <button onClick={() => setActiveTab('withdraw')} className="hover:text-slate-300 cursor-pointer">
              Withdraw
            </button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-amber-400 cursor-pointer">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
