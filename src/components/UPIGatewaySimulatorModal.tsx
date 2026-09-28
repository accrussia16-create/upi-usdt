import React, { useState, useEffect } from 'react';
import { UPIPaymentOption } from '../types';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Smartphone,
  Check,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

interface UPIGatewaySimulatorModalProps {
  isOpen: boolean;
  link: UPIPaymentOption | {
    id: string;
    title: string;
    upiId: string;
    payeeName: string;
    gatewayUrl?: string;
    startTime?: string;
    expiryTime?: string;
    totalHits?: number;
    isPrimary?: boolean;
    isActive?: boolean;
    isBackup?: boolean;
    priority?: number;
  } | null;
  amount: number;
  userPhone: string;
  onClose: () => void;
  onPaymentSuccess: (utrNumber: string) => void;
}

export const UPIGatewaySimulatorModal: React.FC<UPIGatewaySimulatorModalProps> = ({
  isOpen,
  link,
  amount,
  userPhone,
  onClose,
  onPaymentSuccess
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'checkout' | 'authorizing' | 'success'>('checkout');
  const [generatedUtr, setGeneratedUtr] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('checkout');
      setIsProcessing(false);
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !link) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(link.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setStep('authorizing');

    setTimeout(() => {
      const utr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      setGeneratedUtr(utr);
      setStep('success');
      setIsProcessing(false);
    }, 2200);
  };

  const handleCompleteAndReturn = () => {
    onPaymentSuccess(generatedUtr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl p-5 sm:p-7 text-white relative overflow-hidden">
        {/* Top Header simulation */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              ₹
            </div>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                UPI Gateway Redirect
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  Live
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{link.payeeName}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer countdown */}
        <div className="flex items-center justify-between py-2.5 px-3.5 my-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Session Expires In:
          </span>
          <span className="font-mono font-bold text-amber-400">{timeFormatted}</span>
        </div>

        {step === 'checkout' && (
          <div className="space-y-4">
            {/* Amount Banner */}
            <div className="text-center py-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs text-slate-400">Total Payable Amount</span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-0.5">
                ₹ {amount.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Billing ID: {userPhone}
              </span>
            </div>

            {/* UPI ID Details with 1-Click Copy */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merchant UPI ID (VPA):</span>
                <span className="text-emerald-400 font-mono font-semibold">{link.upiId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merchant Name:</span>
                <span className="text-white font-medium">{link.payeeName}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'VPA Copied!' : 'Copy UPI VPA'}</span>
                </button>
                <a
                  href={`upi://pay?pa=${link.upiId}&pn=${encodeURIComponent(link.payeeName)}&am=${amount}&cu=INR`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open App</span>
                </a>
              </div>
            </div>

            {/* Choose UPI Payment App */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select UPI App to Authorize:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp('gpay')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition ${
                    selectedApp === 'gpay'
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">🟢</span> Google Pay
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp('phonepe')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition ${
                    selectedApp === 'phonepe'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">🟣</span> PhonePe
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp('paytm')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition ${
                    selectedApp === 'paytm'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">🔵</span> Paytm UPI
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp('bhim')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition ${
                    selectedApp === 'bhim'
                      ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">🟠</span> BHIM / Other
                </button>
              </div>
            </div>

            {/* Simulate & Pay Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>Authorize & Pay ₹{amount.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {link.gatewayUrl && (
                <a
                  href={link.gatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Open External Gateway URL</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        )}

        {step === 'authorizing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Communicating with Banking Gateway...</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please do not close or refresh this window while we verify the UPI transaction.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Payment Authorized
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">₹ {amount.toLocaleString()}</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Generated UTR Number:</span>
                <span className="font-mono font-bold text-emerald-300">{generatedUtr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant VPA:</span>
                <span className="font-mono text-slate-300">{link.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">Success</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteAndReturn}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>Auto-Fill UTR & Submit Deposit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
