import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ManualUPIItem, UPILinkItem, OptionAvailability } from '../types';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Wallet,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Clock,
  ArrowLeft,
  Link as LinkIcon,
  CreditCard,
  Radio
} from 'lucide-react';
import { formatCurrency, evaluateTimer } from '../utils/crypto';
import { UPIGatewaySimulatorModal } from './UPIGatewaySimulatorModal';
import {
  EasyPaisaLogo,
  JazzCashLogo,
  UPILogo,
  USDTLogo
} from './BrandLogos';

interface DepositViewProps {
  onOpenSupport: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({ onOpenSupport }) => {
  const {
    currentUser,
    paymentMethods,
    manualUPIList,
    autoGatewayConfig,
    upiLinksList,
    upiChannelsAvailability,
    createDeposit,
    setActiveTab
  } = useApp();

  // Selected Channel
  const [selectedChannel, setSelectedChannel] = useState<'upi' | 'easypaisa' | 'jazzcash' | 'usdt'>('upi');
  
  // UPI Sub-Option: 'manual' | 'auto' | 'link' (Default to 'manual' or null if user hasn't selected yet)
  const [selectedUPIOption, setSelectedUPIOption] = useState<'manual' | 'auto' | 'link'>('manual');
  
  // Amount
  const [amount, setAmount] = useState<number>(1000);

  // Selected Manual UPI ID
  const [selectedManualId, setSelectedManualId] = useState<string>('');

  // Selected UPI Link
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');

  // Form Fields
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successDeposit, setSuccessDeposit] = useState<any | null>(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Real-time tick every second to keep live countdown timers fresh
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCurrency = selectedChannel === 'upi' ? 'INR' : selectedChannel === 'usdt' ? 'USDT' : 'PKR';

  // Quick Amount presets
  const quickAmounts = activeCurrency === 'INR'
    ? [200, 500, 1000, 2000, 5000, 10000]
    : activeCurrency === 'USDT'
    ? [10, 25, 50, 100, 250, 500]
    : [500, 1000, 2500, 5000, 10000, 25000];

  // Visible Manual UPI list (respecting hidden)
  const visibleManualList = useMemo(() => {
    return manualUPIList.filter(item => {
      if (item.availability === 'hidden' && currentUser?.role !== 'admin') {
        return false;
      }
      return true;
    });
  }, [manualUPIList, currentUser]);

  // Set default manual item if not set
  useEffect(() => {
    if (visibleManualList.length > 0 && (!selectedManualId || !visibleManualList.some(i => i.id === selectedManualId))) {
      setSelectedManualId(visibleManualList[0].id);
    }
  }, [visibleManualList, selectedManualId]);

  const activeManualItem = useMemo(() => {
    return visibleManualList.find(i => i.id === selectedManualId) || visibleManualList[0];
  }, [visibleManualList, selectedManualId]);

  // Visible UPI Links (respecting hidden and auto-remove after expiry)
  const visibleUPILinks = useMemo(() => {
    return upiLinksList.filter(link => {
      if (link.availability === 'hidden' && currentUser?.role !== 'admin') {
        return false;
      }
      const evalRes = evaluateTimer(link.startTime, link.expiryTime, link.afterExpiryAction, link.availability);
      if (evalRes.shouldAutoRemove && currentUser?.role !== 'admin') {
        return false;
      }
      return true;
    });
  }, [upiLinksList, currentUser, currentTime]);

  // Set default UPI link if not set
  useEffect(() => {
    if (visibleUPILinks.length > 0 && (!selectedLinkId || !visibleUPILinks.some(l => l.id === selectedLinkId))) {
      setSelectedLinkId(visibleUPILinks[0].id);
    }
  }, [visibleUPILinks, selectedLinkId]);

  const activeUPILink = useMemo(() => {
    return visibleUPILinks.find(l => l.id === selectedLinkId) || visibleUPILinks[0];
  }, [visibleUPILinks, selectedLinkId]);

  // Non-UPI config
  const nonUPIMethodConfig = useMemo(() => {
    if (selectedChannel === 'easypaisa') return paymentMethods.find(m => m.code === 'easypaisa');
    if (selectedChannel === 'jazzcash') return paymentMethods.find(m => m.code === 'jazzcash');
    if (selectedChannel === 'usdt') return paymentMethods.find(m => m.code === 'usdt_trc20');
    return null;
  }, [paymentMethods, selectedChannel]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Handle Auto Gateway Checkout Success
  const handleAutoGatewaySuccess = async (generatedUtr: string) => {
    setIsGatewayModalOpen(false);
    setUtrNumber(generatedUtr);
    setIsSubmitting(true);

    try {
      const res = await createDeposit({
        methodId: 'method-upi-01',
        amount,
        currency: 'INR',
        fee: 0,
        finalCreditAmount: amount,
        upiSubType: 'auto_gateway',
        upiIdUsed: autoGatewayConfig.merchantId,
        utrNumber: generatedUtr,
        senderAccount: currentUser?.phone,
        proofNote: `${autoGatewayConfig.providerName} Auto-Approve`,
        isAutoApproved: autoGatewayConfig.isAutoApprove
      });

      if (res.success && res.deposit) {
        setSuccessDeposit(res.deposit);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Auto payment error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Manual / UPI Link / Non-UPI Deposit Proof
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('Please log in with your phone number to submit deposit.');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid deposit amount.');
      return;
    }

    if (!utrNumber.trim()) {
      setErrorMsg('Please enter your 12-digit UTR or Transaction ID.');
      return;
    }

    // Availability validation for UPI
    if (selectedChannel === 'upi') {
      if (selectedUPIOption === 'manual') {
        if (!activeManualItem || activeManualItem.availability === 'unavailable') {
          setErrorMsg('This Manual UPI ID is temporarily unavailable. Please select another UPI option.');
          return;
        }
      } else if (selectedUPIOption === 'link') {
        if (!activeUPILink) {
          setErrorMsg('No active UPI link found.');
          return;
        }
        const evalRes = evaluateTimer(activeUPILink.startTime, activeUPILink.expiryTime, activeUPILink.afterExpiryAction, activeUPILink.availability);
        if (!evalRes.isAvailable) {
          setErrorMsg('This UPI link has expired or is unavailable. Please select another link.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      let upiIdUsed: string | undefined;
      let upiLinkName: string | undefined;

      if (selectedChannel === 'upi') {
        if (selectedUPIOption === 'manual') {
          upiIdUsed = activeManualItem?.upiId;
        } else if (selectedUPIOption === 'link') {
          upiLinkName = activeUPILink?.name;
          upiIdUsed = activeUPILink?.url;
        }
      }

      const res = await createDeposit({
        methodId: nonUPIMethodConfig?.id || 'method-upi-01',
        amount,
        currency: activeCurrency,
        fee: 0,
        finalCreditAmount: amount,
        upiSubType: selectedChannel === 'upi' ? (selectedUPIOption === 'link' ? 'upi_link' : selectedUPIOption === 'auto' ? 'auto_gateway' : 'manual') : undefined,
        upiIdUsed,
        upiLinkName,
        utrNumber: utrNumber.trim(),
        senderAccount: senderAccount.trim() || undefined,
        proofNote: selectedChannel === 'upi'
          ? (selectedUPIOption === 'manual' ? `Manual UPI: ${activeManualItem?.name}` : `UPI Link: ${activeUPILink?.name}`)
          : undefined,
        isAutoApproved: false
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to submit deposit');
      } else if (res.deposit) {
        setSuccessDeposit(res.deposit);
        setUtrNumber('');
        setSenderAccount('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Deposit submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
      {/* Gaming Style Top-Up Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FAST WALLET TOP-UP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Deposit Balance</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* 1. SELECT PAYMENT CHANNEL */}
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2.5">
            Select Deposit Channel
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* UPI Tile */}
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('upi');
                if (activeCurrency !== 'INR') setAmount(1000);
              }}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedChannel === 'upi'
                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <UPILogo className="w-10 h-10" />
              <span className="text-xs font-black text-white">UPI (INR)</span>
              <span className="text-[10px] text-emerald-400 font-semibold">GPay • PhonePe</span>
            </button>

            {/* EasyPaisa Tile */}
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('easypaisa');
                if (activeCurrency !== 'PKR') setAmount(2500);
              }}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedChannel === 'easypaisa'
                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <EasyPaisaLogo className="w-10 h-10" />
              <span className="text-xs font-black text-white">EasyPaisa</span>
              <span className="text-[10px] text-emerald-400 font-semibold">PKR Wallet</span>
            </button>

            {/* JazzCash Tile */}
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('jazzcash');
                if (activeCurrency !== 'PKR') setAmount(2500);
              }}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedChannel === 'jazzcash'
                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <JazzCashLogo className="w-10 h-10" />
              <span className="text-xs font-black text-white">JazzCash</span>
              <span className="text-[10px] text-red-400 font-semibold">PKR Mobile</span>
            </button>

            {/* USDT Tile */}
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('usdt');
                if (activeCurrency !== 'USDT') setAmount(50);
              }}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedChannel === 'usdt'
                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <USDTLogo className="w-10 h-10" />
              <span className="text-xs font-black text-white">USDT Crypto</span>
              <span className="text-[10px] text-teal-400 font-semibold">TRC-20</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* UPI SECTION: 3 OPTIONS (MANUAL, AUTO, UPI LINK)          */}
        {/* REST ALL OPENS ON CLICKING ANY OF THESE                  */}
        {/* ======================================================== */}
        {selectedChannel === 'upi' ? (
          <div className="space-y-5">
            {/* The 3 UPI Choice Cards */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Choose UPI Deposit Method:
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  Click any option to open
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. MANUAL UPI CARD */}
                {!(upiChannelsAvailability.manual === 'hidden' && currentUser?.role !== 'admin') && (
                  <div
                    onClick={() => {
                      if (upiChannelsAvailability.manual === 'unavailable') {
                        setErrorMsg('Manual UPI is currently Not Available Right Now. Please choose another option.');
                        return;
                      }
                      setErrorMsg(null);
                      setSelectedUPIOption('manual');
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative text-left ${
                      upiChannelsAvailability.manual === 'unavailable'
                        ? 'bg-slate-950/60 border-red-900/40 opacity-70'
                        : selectedUPIOption === 'manual'
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400">
                        MANUAL
                      </span>
                      {upiChannelsAvailability.manual === 'unavailable' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                          Unavailable
                        </span>
                      ) : (
                        <Radio className={`w-3.5 h-3.5 ${selectedUPIOption === 'manual' ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Manual UPI</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {upiChannelsAvailability.manual === 'unavailable' ? 'Not Available Right Now' : 'Direct transfer to UPI ID & submit UTR'}
                    </p>
                  </div>
                )}

                {/* 2. AUTO GATEWAY CARD */}
                {!(upiChannelsAvailability.auto === 'hidden' && currentUser?.role !== 'admin') && (
                  <div
                    onClick={() => {
                      if (upiChannelsAvailability.auto === 'unavailable') {
                        setErrorMsg('Auto Gateway is currently Not Available Right Now. Please choose another option.');
                        return;
                      }
                      setErrorMsg(null);
                      setSelectedUPIOption('auto');
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative text-left ${
                      upiChannelsAvailability.auto === 'unavailable'
                        ? 'bg-slate-950/60 border-red-900/40 opacity-70'
                        : selectedUPIOption === 'auto'
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                        AUTO [FAST]
                      </span>
                      {upiChannelsAvailability.auto === 'unavailable' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                          Unavailable
                        </span>
                      ) : (
                        <Radio className={`w-3.5 h-3.5 ${selectedUPIOption === 'auto' ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      <span>Auto Gateway</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {upiChannelsAvailability.auto === 'unavailable' ? 'Not Available Right Now' : 'Official API provider with auto-credit'}
                    </p>
                  </div>
                )}

                {/* 3. UPI LINK CARD */}
                {!(upiChannelsAvailability.link === 'hidden' && currentUser?.role !== 'admin') && (
                  <div
                    onClick={() => {
                      if (upiChannelsAvailability.link === 'unavailable') {
                        setErrorMsg('UPI Links option is currently Not Available Right Now. Please choose another option.');
                        return;
                      }
                      setErrorMsg(null);
                      setSelectedUPIOption('link');
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative text-left ${
                      upiChannelsAvailability.link === 'unavailable'
                        ? 'bg-slate-950/60 border-red-900/40 opacity-70'
                        : selectedUPIOption === 'link'
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        UPI LINK
                      </span>
                      {upiChannelsAvailability.link === 'unavailable' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                          Unavailable
                        </span>
                      ) : (
                        <Radio className={`w-3.5 h-3.5 ${selectedUPIOption === 'link' ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-purple-400" />
                      <span>UPI Links</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {upiChannelsAvailability.link === 'unavailable' ? 'Not Available Right Now' : 'Multiple timed links (Link 1, Link 2...)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AMOUNT INPUT & PRESET CHIPS */}
            <div className="pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Top-Up Amount ({activeCurrency})
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ₹{amount.toLocaleString()}
                </span>
              </div>

              <div className="relative mb-2.5">
                <input
                  type="number"
                  min="100"
                  value={amount || ''}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                  {activeCurrency}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      amount === val
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₹{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================== */}
            {/* VIEW 1: MANUAL UPI (REST OPENS ON CLICKING MANUAL)         */}
            {/* ========================================================== */}
            {selectedUPIOption === 'manual' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Manual UPI Transfer</h4>
                      <p className="text-[11px] text-slate-400">Transfer from any UPI app & enter UTR below</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    MANUAL APPROVE
                  </span>
                </div>

                {/* If multiple Manual UPI IDs exist, allow user to pick */}
                {visibleManualList.length > 1 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Select UPI ID:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visibleManualList.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedManualId(item.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                            selectedManualId === item.id
                              ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white truncate">{item.name}</div>
                          <div className="font-mono text-[11px] text-emerald-300 truncate">{item.upiId}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Manual UPI Display Box */}
                {activeManualItem ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Official UPI ID / VPA:</span>
                        <span className="font-mono font-black text-emerald-300 text-sm sm:text-base select-all">
                          {activeManualItem.upiId}
                        </span>
                        {activeManualItem.payeeName && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Payee: <strong className="text-white">{activeManualItem.payeeName}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(activeManualItem.upiId, 'manual_upi')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        {copied === 'manual_upi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'manual_upi' ? 'Copied' : 'Copy UPI'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                      💡 <strong>Instructions:</strong> Open Google Pay, PhonePe, Paytm, or BHIM. Send <strong>₹{amount.toLocaleString()}</strong> to the UPI ID above. Then enter the 12-digit UTR below.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-300 p-3 bg-amber-950/40 rounded-xl">
                    No active manual UPI ID configured by admin.
                  </div>
                )}

                {/* UTR Form */}
                <form onSubmit={handleSubmitDeposit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      12-Digit UTR / Transaction ID <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 409182379102"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Sender UPI ID or Phone (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okaxis"
                      value={senderAccount}
                      onChange={e => setSenderAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Submitting...' : `Submit Payment Proof (₹${amount.toLocaleString()})`}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================== */}
            {/* VIEW 2: AUTO GATEWAY (REST OPENS ON CLICKING AUTO)         */}
            {/* ========================================================== */}
            {selectedUPIOption === 'auto' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Official Auto Payment Gateway</h4>
                      <p className="text-[11px] text-emerald-400/90 font-medium">91Jeeto Gaming Style API Integration</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>INSTANT AUTO CREDIT</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payment Provider:</span>
                    <span className="font-bold text-white">{autoGatewayConfig.providerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">API Connection Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Connected & Active</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Deposit Amount:</span>
                    <span className="font-mono font-black text-emerald-300 text-sm">₹{amount.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  ⚡ When you click below, the secure payment gateway opens. Once completed, your wallet balance will be <strong>credited immediately</strong> without waiting for manual admin approval.
                </p>

                <button
                  type="button"
                  onClick={() => setIsGatewayModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/30 transition active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Pay ₹{amount.toLocaleString()} via Auto Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ========================================================== */}
            {/* VIEW 3: UPI LINKS (REST OPENS ON CLICKING UPI LINK)        */}
            {/* MULTIPLE LINKS WITH OWN LIVE COUNTDOWN TIMERS              */}
            {/* ========================================================== */}
            {selectedUPIOption === 'link' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Multiple UPI Links</h4>
                      <p className="text-[11px] text-slate-400">Select Link 1, Link 2 etc. Each has its own timer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    TIMED LINKS
                  </span>
                </div>

                {/* Multiple Links List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Available UPI Payment Links:
                  </span>

                  {visibleUPILinks.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-900 text-xs text-amber-300">
                      No UPI links configured yet by admin.
                    </div>
                  ) : (
                    visibleUPILinks.map((linkItem) => {
                      const evalRes = evaluateTimer(linkItem.startTime, linkItem.expiryTime, linkItem.afterExpiryAction, linkItem.availability);
                      const isSelected = selectedLinkId === linkItem.id;
                      const isUnavailable = linkItem.availability === 'unavailable' || !evalRes.isAvailable;

                      return (
                        <div
                          key={linkItem.id}
                          className={`p-3.5 rounded-2xl border transition ${
                            isSelected
                              ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          } ${isUnavailable ? 'opacity-50' : ''}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-white text-sm">
                                  {linkItem.name}
                                </span>

                                {/* Own Countdown Timer Badge */}
                                {evalRes.isAvailable ? (
                                  <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-500/40 flex items-center gap-1">
                                    <Clock className="w-3 h-3 animate-pulse text-purple-400" />
                                    <span>{evalRes.countdownFormatted} left</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded-full border border-red-500/40">
                                    {linkItem.availability === 'unavailable' ? 'Unavailable' : 'Expired'}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400">
                                {linkItem.instructions || 'Click Open UPI Link to pay, then enter UTR below.'}
                              </p>
                            </div>

                            {/* Open UPI Link Button */}
                            <div className="flex items-center gap-2">
                              <a
                                href={linkItem.url || 'https://paytm.me'}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setSelectedLinkId(linkItem.id)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow ${
                                  isUnavailable
                                    ? 'bg-slate-800 text-slate-500 pointer-events-none'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                                }`}
                              >
                                <span>Open UPI Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* UTR Form for Selected Link */}
                <form onSubmit={handleSubmitDeposit} className="space-y-3 pt-2 border-t border-slate-850">
                  <div className="text-xs text-slate-300">
                    Selected: <strong className="text-purple-300">{activeUPILink?.name || 'UPI Link'}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Enter 12-Digit UTR / Transaction ID from Payment <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 409182379102"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Sender Phone or UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={senderAccount}
                      onChange={e => setSenderAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-600/25 cursor-pointer disabled:opacity-50 transition active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Submitting...' : `Submit Payment Proof (₹${amount.toLocaleString()})`}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* NON-UPI METHODS (EASYPAISA, JAZZCASH, USDT)              */
          /* ======================================================== */
          <div className="space-y-4">
            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Deposit Amount ({activeCurrency})
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatCurrency(amount, activeCurrency)}
                </span>
              </div>

              <div className="relative mb-2.5">
                <input
                  type="number"
                  min="1"
                  value={amount || ''}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                  {activeCurrency}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      amount === val
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {activeCurrency === 'USDT' ? `$${val}` : `₨${val.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details Box */}
            {nonUPIMethodConfig && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  {selectedChannel === 'easypaisa' && <EasyPaisaLogo className="w-6 h-6" />}
                  {selectedChannel === 'jazzcash' && <JazzCashLogo className="w-6 h-6" />}
                  {selectedChannel === 'usdt' && <USDTLogo className="w-6 h-6" />}
                  <span>Transfer to official {nonUPIMethodConfig.name}:</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-slate-400 block font-medium">Account / Address:</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm select-all">
                      {nonUPIMethodConfig.accountNumber}
                    </span>
                    {nonUPIMethodConfig.accountTitle && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Title: <strong className="text-white">{nonUPIMethodConfig.accountTitle}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(nonUPIMethodConfig.accountNumber, 'acc_num')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    {copied === 'acc_num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'acc_num' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  {nonUPIMethodConfig.instructions}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmitDeposit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      {selectedChannel === 'usdt' ? 'Transaction Hash (TxID) *' : 'TRX ID / TID from SMS *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedChannel === 'usdt' ? 'e.g. 7f8a9b2c...' : 'e.g. 9182740192'}
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Your Sender Mobile Number / Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 03451234567"
                      value={senderAccount}
                      onChange={e => setSenderAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Submitting...' : `Submit Payment Proof (${formatCurrency(amount, activeCurrency)})`}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {successDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold">
              {successDeposit.status === 'approved' ? 'Top-Up Successful!' : 'Deposit Submitted!'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking Ref: <span className="font-mono text-white">{successDeposit.trackingId}</span>
            </p>

            <div className="my-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-300">
                  {formatCurrency(successDeposit.amount, successDeposit.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {successDeposit.status === 'approved' ? 'Credited to Balance' : 'Pending Admin Verification'}
                </span>
              </div>
              {successDeposit.utrNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono text-slate-300">{successDeposit.utrNumber}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSuccessDeposit(null);
                setActiveTab('orders');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              View in Transaction History
            </button>
          </div>
        </div>
      )}

      {/* Auto Gateway Simulator */}
      <UPIGatewaySimulatorModal
        isOpen={isGatewayModalOpen}
        link={{
          id: autoGatewayConfig.id,
          title: autoGatewayConfig.providerName,
          upiId: autoGatewayConfig.merchantId,
          payeeName: autoGatewayConfig.providerName,
          gatewayUrl: 'https://checkout.upipay.network'
        }}
        amount={amount}
        userPhone={currentUser?.phone || ''}
        onClose={() => setIsGatewayModalOpen(false)}
        onPaymentSuccess={handleAutoGatewaySuccess}
      />
    </div>
  );
};
