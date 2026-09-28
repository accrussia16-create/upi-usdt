import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';
import {
  BinanceLogo,
  EasyPaisaLogo,
  JazzCashLogo,
  UPILogo
} from './BrandLogos';

export const WithdrawalView: React.FC = () => {
  const {
    currentUser,
    paymentMethods,
    createWithdrawal,
    setActiveTab
  } = useApp();

  // Method Selection
  const [selectedRail, setSelectedRail] = useState<'binance' | 'easypaisa' | 'jazzcash' | 'upi'>('binance');

  // Match currency to selected channel
  const activeCurrency = selectedRail === 'binance' ? 'USDT' : selectedRail === 'upi' ? 'INR' : 'PKR';

  // Available balance
  const availableBal = useMemo(() => {
    if (!currentUser) return 0;
    const key = activeCurrency.toLowerCase() as keyof typeof currentUser.balance;
    return currentUser.balance[key] || 0;
  }, [currentUser, activeCurrency]);

  const [amount, setAmount] = useState<number>(selectedRail === 'binance' ? 20 : 1000);
  const [accountDetail, setAccountDetail] = useState<string>('');
  const [accountTitle, setAccountTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successWithdrawal, setSuccessWithdrawal] = useState<any | null>(null);

  // Quick Amount Percentage Select
  const handleQuickPercent = (pct: number) => {
    if (availableBal > 0) {
      setAmount(Math.floor((availableBal * pct) / 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('Please log in first.');
      return;
    }

    if (currentUser.status === 'deactivated') {
      setErrorMsg('Account is deactivated.');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMsg('Please enter an amount.');
      return;
    }

    if (amount > availableBal) {
      setErrorMsg(`Insufficient balance. You have ${formatCurrency(availableBal, activeCurrency)}.`);
      return;
    }

    if (!accountDetail.trim()) {
      setErrorMsg('Please enter your destination account or address.');
      return;
    }

    setLoading(true);

    try {
      const methodName = selectedRail === 'binance'
        ? 'Binance Pay / USDT'
        : selectedRail === 'easypaisa'
        ? 'EasyPaisa Wallet'
        : selectedRail === 'jazzcash'
        ? 'JazzCash Wallet'
        : 'UPI Transfer';

      const res = await createWithdrawal({
        methodId: `wth-${selectedRail}`,
        amount,
        currency: activeCurrency,
        fee: 0,
        netPayoutAmount: amount,
        receiverAccount: accountDetail.trim(),
        receiverName: accountTitle.trim() || currentUser.fullName
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to submit withdrawal');
      } else if (res.withdrawal) {
        setSuccessWithdrawal(res.withdrawal);
        setAccountDetail('');
        setAccountTitle('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Withdraw Balance</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Fast cashout to Binance Pay ID, EasyPaisa, JazzCash, or UPI.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Available Balance</span>
              <span className="text-xl font-black text-white font-mono">
                {currentUser ? formatCurrency(availableBal, activeCurrency) : 'Not Logged In'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Payout Rail</span>
            <span className="text-xs font-bold text-emerald-400">{activeCurrency}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. SELECT WITHDRAWAL CHANNEL (AUTHENTIC LOGOS) */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2.5">
              1. Choose Payout Channel
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Binance Pay / USDT */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRail('binance');
                  setAmount(20);
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedRail === 'binance'
                    ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <BinanceLogo className="w-10 h-10" />
                <span className="text-xs font-black text-white">Binance / USDT</span>
                <span className="text-[10px] text-amber-400 font-semibold">Pay ID or TRC20</span>
              </button>

              {/* EasyPaisa */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRail('easypaisa');
                  setAmount(1000);
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedRail === 'easypaisa'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <EasyPaisaLogo className="w-10 h-10" />
                <span className="text-xs font-black text-white">EasyPaisa</span>
                <span className="text-[10px] text-emerald-400 font-semibold">PKR Mobile</span>
              </button>

              {/* JazzCash */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRail('jazzcash');
                  setAmount(1000);
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedRail === 'jazzcash'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <JazzCashLogo className="w-10 h-10" />
                <span className="text-xs font-black text-white">JazzCash</span>
                <span className="text-[10px] text-red-400 font-semibold">PKR Mobile</span>
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRail('upi');
                  setAmount(500);
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedRail === 'upi'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <UPILogo className="w-10 h-10" />
                <span className="text-xs font-black text-white">UPI (INR)</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Any UPI ID</span>
              </button>
            </div>
          </div>

          {/* 2. ENTER AMOUNT */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                2. Enter Amount ({activeCurrency})
              </span>
              <button
                type="button"
                onClick={() => setAmount(availableBal)}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                MAX: {formatCurrency(availableBal, activeCurrency)}
              </button>
            </div>

            <div className="relative mb-2.5">
              <input
                type="number"
                min="1"
                step="any"
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                {activeCurrency}
              </span>
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPercent(25)}
                className="py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-bold cursor-pointer"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(50)}
                className="py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-bold cursor-pointer"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(75)}
                className="py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-bold cursor-pointer"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(100)}
                className="py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400 hover:bg-amber-950/20 text-xs font-bold cursor-pointer"
              >
                100% (ALL)
              </button>
            </div>
          </div>

          {/* 3. RECEIVER DETAILS */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
              3. Receiver Details
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {selectedRail === 'binance' && 'Binance Pay ID or USDT (TRC-20) Address *'}
                {selectedRail === 'easypaisa' && 'EasyPaisa Mobile Number (03xxxxxxxxx) *'}
                {selectedRail === 'jazzcash' && 'JazzCash Mobile Number (03xxxxxxxxx) *'}
                {selectedRail === 'upi' && 'Your UPI ID / VPA (e.g. name@okhdfcbank) *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  selectedRail === 'binance'
                    ? 'e.g. 19283719 or T...'
                    : selectedRail === 'easypaisa' || selectedRail === 'jazzcash'
                    ? '03xxxxxxxxx'
                    : 'yourname@upi'
                }
                value={accountDetail}
                onChange={e => setAccountDetail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Account Title / Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Muhammad Ali"
                value={accountTitle}
                onChange={e => setAccountTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || availableBal <= 0 || amount > availableBal}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Submitting Cashout...'
            ) : (
              <>
                <span>Confirm Withdraw ({formatCurrency(amount, activeCurrency)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold">Withdrawal Requested!</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ref: <span className="font-mono text-white">{successWithdrawal.trackingId}</span>
            </p>

            <div className="my-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-amber-300">
                  {formatCurrency(successWithdrawal.amount, successWithdrawal.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-white truncate max-w-[170px]">
                  {successWithdrawal.receiverAccount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400 uppercase">Pending Dispatch</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessWithdrawal(null);
                setActiveTab('orders');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              View in Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
