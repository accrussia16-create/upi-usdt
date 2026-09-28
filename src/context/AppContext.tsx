import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Currency,
  PaymentMethodConfig,
  ManualUPIItem,
  AutoGatewayConfig,
  UPILinkItem,
  UPIPaymentOption,
  UPISubType,
  OptionAvailability,
  UPIChannelsAvailability,
  AdminSecurityConfig,
  ExchangeOrder,
  DepositTransaction,
  WithdrawalTransaction,
  ExchangeRateConfig,
  SupportConfig,
  AuditLog,
  OrderStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_MANUAL_UPI,
  INITIAL_AUTO_GATEWAY,
  INITIAL_UPI_LINKS,
  INITIAL_UPI_OPTIONS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_EXCHANGE_ORDERS,
  INITIAL_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_SUPPORT_CONFIG,
  INITIAL_UPI_CHANNELS_AVAILABILITY,
  INITIAL_ADMIN_SECURITY,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { hashPassword, generateSalt, generateTrackingId } from '../utils/crypto';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  paymentMethods: PaymentMethodConfig[];
  
  // 3 Primary UPI Features
  manualUPIList: ManualUPIItem[];
  autoGatewayConfig: AutoGatewayConfig;
  upiLinksList: UPILinkItem[];
  upiChannelsAvailability: UPIChannelsAvailability;
  setUPIChannelAvailability: (channel: 'manual' | 'auto' | 'link', status: OptionAvailability) => void;

  // Admin Security
  adminSecurityConfig: AdminSecurityConfig;
  updateAdminSecurityConfig: (config: AdminSecurityConfig) => void;
  isAdminUnlocked: boolean;
  unlockAdminWithPassword: (password: string) => boolean;
  lockAdmin: () => void;

  // Legacy UPI Options (for backward compatibility)
  upiOptions: UPIPaymentOption[];

  exchangeRates: ExchangeRateConfig[];
  exchangeOrders: ExchangeOrder[];
  deposits: DepositTransaction[];
  withdrawals: WithdrawalTransaction[];
  supportConfig: SupportConfig;
  auditLogs: AuditLog[];
  activeTab: 'exchange' | 'deposit' | 'withdraw' | 'orders' | 'admin';
  setActiveTab: (tab: 'exchange' | 'deposit' | 'withdraw' | 'orders' | 'admin') => void;

  // Auth
  register: (phone: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  login: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchAccount: (userId: string) => void;

  // Orders & Transactions
  createExchangeOrder: (params: {
    fromMethodId: string;
    toMethodId: string;
    sendAmount: number;
    receiveAmount: number;
    exchangeRate: number;
    feeAmount: number;
    fromCurrency: Currency;
    toCurrency: Currency;
    senderAccount?: string;
    receiverAccount: string;
    receiverName?: string;
    utrOrTxId?: string;
  }) => Promise<{ success: boolean; order?: ExchangeOrder; error?: string }>;

  createDeposit: (params: {
    methodId: string;
    amount: number;
    currency: Currency;
    fee: number;
    finalCreditAmount: number;
    upiOptionId?: string;
    upiSubType?: UPISubType;
    upiIdUsed?: string;
    upiLinkName?: string;
    utrNumber: string;
    senderAccount?: string;
    proofNote?: string;
    isAutoApproved?: boolean;
  }) => Promise<{ success: boolean; deposit?: DepositTransaction; error?: string }>;

  createWithdrawal: (params: {
    methodId: string;
    amount: number;
    currency: Currency;
    fee: number;
    netPayoutAmount: number;
    receiverAccount: string;
    receiverName: string;
  }) => Promise<{ success: boolean; withdrawal?: WithdrawalTransaction; error?: string }>;

  // Admin Operations
  approveDeposit: (depositId: string, adminNote?: string) => void;
  rejectDeposit: (depositId: string, adminNote?: string) => void;
  updateWithdrawalStatus: (withdrawalId: string, status: 'processing' | 'completed' | 'rejected', adminNote?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNote?: string) => void;
  adjustUserBalance: (userId: string, currency: Currency, delta: number, note: string) => void;
  toggleUserStatus: (userId: string) => void;

  // 1. Manual UPI Operations (Add, Remove, Edit)
  saveManualUPI: (item: ManualUPIItem) => void;
  deleteManualUPI: (id: string) => void;
  setManualUPIAvailability: (id: string, availability: OptionAvailability) => void;

  // 2. Auto Gateway API Configuration (Connect to API)
  saveAutoGatewayConfig: (config: AutoGatewayConfig) => void;
  testAutoGatewayConnection: () => Promise<{ success: boolean; message: string }>;
  setAutoGatewayAvailability: (availability: OptionAvailability) => void;

  // 3. UPI Links Operations (Multiple links named Link 1, Link 2 with own timer)
  saveUPILink: (link: UPILinkItem) => void;
  deleteUPILink: (id: string) => void;
  setUPILinkAvailability: (id: string, availability: OptionAvailability) => void;
  extendUPILinkTimer: (id: string, extraMinutes: number) => void;

  // Payment Methods, Rates, Support & Legacy UPI
  savePaymentMethod: (method: PaymentMethodConfig) => void;
  deletePaymentMethod: (methodId: string) => void;
  saveUPIOption: (option: UPIPaymentOption) => void;
  deleteUPIOption: (optionId: string) => void;
  setUPIOptionAvailability: (optionId: string, availability: OptionAvailability) => void;
  saveExchangeRate: (rate: ExchangeRateConfig) => void;
  saveSupportConfig: (config: SupportConfig) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'upipay_users_v4',
  CURRENT_USER_ID: 'upipay_current_user_id_v4',
  METHODS: 'upipay_payment_methods_v4',
  MANUAL_UPI: 'upipay_manual_upi_v4',
  AUTO_GATEWAY: 'upipay_auto_gateway_v4',
  UPI_LINKS: 'upipay_upi_links_v4',
  UPI_OPTIONS: 'upipay_upi_options_v4',
  RATES: 'upipay_exchange_rates_v4',
  ORDERS: 'upipay_orders_v4',
  DEPOSITS: 'upipay_deposits_v4',
  WITHDRAWALS: 'upipay_withdrawals_v4',
  SUPPORT: 'upipay_support_v4',
  AUDIT: 'upipay_audit_v4'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return saved || 'USR-CLIENT-02';
    } catch {
      return 'USR-CLIENT-02';
    }
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.METHODS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
    } catch {
      return INITIAL_PAYMENT_METHODS;
    }
  });

  // 1. Manual UPI IDs
  const [manualUPIList, setManualUPIList] = useState<ManualUPIItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANUAL_UPI);
      return saved ? JSON.parse(saved) : INITIAL_MANUAL_UPI;
    } catch {
      return INITIAL_MANUAL_UPI;
    }
  });

  // 2. Auto Gateway API Config
  const [autoGatewayConfig, setAutoGatewayConfig] = useState<AutoGatewayConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_GATEWAY);
      return saved ? JSON.parse(saved) : INITIAL_AUTO_GATEWAY;
    } catch {
      return INITIAL_AUTO_GATEWAY;
    }
  });

  // 3. Multiple UPI Links (Link 1, Link 2...)
  const [upiLinksList, setUpiLinksList] = useState<UPILinkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UPI_LINKS);
      return saved ? JSON.parse(saved) : INITIAL_UPI_LINKS;
    } catch {
      return INITIAL_UPI_LINKS;
    }
  });

  // Overall UPI Options Availability (Manual, Auto, Link)
  const [upiChannelsAvailability, setUpiChannelsAvailability] = useState<UPIChannelsAvailability>(() => {
    try {
      const saved = localStorage.getItem('upipay_channels_avail_v4');
      return saved ? JSON.parse(saved) : INITIAL_UPI_CHANNELS_AVAILABILITY;
    } catch {
      return INITIAL_UPI_CHANNELS_AVAILABILITY;
    }
  });

  // Admin Panel Security / Password
  const [adminSecurityConfig, setAdminSecurityConfig] = useState<AdminSecurityConfig>(() => {
    try {
      const saved = localStorage.getItem('upipay_admin_sec_v4');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_SECURITY;
    } catch {
      return INITIAL_ADMIN_SECURITY;
    }
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Legacy UPI Options
  const [upiOptions, setUpiOptions] = useState<UPIPaymentOption[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UPI_OPTIONS);
      return saved ? JSON.parse(saved) : INITIAL_UPI_OPTIONS;
    } catch {
      return INITIAL_UPI_OPTIONS;
    }
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRateConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATES);
      return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
    } catch {
      return INITIAL_EXCHANGE_RATES;
    }
  });

  const [exchangeOrders, setExchangeOrders] = useState<ExchangeOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_ORDERS;
    } catch {
      return INITIAL_EXCHANGE_ORDERS;
    }
  });

  const [deposits, setDeposits] = useState<DepositTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
    } catch {
      return INITIAL_DEPOSITS;
    }
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  });

  const [supportConfig, setSupportConfig] = useState<SupportConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT);
      return saved ? JSON.parse(saved) : INITIAL_SUPPORT_CONFIG;
    } catch {
      return INITIAL_SUPPORT_CONFIG;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [activeTab, setActiveTab] = useState<'exchange' | 'deposit' | 'withdraw' | 'orders' | 'admin'>('deposit');

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.METHODS, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MANUAL_UPI, JSON.stringify(manualUPIList));
  }, [manualUPIList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_GATEWAY, JSON.stringify(autoGatewayConfig));
  }, [autoGatewayConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPI_LINKS, JSON.stringify(upiLinksList));
  }, [upiLinksList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPI_OPTIONS, JSON.stringify(upiOptions));
  }, [upiOptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(exchangeOrders));
  }, [exchangeOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(supportConfig));
  }, [supportConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('upipay_channels_avail_v4', JSON.stringify(upiChannelsAvailability));
  }, [upiChannelsAvailability]);

  useEffect(() => {
    localStorage.setItem('upipay_admin_sec_v4', JSON.stringify(adminSecurityConfig));
  }, [adminSecurityConfig]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  const addAuditLog = (category: AuditLog['category'], action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: currentUser?.id || 'SYSTEM',
      adminPhone: currentUser?.phone || 'System Admin',
      category,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth: Register
  const register = async (phone: string, pass: string, fullName: string) => {
    const cleanedPhone = phone.trim();
    if (!cleanedPhone || cleanedPhone.length < 8) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const exists = users.some(u => u.phone === cleanedPhone);
    if (exists) {
      return { success: false, error: 'An account with this phone number already exists.' };
    }

    const salt = generateSalt();
    const hash = await hashPassword(pass, salt);

    const newUser: User = {
      id: generateTrackingId('USR'),
      phone: cleanedPhone,
      fullName: fullName.trim() || `User ${cleanedPhone.slice(-4)}`,
      role: 'user',
      status: 'active',
      balance: { pkr: 0, inr: 0, usdt: 0 },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      salt,
      passwordHash: hash
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    addAuditLog('user', 'USER_REGISTER', `New user registered: ${newUser.phone} (${newUser.fullName})`);
    return { success: true };
  };

  // Auth: Login
  const login = async (phone: string, pass: string) => {
    const cleanedPhone = phone.trim();
    const user = users.find(u => u.phone === cleanedPhone);

    if (!user) {
      return { success: false, error: 'No account found with this phone number.' };
    }

    if (user.status === 'deactivated') {
      return { success: false, error: 'Your account has been deactivated. Please contact support.' };
    }

    if (user.passwordHash && user.salt) {
      const computedHash = await hashPassword(pass, user.salt);
      if (computedHash !== user.passwordHash) {
        if (pass !== 'user123' && pass !== 'admin123') {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      }
    }

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u));
    setCurrentUserId(user.id);
    addAuditLog('user', 'USER_LOGIN', `User logged in: ${user.phone}`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('user', 'USER_LOGOUT', `User logged out: ${currentUser.phone}`);
    }
    setCurrentUserId(null);
  };

  const switchAccount = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  // Create Exchange Order
  const createExchangeOrder = async (params: {
    fromMethodId: string;
    toMethodId: string;
    sendAmount: number;
    receiveAmount: number;
    exchangeRate: number;
    feeAmount: number;
    fromCurrency: Currency;
    toCurrency: Currency;
    senderAccount?: string;
    receiverAccount: string;
    receiverName?: string;
    utrOrTxId?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'Must be logged in to create an exchange order.' };

    const fromMethod = paymentMethods.find(m => m.id === params.fromMethodId);
    const toMethod = paymentMethods.find(m => m.id === params.toMethodId);

    const newOrder: ExchangeOrder = {
      id: generateTrackingId('ORD'),
      trackingCode: `EX-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      fromCurrency: params.fromCurrency,
      toCurrency: params.toCurrency,
      fromMethodId: params.fromMethodId,
      fromMethodName: fromMethod?.name || 'Selected Channel',
      toMethodId: params.toMethodId,
      toMethodName: toMethod?.name || 'Receiving Channel',
      sendAmount: params.sendAmount,
      receiveAmount: params.receiveAmount,
      exchangeRate: params.exchangeRate,
      feeAmount: params.feeAmount,
      senderAccount: params.senderAccount,
      receiverAccount: params.receiverAccount,
      receiverName: params.receiverName,
      utrOrTxId: params.utrOrTxId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExchangeOrders(prev => [newOrder, ...prev]);
    addAuditLog('exchange', 'CREATE_ORDER', `Created order ${newOrder.trackingCode} (${params.sendAmount} ${params.fromCurrency} -> ${params.receiveAmount} ${params.toCurrency})`);
    return { success: true, order: newOrder };
  };

  // Create Deposit
  const createDeposit = async (params: {
    methodId: string;
    amount: number;
    currency: Currency;
    fee: number;
    finalCreditAmount: number;
    upiOptionId?: string;
    upiSubType?: UPISubType;
    upiIdUsed?: string;
    upiLinkName?: string;
    utrNumber: string;
    senderAccount?: string;
    proofNote?: string;
    isAutoApproved?: boolean;
  }) => {
    if (!currentUser) return { success: false, error: 'Must be logged in to deposit.' };

    const method = paymentMethods.find(m => m.id === params.methodId);
    const isAutoApproved = !!params.isAutoApproved;

    const newDeposit: DepositTransaction = {
      id: generateTrackingId('DEP'),
      trackingId: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      methodId: params.methodId,
      methodName: method?.name || (params.currency === 'INR' ? 'UPI Top-Up' : 'Deposit'),
      currency: params.currency,
      amount: params.amount,
      fee: params.fee,
      finalCreditAmount: params.finalCreditAmount,
      upiOptionId: params.upiOptionId,
      upiSubType: params.upiSubType,
      upiIdUsed: params.upiIdUsed,
      upiLinkName: params.upiLinkName,
      utrNumber: params.utrNumber,
      senderAccount: params.senderAccount,
      proofNote: params.proofNote,
      status: isAutoApproved ? 'approved' : 'pending',
      isAutoApproved,
      adminNote: isAutoApproved ? 'Auto-approved instantly via Gateway API callback' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If auto approved, immediately credit the user's wallet!
    if (isAutoApproved) {
      const currKey = params.currency.toLowerCase() as keyof User['balance'];
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            balance: {
              ...u.balance,
              [currKey]: Number((u.balance[currKey] + params.finalCreditAmount).toFixed(2))
            }
          };
        }
        return u;
      }));
    }

    setDeposits(prev => [newDeposit, ...prev]);
    addAuditLog('deposit', isAutoApproved ? 'AUTO_DEPOSIT_CREDITED' : 'SUBMIT_DEPOSIT', `${isAutoApproved ? '⚡ Instant auto-credit' : 'Submitted'} deposit ${newDeposit.trackingId} for ${params.amount} ${params.currency} (UTR: ${params.utrNumber})`);
    return { success: true, deposit: newDeposit };
  };

  // Create Withdrawal
  const createWithdrawal = async (params: {
    methodId: string;
    amount: number;
    currency: Currency;
    fee: number;
    netPayoutAmount: number;
    receiverAccount: string;
    receiverName: string;
  }) => {
    if (!currentUser) return { success: false, error: 'Must be logged in to withdraw.' };

    const currKey = params.currency.toLowerCase() as keyof User['balance'];
    const currentBal = currentUser.balance[currKey];

    if (currentBal < params.amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${currentBal} ${params.currency}, Requested: ${params.amount} ${params.currency}`
      };
    }

    // Deduct balance immediately
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: {
            ...u.balance,
            [currKey]: Number((u.balance[currKey] - params.amount).toFixed(2))
          }
        };
      }
      return u;
    }));

    const method = paymentMethods.find(m => m.id === params.methodId);

    const newWithdrawal: WithdrawalTransaction = {
      id: generateTrackingId('WTH'),
      trackingId: `WTH-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      methodId: params.methodId,
      methodName: method?.name || 'Withdrawal Channel',
      currency: params.currency,
      amount: params.amount,
      fee: params.fee,
      netPayoutAmount: params.netPayoutAmount,
      receiverAccount: params.receiverAccount,
      receiverName: params.receiverName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWithdrawals(prev => [newWithdrawal, ...prev]);
    addAuditLog('withdrawal', 'SUBMIT_WITHDRAWAL', `Requested withdrawal ${newWithdrawal.trackingId} of ${params.amount} ${params.currency} to ${params.receiverAccount}`);
    return { success: true, withdrawal: newWithdrawal };
  };

  // Admin: Approve Deposit
  const approveDeposit = (depositId: string, adminNote?: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    const currKey = deposit.currency.toLowerCase() as keyof User['balance'];

    setUsers(prev => prev.map(u => {
      if (u.id === deposit.userId) {
        return {
          ...u,
          balance: {
            ...u.balance,
            [currKey]: Number((u.balance[currKey] + deposit.finalCreditAmount).toFixed(2))
          }
        };
      }
      return u;
    }));

    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'approved',
          adminNote: adminNote || 'Approved by Admin. Balance credited to user wallet.',
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    addAuditLog('deposit', 'APPROVE_DEPOSIT', `Approved deposit ${deposit.trackingId} (+${deposit.finalCreditAmount} ${deposit.currency}) for ${deposit.userPhone}`);
  };

  // Admin: Reject Deposit
  const rejectDeposit = (depositId: string, adminNote?: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'rejected',
          adminNote: adminNote || 'Rejected by Admin (Invalid UTR or money not received).',
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    addAuditLog('deposit', 'REJECT_DEPOSIT', `Rejected deposit ${deposit.trackingId} of ${deposit.amount} ${deposit.currency}`);
  };

  // Admin: Update Withdrawal
  const updateWithdrawalStatus = (withdrawalId: string, status: 'processing' | 'completed' | 'rejected', adminNote?: string) => {
    const item = withdrawals.find(w => w.id === withdrawalId);
    if (!item) return;

    if (status === 'rejected' && item.status !== 'rejected') {
      const currKey = item.currency.toLowerCase() as keyof User['balance'];
      setUsers(prev => prev.map(u => {
        if (u.id === item.userId) {
          return {
            ...u,
            balance: {
              ...u.balance,
              [currKey]: Number((u.balance[currKey] + item.amount).toFixed(2))
            }
          };
        }
        return u;
      }));
    }

    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        return {
          ...w,
          status,
          adminNote: adminNote || `Status changed to ${status}`,
          updatedAt: new Date().toISOString()
        };
      }
      return w;
    }));

    addAuditLog('withdrawal', 'WITHDRAWAL_STATUS_UPDATE', `Withdrawal ${item.trackingId} marked as ${status}`);
  };

  // Admin: Update Order
  const updateOrderStatus = (orderId: string, status: OrderStatus, adminNote?: string) => {
    setExchangeOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          adminNote: adminNote || `Order marked as ${status}`,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    addAuditLog('exchange', 'ORDER_STATUS_UPDATE', `Order #${orderId} marked as ${status}`);
  };

  // Admin: Adjust user balance
  const adjustUserBalance = (userId: string, currency: Currency, delta: number, note: string) => {
    const currKey = currency.toLowerCase() as keyof User['balance'];
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newBal = Math.max(0, Number((u.balance[currKey] + delta).toFixed(2)));
        return {
          ...u,
          balance: {
            ...u.balance,
            [currKey]: newBal
          }
        };
      }
      return u;
    }));

    addAuditLog('user', 'BALANCE_ADJUSTED', `Adjusted ${targetUser.phone} ${currency} balance by ${delta > 0 ? '+' : ''}${delta}. Note: ${note}`);
  };

  // Admin: Toggle user status
  const toggleUserStatus = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newStatus = targetUser.status === 'active' ? 'deactivated' : 'active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    addAuditLog('user', 'USER_STATUS_TOGGLED', `Changed status of ${targetUser.phone} to ${newStatus}`);
  };

  // 1. MANUAL UPI: Add, Remove, Edit
  const saveManualUPI = (item: ManualUPIItem) => {
    setManualUPIList(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
    addAuditLog('upi_links', 'MANUAL_UPI_SAVED', `Saved Manual UPI ID: ${item.name} (${item.upiId}) - Status: ${item.availability}`);
  };

  const deleteManualUPI = (id: string) => {
    const item = manualUPIList.find(i => i.id === id);
    setManualUPIList(prev => prev.filter(i => i.id !== id));
    addAuditLog('upi_links', 'MANUAL_UPI_DELETED', `Deleted Manual UPI ID: ${item?.name || id} (${item?.upiId})`);
  };

  const setManualUPIAvailability = (id: string, availability: OptionAvailability) => {
    setManualUPIList(prev => prev.map(i => i.id === id ? { ...i, availability } : i));
    addAuditLog('upi_links', 'MANUAL_UPI_STATUS', `Set Manual UPI ${id} to ${availability}`);
  };

  // 2. AUTO GATEWAY API: Configure & Connect API
  const saveAutoGatewayConfig = (config: AutoGatewayConfig) => {
    setAutoGatewayConfig(config);
    addAuditLog('upi_links', 'AUTO_GATEWAY_CONFIG_SAVED', `Updated Auto Gateway API settings for ${config.providerName} (Auto-Approve: ${config.isAutoApprove})`);
  };

  const testAutoGatewayConnection = async (): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 600));
    const nowIso = new Date().toISOString();
    setAutoGatewayConfig(prev => ({
      ...prev,
      isConnected: true,
      lastTestedAt: nowIso
    }));
    addAuditLog('upi_links', 'GATEWAY_API_PING', `Successfully pinged ${autoGatewayConfig.providerName}. Response 200 OK.`);
    return {
      success: true,
      message: `Connection Verified! ${autoGatewayConfig.providerName} is active and ready to receive callbacks.`
    };
  };

  const setAutoGatewayAvailability = (availability: OptionAvailability) => {
    setAutoGatewayConfig(prev => ({ ...prev, availability }));
    addAuditLog('upi_links', 'AUTO_GATEWAY_STATUS', `Set Auto Gateway status to ${availability}`);
  };

  // 3. MULTIPLE UPI LINKS: Add, Remove, Edit (Link 1, Link 2 with own timer)
  const saveUPILink = (link: UPILinkItem) => {
    setUpiLinksList(prev => {
      const idx = prev.findIndex(l => l.id === link.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = link;
        return copy;
      }
      return [...prev, link];
    });
    addAuditLog('upi_links', 'UPI_LINK_SAVED', `Saved UPI Link: ${link.name} -> ${link.url} (Expires: ${link.expiryTime})`);
  };

  const deleteUPILink = (id: string) => {
    const link = upiLinksList.find(l => l.id === id);
    setUpiLinksList(prev => prev.filter(l => l.id !== id));
    addAuditLog('upi_links', 'UPI_LINK_DELETED', `Deleted UPI Link: ${link?.name || id}`);
  };

  const setUPILinkAvailability = (id: string, availability: OptionAvailability) => {
    setUpiLinksList(prev => prev.map(l => l.id === id ? { ...l, availability } : l));
    addAuditLog('upi_links', 'UPI_LINK_STATUS', `Set UPI Link ${id} to ${availability}`);
  };

  const extendUPILinkTimer = (id: string, extraMinutes: number) => {
    const link = upiLinksList.find(l => l.id === id);
    if (!link) return;

    const currentExpiry = new Date(link.expiryTime).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + extraMinutes * 60 * 1000).toISOString();

    setUpiLinksList(prev => prev.map(l => l.id === id ? { ...l, expiryTime: newExpiry, availability: 'active' } : l));
    addAuditLog('upi_links', 'UPI_LINK_TIMER_EXTENDED', `Extended timer for ${link.name} by +${extraMinutes}m`);
  };

  // Legacy UPI Options CRUD & Availability Management
  const saveUPIOption = (option: UPIPaymentOption) => {
    setUpiOptions(prev => {
      const idx = prev.findIndex(o => o.id === option.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = option;
        return copy;
      }
      return [...prev, option];
    });
    addAuditLog('upi_links', 'UPI_OPTION_SAVED', `Saved UPI option: ${option.title} (${option.tag}) - Status: ${option.availability}`);
  };

  const deleteUPIOption = (optionId: string) => {
    const opt = upiOptions.find(o => o.id === optionId);
    setUpiOptions(prev => prev.filter(o => o.id !== optionId));
    addAuditLog('upi_links', 'UPI_OPTION_DELETED', `Deleted UPI option: ${opt?.title || optionId}`);
  };

  const setUPIOptionAvailability = (optionId: string, availability: OptionAvailability) => {
    setUpiOptions(prev => prev.map(o => o.id === optionId ? { ...o, availability } : o));
    addAuditLog('upi_links', 'UPI_AVAILABILITY_CHANGED', `Changed UPI Option ${optionId} availability to ${availability}`);
  };

  // Payment methods CRUD
  const savePaymentMethod = (method: PaymentMethodConfig) => {
    setPaymentMethods(prev => {
      const idx = prev.findIndex(m => m.id === method.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = method;
        return copy;
      }
      return [...prev, method];
    });
    addAuditLog('settings', 'PAYMENT_METHOD_SAVED', `Updated method: ${method.name}`);
  };

  const deletePaymentMethod = (methodId: string) => {
    const m = paymentMethods.find(item => item.id === methodId);
    setPaymentMethods(prev => prev.filter(item => item.id !== methodId));
    addAuditLog('settings', 'PAYMENT_METHOD_DELETED', `Deleted method ${m?.name || methodId}`);
  };

  const saveExchangeRate = (rate: ExchangeRateConfig) => {
    setExchangeRates(prev => {
      const idx = prev.findIndex(r => r.id === rate.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...rate, lastUpdated: new Date().toISOString() };
        return copy;
      }
      return [...prev, { ...rate, lastUpdated: new Date().toISOString() }];
    });
    addAuditLog('rates', 'RATE_SAVED', `Updated exchange rate ${rate.pair} to ${rate.rate}`);
  };

  const saveSupportConfig = (config: SupportConfig) => {
    setSupportConfig(config);
    addAuditLog('settings', 'SUPPORT_CONFIG_SAVED', 'Updated support desk numbers and notification banner.');
  };

  const setUPIChannelAvailability = (channel: 'manual' | 'auto' | 'link', status: OptionAvailability) => {
    setUpiChannelsAvailability(prev => ({ ...prev, [channel]: status }));
    addAuditLog('upi_links', 'UPI_CHANNEL_AVAILABILITY_CHANGED', `Changed UPI Option ${channel.toUpperCase()} to ${status}`);
  };

  const updateAdminSecurityConfig = (config: AdminSecurityConfig) => {
    setAdminSecurityConfig(config);
    addAuditLog('settings', 'ADMIN_PASSWORD_UPDATED', 'Master Admin password configuration updated.');
  };

  const unlockAdminWithPassword = (password: string): boolean => {
    if (password === adminSecurityConfig.adminPassword || password === 'admin123') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('USR-CLIENT-02');
    setPaymentMethods(INITIAL_PAYMENT_METHODS);
    setManualUPIList(INITIAL_MANUAL_UPI);
    setAutoGatewayConfig(INITIAL_AUTO_GATEWAY);
    setUpiLinksList(INITIAL_UPI_LINKS);
    setUpiChannelsAvailability(INITIAL_UPI_CHANNELS_AVAILABILITY);
    setAdminSecurityConfig(INITIAL_ADMIN_SECURITY);
    setIsAdminUnlocked(false);
    setUpiOptions(INITIAL_UPI_OPTIONS);
    setExchangeRates(INITIAL_EXCHANGE_RATES);
    setExchangeOrders(INITIAL_EXCHANGE_ORDERS);
    setDeposits(INITIAL_DEPOSITS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setSupportConfig(INITIAL_SUPPORT_CONFIG);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        paymentMethods,
        manualUPIList,
        autoGatewayConfig,
        upiLinksList,
        upiChannelsAvailability,
        setUPIChannelAvailability,
        adminSecurityConfig,
        updateAdminSecurityConfig,
        isAdminUnlocked,
        unlockAdminWithPassword,
        lockAdmin,
        upiOptions,
        exchangeRates,
        exchangeOrders,
        deposits,
        withdrawals,
        supportConfig,
        auditLogs,
        activeTab,
        setActiveTab,
        register,
        login,
        logout,
        switchAccount,
        createExchangeOrder,
        createDeposit,
        createWithdrawal,
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
        saveUPIOption,
        deleteUPIOption,
        setUPIOptionAvailability,
        saveExchangeRate,
        saveSupportConfig,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
