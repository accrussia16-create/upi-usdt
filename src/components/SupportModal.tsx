import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Headphones,
  Mail,
  Send,
  MessageCircle,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { supportConfig } = useApp();

  if (!isOpen) return null;

  const cleanWaNumber = supportConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(supportConfig.whatsappMessage)}`;
  const cleanTelegram = supportConfig.telegramHandle.replace('@', '');
  const tgUrl = `https://t.me/${cleanTelegram}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <Headphones className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">24/7 Exchange Support Desk</h2>
          <p className="text-xs text-slate-400 mt-1">
            Live operators available for fast deposit verification, UPI routing assistance, and trade settlement.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* WhatsApp Direct */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 text-white flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                  WhatsApp Support
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {supportConfig.whatsappNumber}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400" />
          </a>

          {/* Telegram Channel */}
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 text-white flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300">
                  Telegram Official Desk
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {supportConfig.telegramHandle}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400" />
          </a>

          {/* Email Support */}
          <a
            href={`mailto:${supportConfig.supportEmail}?subject=UPI-Pay Support Inquiry`}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-slate-200">
                  Official Email Helpdesk
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {supportConfig.supportEmail}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Working Hours:
          </span>
          <span className="text-white font-semibold">{supportConfig.helpdeskWorkingHours}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
        >
          Close Helpdesk
        </button>
      </div>
    </div>
  );
};
