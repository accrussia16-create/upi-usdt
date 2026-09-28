import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Currency,
  PaymentMethodConfig,
  ManualUPIItem,
  AutoGatewayConfig,
  UPILinkItem,
  OptionAvailability,
  ExchangeRateConfig,
  SupportConfig,
  User,
  OrderStatus
} from '../types';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Link as LinkIcon,
  Sliders,
  DollarSign,
  Settings,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Clock,
  Search,
  ExternalLink,
  Check,
  RefreshCw,
  RotateCcw,
  Zap,
  Eye,
  EyeOff,
  Server,
  CreditCard,
  Radio,
  Lock,
  Globe
} from 'lucide-react';
import { formatCurrency, evaluateTimer } from '../utils/crypto';
import {
  EasyPaisaLogo,
  JazzCashLogo,
  UPILogo,
  USDTLogo,
  UserAvatarLogo
} from './BrandLogos';

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    users,
    deposits,
    withdrawals,
    exchangeOrders,
    paymentMethods,
    manualUPIList,
    autoGatewayConfig,
    upiLinksList,
    upiChannelsAvailability,
    setUPIChannelAvailability,
    adminSecurityConfig,
    updateAdminSecurityConfig,
    lockAdmin,
    exchangeRates,
    supportConfig,
    auditLogs,
    approveDeposit,
    rejectDeposit,
    updateWithdrawalStatus,
    updateOrderStatus,
    adjustUserBalance,
    toggleUserStatus,
    saveManualUPI,
    deleteManualUPI,
    setManualUPIAvailability,
    saveAutoGatewayConfig,
    testAutoGatewayConnection,
    setAutoGatewayAvailability,
    saveUPILink,
    deleteUPILink,
    setUPILinkAvailability,
    extendUPILinkTimer,
    savePaymentMethod,
    deletePaymentMethod,
    saveExchangeRate,
    saveSupportConfig,
    resetAllData
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'stats' | 'deposits' | 'withdrawals' | 'orders' | 'upi_options' | 'methods' | 'rates' | 'users' | 'support' | 'audit'
  >('upi_options');

  // Sub-tab inside UPI section
  const [upiSubTab, setUpiSubTab] = useState<'manual' | 'auto_gateway' | 'links'>('manual');

  const [searchTerm, setSearchTerm] = useState('');

  // Live timer tick
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Manual UPI Modal State
  const [editingManualUPI, setEditingManualUPI] = useState<ManualUPIItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // 2. Auto Gateway API Form State
  const [apiFormData, setApiFormData] = useState<AutoGatewayConfig>(autoGatewayConfig);
  const [apiTestStatus, setApiTestStatus] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  // Keep apiFormData in sync if autoGatewayConfig changes
  useEffect(() => {
    setApiFormData(autoGatewayConfig);
  }, [autoGatewayConfig]);

  // 3. UPI Link Modal State (Link 1, Link 2 with own timers)
  const [editingUPILink, setEditingUPILink] = useState<UPILinkItem | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Payment Method Modal State
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);

  // User Balance Adjust Modal
  const [balanceAdjustTarget, setBalanceAdjustTarget] = useState<User | null>(null);
  const [adjustCurrency, setAdjustCurrency] = useState<Currency>('PKR');
  const [adjustDelta, setAdjustDelta] = useState<number>(1000);
  const [adjustNote, setAdjustNote] = useState<string>('Admin manual credit');

  // Admin Security Password Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState(adminSecurityConfig.adminPassword);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);

  // Stats
  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingOrders = exchangeOrders.filter(o => o.status === 'pending');
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const totalVolumePKR = deposits
    .filter(d => d.status === 'approved' && d.currency === 'PKR')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalVolumeINR = deposits
    .filter(d => d.status === 'approved' && d.currency === 'INR')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Manual UPI Handlers
  const handleOpenAddManualUPI = () => {
    setEditingManualUPI({
      id: `man-upi-${Date.now()}`,
      name: `UPI ID ${manualUPIList.length + 1}`,
      upiId: 'merchant91pay@axisbank',
      payeeName: 'Fast Pay Settlement Desk',
      instructions: 'Transfer to this official UPI ID and submit 12-digit UTR below.',
      availability: 'active',
      createdAt: new Date().toISOString()
    });
    setIsManualModalOpen(true);
  };

  const handleSaveManualUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingManualUPI) {
      saveManualUPI(editingManualUPI);
      setIsManualModalOpen(false);
      setEditingManualUPI(null);
    }
  };

  // Auto Gateway API Handlers
  const handleTestAPIConnection = async () => {
    setIsTestingApi(true);
    setApiTestStatus(null);
    try {
      const res = await testAutoGatewayConnection();
      setApiTestStatus(res.message);
    } catch {
      setApiTestStatus('API test ping failed. Please verify API Key and Merchant ID.');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveAPIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAutoGatewayConfig(apiFormData);
    setApiSaveSuccess(true);
    setTimeout(() => setApiSaveSuccess(false), 3000);
  };

  // UPI Link Handlers (Link 1, Link 2...)
  const handleOpenAddUPILink = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 12 * 3600 * 1000); // 12 hours default
    const nextNumber = upiLinksList.length + 1;
    setEditingUPILink({
      id: `link-${Date.now()}`,
      name: `Link ${nextNumber} (VIP Server)`,
      url: 'https://p.paytm.me/xP/vip_fast_pay',
      startTime: now.toISOString(),
      expiryTime: expiry.toISOString(),
      afterExpiryAction: 'mark_unavailable',
      availability: 'active',
      instructions: 'Click Open UPI Link to pay, then enter your 12-digit UTR below.',
      priority: nextNumber,
      createdAt: now.toISOString()
    });
    setIsLinkModalOpen(true);
  };

  const handleSaveUPILink = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUPILink) {
      saveUPILink(editingUPILink);
      setIsLinkModalOpen(false);
      setEditingUPILink(null);
    }
  };

  // Payment Method Handlers
  const handleOpenAddMethod = () => {
    setEditingMethod({
      id: `method-${Date.now()}`,
      code: 'bank_transfer',
      name: 'Custom Payment Channel',
      currency: 'PKR',
      icon: '🏦',
      type: 'fiat',
      accountTitle: 'Corporate Settlement Desk',
      accountNumber: 'PK99MEZN0001928371928301',
      instructions: 'Transfer funds and submit transaction reference.',
      minAmount: 1000,
      maxAmount: 1000000,
      feePercentage: 0.5,
      isActive: true,
      receiverFieldLabel: 'Your Bank IBAN or Account Number',
      receiverFieldPlaceholder: 'Enter IBAN or Account Number'
    });
    setIsMethodModalOpen(true);
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMethod) {
      savePaymentMethod(editingMethod);
      setIsMethodModalOpen(false);
      setEditingMethod(null);
    }
  };

  const handleExecuteBalanceAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (balanceAdjustTarget) {
      adjustUserBalance(balanceAdjustTarget.id, adjustCurrency, adjustDelta, adjustNote);
      setBalanceAdjustTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Central Admin Dashboard</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <span className="text-white font-semibold">{currentUser?.fullName}</span> ({currentUser?.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Admin Password & Security Settings */}
          <button
            onClick={() => {
              setNewAdminPassword(adminSecurityConfig.adminPassword);
              setIsSecurityModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Password</span>
          </button>

          {/* Lock Admin Panel */}
          <button
            onClick={() => {
              lockAdmin();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-xs text-red-300 flex items-center gap-1.5 cursor-pointer"
            title="Lock Admin Panel and require password prompt"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Panel</span>
          </button>

          {/* Global Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo users, balances, UPI IDs, API configs, and orders back to defaults?')) {
                resetAllData();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Store</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-semibold mb-6 scrollbar-none">
        {/* UPI Management Hub Tab (Prominent) */}
        <button
          onClick={() => setAdminTab('upi_options')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer transition flex items-center gap-1.5 ${
            adminTab === 'upi_options' ? 'bg-emerald-600 text-white shadow font-bold' : 'text-emerald-400 hover:text-white font-bold'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>UPI Management (Manual, Auto, Links)</span>
        </button>

        <button
          onClick={() => setAdminTab('deposits')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition flex items-center gap-1.5 ${
            adminTab === 'deposits' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Deposits Review</span>
          {pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('withdrawals')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition flex items-center gap-1.5 ${
            adminTab === 'withdrawals' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Withdrawals</span>
          {pendingWithdrawals.length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition flex items-center gap-1.5 ${
            adminTab === 'orders' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Exchange Orders</span>
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] rounded-full font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('stats')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
            adminTab === 'stats' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview & Stats
        </button>

        <button
          onClick={() => setAdminTab('methods')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
            adminTab === 'methods' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payment Methods
        </button>

        <button
          onClick={() => setAdminTab('rates')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
            adminTab === 'rates' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Exchange Rates
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
            adminTab === 'users' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. UPI MANAGEMENT HUB (MANUAL, AUTO API GATEWAY, MULTIPLE UPI LINKS)      */}
      {/* ========================================================================= */}
      {adminTab === 'upi_options' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>UPI Payment Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the 3 client UPI options: <strong>Manual UPI IDs</strong>, <strong>Auto Gateway API</strong>, and <strong>Multiple Timed UPI Links (Link 1, Link 2...)</strong>.
              </p>
            </div>

            {/* 3 UPI Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setUpiSubTab('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  upiSubTab === 'manual'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>1. Manual UPI ({manualUPIList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setUpiSubTab('auto_gateway')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  upiSubTab === 'auto_gateway'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>2. Auto Gateway API</span>
              </button>

              <button
                type="button"
                onClick={() => setUpiSubTab('links')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  upiSubTab === 'links'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-purple-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>3. UPI Links ({upiLinksList.length})</span>
              </button>
            </div>
          </div>

          {/* MASTER CLIENT OPTION AVAILABILITY CONTROLS (ACTIVE / NOT AVAILABLE / HIDDEN) */}
          <div className="p-4.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-850">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Client Option Status (Active or Not Available)</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Instantly set any of the 3 deposit channels to <strong>Active</strong>, <strong>Not Available Right Now</strong>, or <strong>Hidden</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Option 1: MANUAL */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manual UPI</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    upiChannelsAvailability.manual === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : upiChannelsAvailability.manual === 'unavailable'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {upiChannelsAvailability.manual === 'active' ? 'Active' : upiChannelsAvailability.manual === 'unavailable' ? 'Not Available' : 'Hidden'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('manual', 'active')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.manual === 'active' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('manual', 'unavailable')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.manual === 'unavailable' ? 'bg-red-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('manual', 'hidden')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.manual === 'hidden' ? 'bg-slate-700 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>

              {/* Option 2: AUTO GATEWAY */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Auto Gateway</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    upiChannelsAvailability.auto === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : upiChannelsAvailability.auto === 'unavailable'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {upiChannelsAvailability.auto === 'active' ? 'Active' : upiChannelsAvailability.auto === 'unavailable' ? 'Not Available' : 'Hidden'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('auto', 'active')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.auto === 'active' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('auto', 'unavailable')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.auto === 'unavailable' ? 'bg-red-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('auto', 'hidden')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.auto === 'hidden' ? 'bg-slate-700 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>

              {/* Option 3: UPI LINKS */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>UPI Links</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    upiChannelsAvailability.link === 'active'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : upiChannelsAvailability.link === 'unavailable'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {upiChannelsAvailability.link === 'active' ? 'Active' : upiChannelsAvailability.link === 'unavailable' ? 'Not Available' : 'Hidden'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('link', 'active')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.link === 'active' ? 'bg-purple-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('link', 'unavailable')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.link === 'unavailable' ? 'bg-red-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => setUPIChannelAvailability('link', 'hidden')}
                    className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      upiChannelsAvailability.link === 'hidden' ? 'bg-slate-700 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SUB-TAB 1: MANUAL UPI IDs (ADMIN CAN ADD, REMOVE, OR EDIT UPI ID)     */}
          {/* --------------------------------------------------------------------- */}
          {upiSubTab === 'manual' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Manual UPI IDs (ID & QR)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add, edit, or remove manual UPI IDs. Clients see these on the Manual option, copy the UPI ID, and submit their 12-digit UTR.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddManualUPI}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New UPI ID</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {manualUPIList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{item.name}</span>
                          <span className="font-mono text-emerald-300 font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {item.upiId}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.availability === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : item.availability === 'unavailable'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.availability === 'active' ? 'Active' : item.availability === 'unavailable' ? 'Not Available' : 'Hidden'}
                          </span>
                        </div>
                        {item.payeeName && (
                          <p className="text-xs text-slate-400 mt-1">
                            Payee Name: <strong className="text-slate-300">{item.payeeName}</strong>
                          </p>
                        )}
                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.instructions}</p>
                        )}
                      </div>

                      {/* 1-Click Status Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setManualUPIAvailability(item.id, 'active')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.availability === 'active' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualUPIAvailability(item.id, 'unavailable')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.availability === 'unavailable' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Shows Not Available Right Now to clients"
                        >
                          Not Available
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualUPIAvailability(item.id, 'hidden')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.availability === 'hidden' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Hides from clients"
                        >
                          Hidden
                        </button>
                      </div>
                    </div>

                    {/* Actions: Edit & Remove */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingManualUPI(item);
                          setIsManualModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit UPI ID</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete UPI ID ${item.upiId}?`)) {
                            deleteManualUPI(item.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-TAB 2: AUTO GATEWAY (ADMIN CAN CONNECT TO API FOR AUTO CREDIT)    */}
          {/* --------------------------------------------------------------------- */}
          {upiSubTab === 'auto_gateway' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Auto Payment Gateway API Connection</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect official payment gateway API (e.g. 91Jeeto / PayZall / Cashfree). Enable automatic balance crediting without manual admin review.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    autoGatewayConfig.isConnected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-950 text-red-300 border border-red-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${autoGatewayConfig.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`}></span>
                    <span>{autoGatewayConfig.isConnected ? 'API Connected & Ready' : 'API Disconnected'}</span>
                  </span>
                </div>
              </div>

              {/* API Form */}
              <form onSubmit={handleSaveAPIConfig} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Payment Provider Name:</label>
                    <input
                      type="text"
                      required
                      value={apiFormData.providerName}
                      onChange={e => setApiFormData({ ...apiFormData, providerName: e.target.value })}
                      placeholder="e.g. 91Jeeto Gateway API"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Merchant ID / Account ID:</label>
                    <input
                      type="text"
                      required
                      value={apiFormData.merchantId}
                      onChange={e => setApiFormData({ ...apiFormData, merchantId: e.target.value })}
                      placeholder="MCH_994821"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Gateway API Key:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={apiFormData.apiKey}
                        onChange={e => setApiFormData({ ...apiFormData, apiKey: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Secret Key / Hash Salt:</label>
                    <input
                      type="password"
                      value={apiFormData.apiSecret}
                      onChange={e => setApiFormData({ ...apiFormData, apiSecret: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Webhook / Callback URL:</label>
                    <input
                      type="url"
                      value={apiFormData.webhookUrl}
                      onChange={e => setApiFormData({ ...apiFormData, webhookUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Environment:</label>
                    <select
                      value={apiFormData.environment}
                      onChange={e => setApiFormData({ ...apiFormData, environment: e.target.value as 'production' | 'sandbox' })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="production">Production (Live Gateway)</option>
                      <option value="sandbox">Sandbox (Test Mode)</option>
                    </select>
                  </div>
                </div>

                {/* Auto Credit Toggle & Client Availability */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Instant Auto-Credit Wallet:</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${apiFormData.isAutoApprove ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {apiFormData.isAutoApprove ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      When enabled, user's balance is automatically credited as soon as gateway returns success callback.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setApiFormData({ ...apiFormData, isAutoApprove: !apiFormData.isAutoApprove })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      apiFormData.isAutoApprove
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {apiFormData.isAutoApprove ? 'Disable Auto-Credit' : 'Enable Auto-Credit'}
                  </button>
                </div>

                {/* Client Availability */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Client Availability:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setApiFormData({ ...apiFormData, availability: 'active' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          apiFormData.availability === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setApiFormData({ ...apiFormData, availability: 'unavailable' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          apiFormData.availability === 'unavailable' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Not Available
                      </button>
                      <button
                        type="button"
                        onClick={() => setApiFormData({ ...apiFormData, availability: 'hidden' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          apiFormData.availability === 'hidden' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Hidden
                      </button>
                    </div>
                  </div>

                  {/* Buttons: Test Connection & Save */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTestingApi}
                      onClick={handleTestAPIConnection}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                      <span>{isTestingApi ? 'Pinging API...' : 'Test API Connection'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Connect API</span>
                    </button>
                  </div>
                </div>

                {apiTestStatus && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{apiTestStatus}</span>
                  </div>
                )}

                {apiSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
                    ✓ API Configuration Saved Successfully!
                  </div>
                )}
              </form>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-TAB 3: MULTIPLE UPI LINKS (ADMIN CAN NAME LINK 1, LINK 2 ETC.)    */}
          {/* EACH WITH OWN TIMER AND AUTO-REMOVE OR UNAVAILABLE AFTER EXPIRY       */}
          {/* --------------------------------------------------------------------- */}
          {upiSubTab === 'links' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <span>Multiple UPI Links & Timers</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add multiple UPI links. Name each like <strong>Link 1</strong>, <strong>Link 2</strong> (what the client sees). Set each link's <strong>own countdown timer</strong> and after-expiry behavior.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddUPILink}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New UPI Link</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {upiLinksList.map((linkItem) => {
                  const evalRes = evaluateTimer(linkItem.startTime, linkItem.expiryTime, linkItem.afterExpiryAction, linkItem.availability);

                  return (
                    <div
                      key={linkItem.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-base">
                              {linkItem.name}
                            </span>

                            {/* Live Countdown Timer Badge */}
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              evalRes.isAvailable
                                ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                : 'bg-red-950 text-red-300 border border-red-500/40'
                            }`}>
                              <Clock className="w-3 h-3 animate-pulse text-purple-400" />
                              <span>Timer: {evalRes.countdownFormatted}</span>
                            </span>

                            {/* After Expiry Action Tag */}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                              After Expiry: {linkItem.afterExpiryAction === 'auto_remove' ? 'Auto-Remove' : 'Mark Unavailable'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Target URL:</span>
                            <a
                              href={linkItem.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-purple-300 hover:underline truncate max-w-sm"
                            >
                              {linkItem.url}
                            </a>
                          </div>
                        </div>

                        {/* 1-Click Availability Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-center">
                          <button
                            type="button"
                            onClick={() => setUPILinkAvailability(linkItem.id, 'active')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              linkItem.availability === 'active' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => setUPILinkAvailability(linkItem.id, 'unavailable')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              linkItem.availability === 'unavailable' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Shows Not Available Right Now to clients"
                          >
                            Not Available
                          </button>
                          <button
                            type="button"
                            onClick={() => setUPILinkAvailability(linkItem.id, 'hidden')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              linkItem.availability === 'hidden' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Hides link from clients"
                          >
                            Hidden
                          </button>
                        </div>
                      </div>

                      {/* Quick Extend Timer & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Quick Extend Timer:</span>
                          <button
                            type="button"
                            onClick={() => extendUPILinkTimer(linkItem.id, 30)}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold border border-slate-800 cursor-pointer"
                          >
                            +30m
                          </button>
                          <button
                            type="button"
                            onClick={() => extendUPILinkTimer(linkItem.id, 120)}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold border border-slate-800 cursor-pointer"
                          >
                            +2h
                          </button>
                          <button
                            type="button"
                            onClick={() => extendUPILinkTimer(linkItem.id, 1440)}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold border border-slate-800 cursor-pointer"
                          >
                            +24h
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUPILink(linkItem);
                              setIsLinkModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Link</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ${linkItem.name}?`)) {
                                deleteUPILink(linkItem.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Deposits Review */}
      {adminTab === 'deposits' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Deposit Requests & Approvals ({deposits.length})</h3>
            <span className="text-xs text-emerald-400 font-bold">
              {pendingDeposits.length} Pending Verification
            </span>
          </div>

          <div className="space-y-3">
            {deposits.map(dep => (
              <div
                key={dep.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{dep.trackingId}</span>
                    <span className="text-slate-500">{new Date(dep.createdAt).toLocaleString()}</span>
                    {dep.isAutoApproved && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                        ⚡ AUTO CREDITED
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-black text-emerald-400 mt-1">
                    +{formatCurrency(dep.amount, dep.currency)} ({dep.methodName})
                  </div>

                  <div className="text-slate-400 mt-0.5">
                    User: <span className="font-mono text-white">{dep.userPhone}</span> • UTR:{' '}
                    <span className="font-mono text-emerald-300 font-bold">{dep.utrNumber}</span>
                  </div>

                  {dep.upiLinkName && (
                    <div className="text-purple-300 text-[11px] mt-0.5">
                      Route: <strong>{dep.upiLinkName}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {dep.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveDeposit(dep.id, 'Verified by Admin')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow"
                      >
                        ✓ Approve & Credit
                      </button>
                      <button
                        onClick={() => rejectDeposit(dep.id, 'Invalid UTR reference')}
                        className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] ${
                      dep.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {dep.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Withdrawals */}
      {adminTab === 'withdrawals' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Withdrawal Requests ({withdrawals.length})</h3>

          <div className="space-y-3">
            {withdrawals.map(wth => (
              <div
                key={wth.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{wth.trackingId}</span>
                    <span className="text-slate-500">{new Date(wth.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="text-sm font-black text-white mt-1">
                    Payout: <span className="text-emerald-400">{formatCurrency(wth.netPayoutAmount, wth.currency)}</span> ({wth.methodName})
                  </div>

                  <div className="text-slate-400 mt-0.5">
                    User: <span className="font-mono text-white">{wth.userPhone}</span> • Destination:{' '}
                    <span className="font-mono text-white font-bold">{wth.receiverAccount}</span> ({wth.receiverName})
                  </div>
                </div>

                {wth.status === 'pending' || wth.status === 'processing' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateWithdrawalStatus(wth.id, 'completed', 'Dispatched')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      ✓ Mark Completed
                    </button>
                    <button
                      onClick={() => updateWithdrawalStatus(wth.id, 'rejected', 'Refunded by Admin')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 cursor-pointer"
                    >
                      ✕ Reject & Refund
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono">Archived</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Exchange Orders */}
      {adminTab === 'orders' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">All Exchange Orders ({exchangeOrders.length})</h3>

          <div className="space-y-3">
            {exchangeOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{order.trackingCode}</span>
                    <span className="text-slate-500">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {formatCurrency(order.sendAmount, order.fromCurrency)} ({order.fromMethodName}) ➔{' '}
                    <span className="text-emerald-300 font-bold">{formatCurrency(order.receiveAmount, order.toCurrency)} ({order.toMethodName})</span>
                  </div>

                  <div className="text-slate-400 mt-0.5">
                    User: <span className="font-mono text-white">{order.userPhone}</span> • Destination:{' '}
                    <span className="font-mono text-white">{order.receiverAccount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Overview & Stats */}
      {adminTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Pending Review</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {pendingDeposits.length + pendingWithdrawals.length + pendingOrders.length}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Total Registered Users</span>
              <span className="text-2xl font-black text-white mt-1 block">{totalUsers}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">PKR Approved Volume</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₨{totalVolumePKR.toLocaleString()}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">INR Approved Volume</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{totalVolumeINR.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Payment Methods (EasyPaisa, JazzCash, USDT) */}
      {adminTab === 'methods' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Payment & Deposit Methods</h3>
            <button
              onClick={handleOpenAddMethod}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{method.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        {method.currency}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    method.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {method.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">Account: </span>
                    <span className="font-mono text-white font-bold">{method.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Title: </span>
                    <span className="text-slate-300">{method.accountTitle}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditingMethod(method);
                      setIsMethodModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Exchange Rates */}
      {adminTab === 'rates' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Live Exchange Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exchangeRates.map(rate => (
              <div key={rate.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white text-sm">{rate.fromCurrency} ➔ {rate.toCurrency}</span>
                  <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">Rate: {rate.rate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.001"
                    defaultValue={rate.rate}
                    onBlur={e => {
                      const val = parseFloat(e.target.value);
                      if (val > 0) saveExchangeRate({ ...rate, rate: val });
                    }}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. User Accounts */}
      {adminTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">User Accounts ({users.length})</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search phone or name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {users
              .filter(u => u.phone.includes(searchTerm) || u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(u => (
                <div
                  key={u.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatarLogo className="w-9 h-9" />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{u.fullName}</span>
                        <span className="font-mono text-xs text-slate-400">({u.phone})</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 mt-1 font-mono">
                        <span>PKR: ₨{u.balance.pkr.toLocaleString()}</span>
                        <span>INR: ₹{u.balance.inr.toLocaleString()}</span>
                        <span>USDT: ${u.balance.usdt.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBalanceAdjustTarget(u)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                    >
                      Adjust Balance
                    </button>
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                        u.status === 'active' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MANUAL UPI ID                                         */}
      {/* ========================================================================= */}
      {isManualModalOpen && editingManualUPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 text-white">
            <h3 className="text-base font-bold text-white mb-4">
              {manualUPIList.some(i => i.id === editingManualUPI.id) ? 'Edit Manual UPI ID' : 'Add New Manual UPI ID'}
            </h3>

            <form onSubmit={handleSaveManualUPI} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">UPI ID Name / Title:</label>
                <input
                  type="text"
                  required
                  value={editingManualUPI.name}
                  onChange={e => setEditingManualUPI({ ...editingManualUPI, name: e.target.value })}
                  placeholder="e.g. Primary Axis UPI"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">UPI ID (VPA):</label>
                  <input
                    type="text"
                    required
                    value={editingManualUPI.upiId}
                    onChange={e => setEditingManualUPI({ ...editingManualUPI, upiId: e.target.value })}
                    placeholder="e.g. pay@okaxis"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Payee Name:</label>
                  <input
                    type="text"
                    value={editingManualUPI.payeeName}
                    onChange={e => setEditingManualUPI({ ...editingManualUPI, payeeName: e.target.value })}
                    placeholder="e.g. Merchant Desk"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Client Availability:</label>
                <select
                  value={editingManualUPI.availability}
                  onChange={e => setEditingManualUPI({ ...editingManualUPI, availability: e.target.value as OptionAvailability })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="active">Active (Available on Deposit)</option>
                  <option value="unavailable">Not Available Right Now</option>
                  <option value="hidden">Hidden from Clients</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instructions for User:</label>
                <textarea
                  rows={2}
                  value={editingManualUPI.instructions || ''}
                  onChange={e => setEditingManualUPI({ ...editingManualUPI, instructions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save Manual UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT UPI LINK (NAMED LINK 1, LINK 2 WITH OWN TIMER)       */}
      {/* ========================================================================= */}
      {isLinkModalOpen && editingUPILink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {upiLinksList.some(l => l.id === editingUPILink.id) ? 'Edit UPI Link' : 'Add New UPI Link'}
            </h3>

            <form onSubmit={handleSaveUPILink} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">
                  Link Name (Clients see this name):
                </label>
                <input
                  type="text"
                  required
                  value={editingUPILink.name}
                  onChange={e => setEditingUPILink({ ...editingUPILink, name: e.target.value })}
                  placeholder="e.g. Link 1 or Link 2 (Fast Server)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
                <span className="text-[10px] text-purple-300 mt-0.5 block">
                  Tip: Name as "Link 1", "Link 2", "Link 3" as requested by clients.
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">
                  Payment Link URL (Opens when user clicks "Open UPI Link"):
                </label>
                <input
                  type="url"
                  required
                  value={editingUPILink.url}
                  onChange={e => setEditingUPILink({ ...editingUPILink, url: e.target.value })}
                  placeholder="https://p.paytm.me/... or payment link"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Client Availability:</label>
                  <select
                    value={editingUPILink.availability}
                    onChange={e => setEditingUPILink({ ...editingUPILink, availability: e.target.value as OptionAvailability })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="unavailable">Not Available Right Now</option>
                    <option value="hidden">Hidden from Clients</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">When Link Expires:</label>
                  <select
                    value={editingUPILink.afterExpiryAction}
                    onChange={e => setEditingUPILink({ ...editingUPILink, afterExpiryAction: e.target.value as 'mark_unavailable' | 'auto_remove' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="mark_unavailable">Mark as Not Available Right Now</option>
                    <option value="auto_remove">Remove Automatically from Client View</option>
                  </select>
                </div>
              </div>

              {/* Countdown Timer Setting */}
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Link Expiry Date & Time:</label>
                <input
                  type="datetime-local"
                  required
                  value={new Date(editingUPILink.expiryTime).toISOString().slice(0, 16)}
                  onChange={e => setEditingUPILink({ ...editingUPILink, expiryTime: new Date(e.target.value).toISOString() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Quick Timer Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                <span>Quick Timer Duration:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUPILink({
                      ...editingUPILink,
                      expiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold cursor-pointer"
                >
                  30 Min
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUPILink({
                      ...editingUPILink,
                      expiryTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold cursor-pointer"
                >
                  1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUPILink({
                      ...editingUPILink,
                      expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold cursor-pointer"
                >
                  2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUPILink({
                      ...editingUPILink,
                      expiryTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold cursor-pointer"
                >
                  12 Hours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUPILink({
                      ...editingUPILink,
                      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold cursor-pointer"
                >
                  24 Hours
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instructions for User:</label>
                <textarea
                  rows={2}
                  value={editingUPILink.instructions || ''}
                  onChange={e => setEditingUPILink({ ...editingUPILink, instructions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow"
                >
                  Save UPI Link
                </button>
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust User Balance Modal */}
      {balanceAdjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 text-white">
            <h3 className="text-base font-bold text-white">
              Adjust Balance for {balanceAdjustTarget.fullName}
            </h3>

            <form onSubmit={handleExecuteBalanceAdjust} className="space-y-4 my-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Currency:</label>
                <select
                  value={adjustCurrency}
                  onChange={e => setAdjustCurrency(e.target.value as Currency)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="PKR">PKR (₨{balanceAdjustTarget.balance.pkr.toLocaleString()})</option>
                  <option value="INR">INR (₹{balanceAdjustTarget.balance.inr.toLocaleString()})</option>
                  <option value="USDT">USDT (${balanceAdjustTarget.balance.usdt.toFixed(2)})</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount to Add (or negative to deduct):</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={adjustDelta}
                  onChange={e => setAdjustDelta(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason / Note:</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Apply Balance Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceAdjustTarget(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Custom Payment Method Modal */}
      {isMethodModalOpen && editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {paymentMethods.some(m => m.id === editingMethod.id) ? 'Edit Payment Method' : 'Add Custom Payment Method'}
            </h3>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Method Name:</label>
                <input
                  type="text"
                  required
                  value={editingMethod.name}
                  onChange={e => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Currency:</label>
                  <select
                    value={editingMethod.currency}
                    onChange={e => setEditingMethod({ ...editingMethod, currency: e.target.value as Currency })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PKR">PKR</option>
                    <option value="INR">INR</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Active Status:</label>
                  <select
                    value={editingMethod.isActive ? 'true' : 'false'}
                    onChange={e => setEditingMethod({ ...editingMethod, isActive: e.target.value === 'true' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Account Number / Address:</label>
                  <input
                    type="text"
                    required
                    value={editingMethod.accountNumber}
                    onChange={e => setEditingMethod({ ...editingMethod, accountNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Account Title:</label>
                  <input
                    type="text"
                    value={editingMethod.accountTitle}
                    onChange={e => setEditingMethod({ ...editingMethod, accountTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instructions for User:</label>
                <textarea
                  rows={2}
                  value={editingMethod.instructions}
                  onChange={e => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save Method
                </button>
                <button
                  type="button"
                  onClick={() => setIsMethodModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Password Change Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Admin Panel Password</h3>
                <p className="text-xs text-slate-400">Configure master access password</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAdminSecurityConfig({
                  ...adminSecurityConfig,
                  adminPassword: newAdminPassword.trim() || 'admin123'
                });
                setPasswordSaveSuccess(true);
                setTimeout(() => {
                  setPasswordSaveSuccess(false);
                  setIsSecurityModalOpen(false);
                }, 1500);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-bold">New Master Admin Password:</label>
                <input
                  type="text"
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current default password: <strong className="text-amber-400">admin123</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="req_prompt"
                  checked={adminSecurityConfig.requirePasswordPrompt}
                  onChange={e => updateAdminSecurityConfig({
                    ...adminSecurityConfig,
                    requirePasswordPrompt: e.target.checked
                  })}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="req_prompt" className="text-slate-300 font-medium cursor-pointer">
                  Require password prompt every time Admin Panel is opened
                </label>
              </div>

              {passwordSaveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Admin password saved successfully!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow"
                >
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
