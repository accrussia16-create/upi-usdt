import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowDownUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

export const ExchangeView: React.FC = () => {
  const {
    currentUser,
    paymentMethods,
    exchangeRates,
    createExchangeOrder,
    setActiveTab
  } = useApp();

  const activeMethods = useMemo(() => paymentMethods.filter(m => m.isActive), [paymentMethods]);

  const [fromMethodId, setFromMethodId] = useState<string>(() => {
    const ep = activeMethods.find(m => m.code === 'easypaisa');
    return ep ? ep.id : (activeMethods[0]?.id || '');
  });

  const [toMethodId, setToMethodId] = useState<string>(() => {
    const upi = activeMethods.find(m => m.code === 'upi');
    return upi ? upi.id : (activeMethods[1]?.id || '');
  });

  const [sendAmount, setSendAmount] = useState<number>(5000);
  const [receiverAccount, setReceiverAccount] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const fromMethod = activeMethods.find(m => m.id === fromMethodId) || activeMethods[0];
  const toMethod = activeMethods.find(m => m.id === toMethodId) || activeMethods[1] || activeMethods[0];

  // Rate calculation
  const { calculatedRate, receiveAmount } = useMemo(() => {
    if (!fromMethod || !toMethod) return { calculatedRate: 1, receiveAmount: 0 };
    const fromCurr = fromMethod.currency;
    const toCurr = toMethod.currency;

    let rate = 1;
    if (fromCurr !== toCurr) {
      const pair = `${fromCurr}_TO_${toCurr}`;
      const found = exchangeRates.find(r => r.pair === pair && r.isActive);
      if (found) {
        rate = found.rate;
      } else {
        const invPair = `${toCurr}_TO_${fromCurr}`;
        const invFound = exchangeRates.find(r => r.pair === invPair && r.isActive);
        if (invFound && invFound.rate > 0) {
          rate = Number((1 / invFound.rate).toFixed(5));
        }
      }
    }
    const raw = sendAmount * rate;
    return { calculatedRate: rate, receiveAmount: Number(raw.toFixed(2)) };
  }, [fromMethod, toMethod, sendAmount, exchangeRates]);

  const handleSwap = () => {
    const temp = fromMethodId;
    setFromMethodId(toMethodId);
    setToMethodId(temp);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('Please log in to exchange.');
      return;
    }

    if (!receiverAccount.trim()) {
      setErrorMsg(`Please enter your receiving ${toMethod?.receiverFieldLabel || 'account'}.`);
      return;
    }

    setLoading(true);

    try {
      const res = await createExchangeOrder({
        fromMethodId: fromMethod.id,
        toMethodId: toMethod.id,
        sendAmount,
        receiveAmount,
        exchangeRate: calculatedRate,
        feeAmount: 0,
        fromCurrency: fromMethod.currency,
        toCurrency: toMethod.currency,
        receiverAccount: receiverAccount.trim(),
        receiverName: receiverName.trim() || undefined
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create order');
      } else if (res.order) {
        setCreatedOrder(res.order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Exchange error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Instant Currency Swap</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Fast swap between PKR, INR (UPI), and USDT Crypto.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {/* YOU SEND */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase">You Pay</span>
              <select
                value={fromMethodId}
                onChange={e => setFromMethodId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold cursor-pointer"
              >
                {activeMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.name} ({m.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={sendAmount || ''}
                onChange={e => setSendAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-black text-white focus:outline-none font-mono"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                {fromMethod?.currency}
              </span>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleSwap}
              className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md cursor-pointer transition active:scale-95"
            >
              <ArrowDownUp className="w-4 h-4 font-bold" />
            </button>
          </div>

          {/* YOU RECEIVE */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase">You Get</span>
              <select
                value={toMethodId}
                onChange={e => setToMethodId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold cursor-pointer"
              >
                {activeMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.name} ({m.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                readOnly
                value={receiveAmount.toLocaleString()}
                className="w-full bg-transparent text-2xl font-black text-emerald-400 focus:outline-none font-mono cursor-default"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-xs text-emerald-400">
                {toMethod?.currency}
              </span>
            </div>
          </div>

          {/* RECEIVER FIELD */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white mb-1">
              {toMethod?.receiverFieldLabel || 'Receiver Account / Address'} *
            </label>
            <input
              type="text"
              required
              placeholder={toMethod?.receiverFieldPlaceholder || 'Enter details'}
              value={receiverAccount}
              onChange={e => setReceiverAccount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            {loading ? 'Creating...' : `Swap Now (${formatCurrency(sendAmount, fromMethod?.currency)} ➔ ${formatCurrency(receiveAmount, toMethod?.currency)})`}
          </button>
        </form>
      </div>

      {/* Order Created Modal */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold">Exchange Order Placed</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{createdOrder.trackingCode}</p>

            <div className="my-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Transfer To:</span>
                <span className="font-mono text-emerald-300 font-bold">{fromMethod?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">You Receive:</span>
                <span className="font-bold text-white">
                  {formatCurrency(createdOrder.receiveAmount, createdOrder.toCurrency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setCreatedOrder(null);
                setActiveTab('orders');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Track Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
