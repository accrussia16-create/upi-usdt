import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExchangeOrder,
  DepositTransaction,
  WithdrawalTransaction,
  OrderStatus,
  TransactionStatus,
  WithdrawalStatus
} from '../types';
import {
  Search,
  Filter,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

export const OrdersTrackerView: React.FC = () => {
  const {
    currentUser,
    exchangeOrders,
    deposits,
    withdrawals
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'exchange' | 'deposits' | 'withdrawals'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<{
    type: 'order' | 'deposit' | 'withdrawal';
    data: any;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter records based on role (admins see all, users see their own)
  const isSuperAdmin = currentUser?.role === 'admin';

  const userOrders = exchangeOrders.filter(o => isSuperAdmin || o.userId === currentUser?.id || o.userPhone === currentUser?.phone);
  const userDeposits = deposits.filter(d => isSuperAdmin || d.userId === currentUser?.id || d.userPhone === currentUser?.phone);
  const userWithdrawals = withdrawals.filter(w => isSuperAdmin || w.userId === currentUser?.id || w.userPhone === currentUser?.phone);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
            <CheckCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30 uppercase">
            <XCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Orders & Transactions History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status tracking for exchange trades, UPI deposits, and wallet payouts.
          </p>
        </div>

        {/* Tab Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({userOrders.length + userDeposits.length + userWithdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'exchange' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Exchanges ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'deposits' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposits ({userDeposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'withdrawals' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdrawals ({userWithdrawals.length})
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Phone, UTR, or Account..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved / Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Records List */}
      <div className="space-y-3">
        {/* Exchange Orders Section */}
        {(activeTab === 'all' || activeTab === 'exchange') &&
          userOrders
            .filter(o => {
              if (statusFilter !== 'all' && o.status !== statusFilter) return false;
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                o.trackingCode.toLowerCase().includes(term) ||
                o.userPhone.includes(term) ||
                o.fromMethodName.toLowerCase().includes(term) ||
                o.toMethodName.toLowerCase().includes(term) ||
                (o.receiverAccount && o.receiverAccount.toLowerCase().includes(term))
              );
            })
            .map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {order.trackingCode}
                      </span>
                      <button
                        onClick={() => handleCopy(order.trackingCode)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                        title="Copy tracking code"
                      >
                        {copiedId === order.trackingCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{formatCurrency(order.sendAmount, order.fromCurrency)} ({order.fromMethodName})</span>
                      <span className="text-emerald-400">➔</span>
                      <span className="text-emerald-300 font-bold">{formatCurrency(order.receiveAmount, order.toCurrency)} ({order.toMethodName})</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Payout to: <span className="font-mono text-slate-300">{order.receiverAccount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {renderStatusBadge(order.status)}

                  <button
                    onClick={() => setSelectedReceipt({ type: 'order', data: order })}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                </div>
              </div>
            ))}

        {/* Deposit Records Section */}
        {(activeTab === 'all' || activeTab === 'deposits') &&
          userDeposits
            .filter(d => {
              if (statusFilter !== 'all' && d.status !== statusFilter) return false;
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                d.trackingId.toLowerCase().includes(term) ||
                d.userPhone.includes(term) ||
                d.methodName.toLowerCase().includes(term) ||
                d.utrNumber.toLowerCase().includes(term)
              );
            })
            .map(deposit => (
              <div
                key={deposit.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {deposit.trackingId}
                      </span>
                      <button
                        onClick={() => handleCopy(deposit.trackingId)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        {copiedId === deposit.trackingId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(deposit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-emerald-400 mt-1">
                      Deposit: +{formatCurrency(deposit.amount, deposit.currency)}{' '}
                      <span className="text-slate-400 font-normal">via {deposit.methodName}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      UTR / Ref: <span className="font-mono text-slate-300 font-semibold">{deposit.utrNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {renderStatusBadge(deposit.status)}

                  <button
                    onClick={() => setSelectedReceipt({ type: 'deposit', data: deposit })}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                </div>
              </div>
            ))}

        {/* Withdrawal Records Section */}
        {(activeTab === 'all' || activeTab === 'withdrawals') &&
          userWithdrawals
            .filter(w => {
              if (statusFilter !== 'all' && w.status !== statusFilter) return false;
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                w.trackingId.toLowerCase().includes(term) ||
                w.userPhone.includes(term) ||
                w.methodName.toLowerCase().includes(term) ||
                w.receiverAccount.toLowerCase().includes(term)
              );
            })
            .map(wth => (
              <div
                key={wth.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {wth.trackingId}
                      </span>
                      <button
                        onClick={() => handleCopy(wth.trackingId)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        {copiedId === wth.trackingId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(wth.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-amber-400 mt-1">
                      Withdrawal: -{formatCurrency(wth.amount, wth.currency)}{' '}
                      <span className="text-slate-400 font-normal">to {wth.methodName}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Receiver: <span className="font-mono text-slate-300">{wth.receiverAccount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {renderStatusBadge(wth.status)}

                  <button
                    onClick={() => setSelectedReceipt({ type: 'withdrawal', data: wth })}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Detailed Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white relative">
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                Official Transaction Voucher
              </span>
              <h3 className="text-lg font-bold mt-2">
                {selectedReceipt.type === 'order' && 'P2P Exchange Order'}
                {selectedReceipt.type === 'deposit' && 'Wallet Deposit Receipt'}
                {selectedReceipt.type === 'withdrawal' && 'Wallet Withdrawal Receipt'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedReceipt.data.trackingCode || selectedReceipt.data.trackingId}
              </p>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white font-mono">{new Date(selectedReceipt.data.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Current Status:</span>
                <div>{renderStatusBadge(selectedReceipt.data.status)}</div>
              </div>

              {selectedReceipt.type === 'order' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Sent Amount:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(selectedReceipt.data.sendAmount, selectedReceipt.data.fromCurrency)} ({selectedReceipt.data.fromMethodName})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Receive Amount:</span>
                    <span className="font-bold text-emerald-300">
                      {formatCurrency(selectedReceipt.data.receiveAmount, selectedReceipt.data.toCurrency)} ({selectedReceipt.data.toMethodName})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Receiver Account:</span>
                    <span className="font-mono text-white">{selectedReceipt.data.receiverAccount}</span>
                  </div>
                </>
              )}

              {selectedReceipt.type === 'deposit' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Deposited Amount:</span>
                    <span className="font-bold text-emerald-300">
                      {formatCurrency(selectedReceipt.data.amount, selectedReceipt.data.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Method:</span>
                    <span className="text-white">{selectedReceipt.data.methodName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">UTR / Reference ID:</span>
                    <span className="font-mono font-bold text-white">{selectedReceipt.data.utrNumber}</span>
                  </div>
                </>
              )}

              {selectedReceipt.type === 'withdrawal' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Requested Amount:</span>
                    <span className="font-bold text-amber-300">
                      {formatCurrency(selectedReceipt.data.amount, selectedReceipt.data.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-mono text-white">{selectedReceipt.data.receiverAccount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Net Payout:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(selectedReceipt.data.netPayoutAmount, selectedReceipt.data.currency)}
                    </span>
                  </div>
                </>
              )}

              {selectedReceipt.data.adminNote && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Admin Operator Note:</span>
                  <p className="text-slate-300 italic">{selectedReceipt.data.adminNote}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer"
            >
              Close Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
