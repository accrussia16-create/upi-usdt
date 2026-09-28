import {
  User,
  PaymentMethodConfig,
  ManualUPIItem,
  AutoGatewayConfig,
  UPILinkItem,
  UPIPaymentOption,
  ExchangeOrder,
  DepositTransaction,
  WithdrawalTransaction,
  ExchangeRateConfig,
  SupportConfig,
  AuditLog
} from '../types';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const hoursAhead = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-ADMIN-01',
    phone: '+92 300 1234567',
    fullName: 'Master Administrator',
    role: 'admin',
    status: 'active',
    balance: {
      pkr: 1500000,
      inr: 450000,
      usdt: 12500.00
    },
    createdAt: hoursAgo(120),
    lastLogin: hoursAgo(1)
  },
  {
    id: 'USR-CLIENT-02',
    phone: '+92 312 9876543',
    fullName: 'Ali Hassan (Client)',
    role: 'user',
    status: 'active',
    balance: {
      pkr: 54200,
      inr: 16800,
      usdt: 345.50
    },
    createdAt: hoursAgo(90),
    lastLogin: hoursAgo(2)
  },
  {
    id: 'USR-CLIENT-03',
    phone: '+91 98765 43210',
    fullName: 'Rahul Sharma (Trader)',
    role: 'user',
    status: 'active',
    balance: {
      pkr: 12000,
      inr: 42500,
      usdt: 180.00
    },
    createdAt: hoursAgo(48),
    lastLogin: hoursAgo(5)
  },
  {
    id: 'USR-CLIENT-04',
    phone: '+92 345 0001122',
    fullName: 'Kamran Tariq (Suspended)',
    role: 'user',
    status: 'deactivated',
    balance: {
      pkr: 250,
      inr: 0,
      usdt: 0
    },
    createdAt: hoursAgo(150),
    lastLogin: hoursAgo(80)
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'method-upi-01',
    code: 'upi',
    name: 'UPI Deposit (India)',
    currency: 'INR',
    icon: '⚡',
    type: 'fiat',
    accountTitle: 'UPI-Pay Official Gateway',
    accountNumber: 'upipay.official@icici',
    instructions: 'Choose between Manual UPI, Auto Gateway [FAST], or UPI Links.',
    minAmount: 100,
    maxAmount: 200000,
    feePercentage: 0,
    isActive: true,
    receiverFieldLabel: 'Your UPI ID / VPA',
    receiverFieldPlaceholder: 'e.g. yourname@okhdfcbank'
  },
  {
    id: 'method-easypaisa-02',
    code: 'easypaisa',
    name: 'EasyPaisa Wallet',
    currency: 'PKR',
    icon: '🟢',
    type: 'fiat',
    accountTitle: 'Muhammad Usman - Finance Desk',
    accountNumber: '0345-9871234',
    instructions: 'Transfer exact PKR amount to our EasyPaisa account. Submit TRX ID after sending for manual admin approval.',
    minAmount: 500,
    maxAmount: 500000,
    feePercentage: 0.5,
    isActive: true,
    receiverFieldLabel: 'EasyPaisa Mobile Number',
    receiverFieldPlaceholder: 'e.g. 03451234567'
  },
  {
    id: 'method-jazzcash-03',
    code: 'jazzcash',
    name: 'JazzCash Wallet',
    currency: 'PKR',
    icon: '🔴',
    type: 'fiat',
    accountTitle: 'Zubair Ahmed - Exchange Operations',
    accountNumber: '0301-4455667',
    instructions: 'Send money to our official JazzCash account. Enter TID from SMS after transfer.',
    minAmount: 500,
    maxAmount: 500000,
    feePercentage: 0.5,
    isActive: true,
    receiverFieldLabel: 'JazzCash Mobile Number',
    receiverFieldPlaceholder: 'e.g. 03001234567'
  },
  {
    id: 'method-usdt-trc20-04',
    code: 'usdt_trc20',
    name: 'USDT (TRC20)',
    currency: 'USDT',
    icon: '₮',
    type: 'crypto',
    accountTitle: 'TRON TRC20 Deposit Pool',
    accountNumber: 'TKx8Pz9Xm4qB5L7e2V1wF6dY3sA9cT4hG8',
    instructions: 'Send USDT via TRC-20 network. Enter TxHash after sending for admin verification.',
    minAmount: 10,
    maxAmount: 50000,
    feePercentage: 0,
    isActive: true,
    receiverFieldLabel: 'USDT TRC20 Receiving Address',
    receiverFieldPlaceholder: 'e.g. T...'
  }
];

/**
 * 1. MANUAL UPI IDs: Admin can Add, Remove, or Edit
 */
export const INITIAL_MANUAL_UPI: ManualUPIItem[] = [
  {
    id: 'man-upi-1',
    name: 'Primary UPI ID (Axis Bank)',
    upiId: 'merchant91pay@axisbank',
    payeeName: 'Fast Pay Merchant Settlement Desk',
    instructions: 'Copy this UPI ID, transfer from GPay, PhonePe, or Paytm, then enter your 12-digit UTR below for manual credit.',
    availability: 'active',
    createdAt: hoursAgo(48)
  },
  {
    id: 'man-upi-2',
    name: 'Backup High-Volume UPI (ICICI)',
    upiId: 'upipay.official@icici',
    payeeName: 'Global Exchange Finance Ops',
    instructions: 'Use this backup UPI ID if Primary has limit issues. Submit your 12-digit UTR below after payment.',
    availability: 'active',
    createdAt: hoursAgo(24)
  }
];

/**
 * 2. AUTO PAYMENT GATEWAY: Admin can connect to API for instant auto-credit
 */
export const INITIAL_AUTO_GATEWAY: AutoGatewayConfig = {
  id: 'auto-gate-01',
  providerName: '91Jeeto Gateway API (Official Provider)',
  merchantId: 'MCH_JEETO_994821',
  apiKey: 'live_api_key_8849201948201bxa',
  apiSecret: 'sec_hash_992147bb831aef42',
  webhookUrl: 'https://api.upipay.network/v1/callbacks/auto-credit',
  environment: 'production',
  isConnected: true,
  isAutoApprove: true, // Enables instant auto-credit to user wallet!
  availability: 'active',
  minAmount: 200,
  maxAmount: 200000,
  lastTestedAt: hoursAgo(1),
  notes: 'Connected to official automated payment gateway provider for instant wallet crediting.'
};

/**
 * 3. MULTIPLE UPI LINKS: Each named like Link 1, Link 2 with its own live countdown timer!
 */
export const INITIAL_UPI_LINKS: UPILinkItem[] = [
  {
    id: 'link-01',
    name: 'Link 1 (VIP Fast Gateway)',
    url: 'https://p.paytm.me/xP/vip_fast_pay',
    startTime: hoursAgo(2),
    expiryTime: hoursAhead(24), // 24 hours timer
    afterExpiryAction: 'mark_unavailable',
    availability: 'active',
    instructions: 'Click Open UPI Link to pay via VIP Fast channel. After payment, enter your 12-digit UTR below.',
    priority: 1,
    createdAt: hoursAgo(2)
  },
  {
    id: 'link-02',
    name: 'Link 2 (PhonePe Gateway)',
    url: 'https://phon.pe/pay/desk_merchant_link2',
    startTime: hoursAgo(5),
    expiryTime: hoursAhead(12), // 12 hours timer
    afterExpiryAction: 'mark_unavailable',
    availability: 'active',
    instructions: 'Click Open UPI Link to pay via PhonePe channel. Submit your 12-digit UTR below.',
    priority: 2,
    createdAt: hoursAgo(5)
  },
  {
    id: 'link-03',
    name: 'Link 3 (Gaming TopUp Link)',
    url: 'https://pay.upipay.network/link3?ref=91jeeto',
    startTime: hoursAgo(1),
    expiryTime: hoursAhead(6), // 6 hours timer
    afterExpiryAction: 'auto_remove',
    availability: 'active',
    instructions: 'Click Open UPI Link to pay on Gaming TopUp link. Enter UTR reference below after payment.',
    priority: 3,
    createdAt: hoursAgo(1)
  }
];

/**
 * Legacy UPI Payment Options (for backward compatibility)
 */
export const INITIAL_UPI_OPTIONS: UPIPaymentOption[] = [
  {
    id: 'upi-opt-manual',
    subType: 'manual',
    title: 'Manual UPI (Direct UPI ID & QR)',
    tag: 'MANUAL',
    availability: 'active',
    upiId: 'merchant91pay@axisbank',
    payeeName: 'Fast Pay Merchant Settlement Desk',
    instructions: 'Copy our official UPI ID or scan QR code. Send money from your GPay, PhonePe, Paytm, or BHIM. Enter your 12-digit UTR below.',
    minAmount: 100,
    maxAmount: 200000,
    startTime: hoursAgo(48),
    expiryTime: hoursAhead(168),
    isAutoApprove: false,
    priority: 1,
    notes: 'Direct collection into merchant bank account'
  },
  {
    id: 'upi-opt-auto-gateway',
    subType: 'auto_gateway',
    title: 'Auto Gateway [FAST] (API Connected)',
    tag: 'AUTO',
    availability: 'active',
    upiId: 'autogateway@axisbank',
    payeeName: '91Jeeto Gateway API (Auto-Credit)',
    gatewayUrl: 'https://checkout.upipay.network/live/pay?provider=jeeto_fast',
    instructions: 'Instant automated payment system. Connects to official payment provider and automatically credits your wallet without manual admin waiting.',
    minAmount: 200,
    maxAmount: 200000,
    startTime: hoursAgo(10),
    expiryTime: hoursAhead(72),
    isAutoApprove: true,
    priority: 2,
    notes: 'Official provider API integration'
  },
  {
    id: 'upi-opt-links',
    subType: 'upi_link',
    title: 'UPI Link (Multiple Timed Links)',
    tag: 'UPI LINK',
    availability: 'active',
    upiId: 'wallet.desk@paytm',
    payeeName: 'Multi-Link External Wallet Gateways',
    walletUrl: 'https://p.paytm.me/xP/vip_fast_pay',
    instructions: 'Select from Link 1, Link 2, etc. Each link has its own live timer. Click Open UPI Link to pay and submit UTR.',
    minAmount: 200,
    maxAmount: 300000,
    startTime: hoursAgo(24),
    expiryTime: hoursAhead(120),
    isAutoApprove: false,
    priority: 3,
    notes: 'Third party wallet collection portal'
  }
];

export const INITIAL_EXCHANGE_RATES: ExchangeRateConfig[] = [
  {
    id: 'rate-pkr-inr',
    pair: 'PKR_TO_INR',
    fromCurrency: 'PKR',
    toCurrency: 'INR',
    rate: 0.308,
    spreadPercent: 1.0,
    minAmount: 1000,
    maxAmount: 500000,
    isActive: true,
    lastUpdated: hoursAgo(1)
  },
  {
    id: 'rate-inr-pkr',
    pair: 'INR_TO_PKR',
    fromCurrency: 'INR',
    toCurrency: 'PKR',
    rate: 3.245,
    spreadPercent: 1.0,
    minAmount: 500,
    maxAmount: 200000,
    isActive: true,
    lastUpdated: hoursAgo(1)
  },
  {
    id: 'rate-usdt-pkr',
    pair: 'USDT_TO_PKR',
    fromCurrency: 'USDT',
    toCurrency: 'PKR',
    rate: 285.50,
    spreadPercent: 0.5,
    minAmount: 10,
    maxAmount: 25000,
    isActive: true,
    lastUpdated: hoursAgo(1)
  },
  {
    id: 'rate-pkr-usdt',
    pair: 'PKR_TO_USDT',
    fromCurrency: 'PKR',
    toCurrency: 'USDT',
    rate: 0.00350,
    spreadPercent: 0.8,
    minAmount: 3000,
    maxAmount: 1000000,
    isActive: true,
    lastUpdated: hoursAgo(1)
  }
];

export const INITIAL_DEPOSITS: DepositTransaction[] = [
  {
    id: 'dep-01',
    trackingId: 'DEP-98124-1102',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-upi-01',
    methodName: 'UPI Deposit (India)',
    currency: 'INR',
    amount: 5000,
    fee: 0,
    finalCreditAmount: 5000,
    upiSubType: 'manual',
    upiIdUsed: 'merchant91pay@axisbank',
    utrNumber: '409182379102',
    senderAccount: 'ali.hassan@okaxis',
    proofNote: 'Paid via GPay app',
    status: 'approved',
    isAutoApproved: false,
    adminNote: 'Verified in Axis statement',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(3.8)
  },
  {
    id: 'dep-02',
    trackingId: 'DEP-84192-3391',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-easypaisa-02',
    methodName: 'EasyPaisa Wallet',
    currency: 'PKR',
    amount: 15000,
    fee: 0,
    finalCreditAmount: 15000,
    utrNumber: 'TRX-91823019',
    senderAccount: '0312-9876543',
    proofNote: 'EasyPaisa app transaction proof',
    status: 'approved',
    isAutoApproved: false,
    adminNote: 'Confirmed by finance desk',
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(23.5)
  },
  {
    id: 'dep-03',
    trackingId: 'DEP-10294-8841',
    userId: 'USR-CLIENT-03',
    userPhone: '+91 98765 43210',
    methodId: 'method-upi-01',
    methodName: 'UPI Deposit (India)',
    currency: 'INR',
    amount: 2000,
    fee: 0,
    finalCreditAmount: 2000,
    upiSubType: 'auto_gateway',
    upiIdUsed: 'autogateway@axisbank',
    utrNumber: 'AUTO-409182749102',
    senderAccount: '919876543210',
    proofNote: '91Jeeto Gateway API Auto-Approval',
    status: 'approved',
    isAutoApproved: true,
    adminNote: 'Instant Gateway Callback Verified',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1)
  },
  {
    id: 'dep-04',
    trackingId: 'DEP-55192-7711',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-upi-01',
    methodName: 'UPI Deposit (India)',
    currency: 'INR',
    amount: 12500,
    fee: 0,
    finalCreditAmount: 12500,
    upiSubType: 'upi_link',
    upiLinkName: 'Link 1 (VIP Fast Server)',
    utrNumber: '409182881902',
    status: 'approved',
    isAutoApproved: false,
    createdAt: hoursAgo(46),
    updatedAt: hoursAgo(45.5)
  },
  {
    id: 'dep-05',
    trackingId: 'DEP-33918-2210',
    userId: 'USR-CLIENT-03',
    userPhone: '+91 98765 43210',
    methodId: 'method-upi-01',
    methodName: 'UPI Auto Instant Gateway',
    currency: 'INR',
    amount: 18000,
    fee: 0,
    finalCreditAmount: 18000,
    upiSubType: 'auto_gateway',
    utrNumber: 'AUTO-91823901',
    status: 'approved',
    isAutoApproved: true,
    createdAt: hoursAgo(70),
    updatedAt: hoursAgo(70)
  },
  {
    id: 'dep-06',
    trackingId: 'DEP-22819-4451',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-easypaisa-02',
    methodName: 'EasyPaisa Wallet',
    currency: 'PKR',
    amount: 35000,
    fee: 0,
    finalCreditAmount: 35000,
    utrNumber: 'EP-44182901',
    status: 'approved',
    createdAt: hoursAgo(94),
    updatedAt: hoursAgo(93)
  },
  {
    id: 'dep-07',
    trackingId: 'DEP-11782-9901',
    userId: 'USR-CLIENT-03',
    userPhone: '+91 98765 43210',
    methodId: 'method-upi-01',
    methodName: 'UPI Deposit (India)',
    currency: 'INR',
    amount: 24000,
    fee: 0,
    finalCreditAmount: 24000,
    upiSubType: 'manual',
    utrNumber: '409177625109',
    status: 'approved',
    createdAt: hoursAgo(118),
    updatedAt: hoursAgo(117)
  },
  {
    id: 'dep-08',
    trackingId: 'DEP-09823-1122',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-upi-01',
    methodName: 'UPI Deposit (India)',
    currency: 'INR',
    amount: 16500,
    fee: 0,
    finalCreditAmount: 16500,
    upiSubType: 'upi_link',
    upiLinkName: 'Link 2 (HDFC Direct Fast)',
    utrNumber: '409166542100',
    status: 'approved',
    createdAt: hoursAgo(142),
    updatedAt: hoursAgo(141)
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalTransaction[] = [
  {
    id: 'wth-01',
    trackingId: 'WTH-48192-9912',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-easypaisa-02',
    methodName: 'EasyPaisa Wallet',
    currency: 'PKR',
    amount: 10000,
    fee: 50,
    netPayoutAmount: 9950,
    receiverAccount: '0312-9876543',
    receiverName: 'Ali Hassan',
    status: 'completed',
    adminNote: 'Dispatched via EasyPaisa Corp API',
    createdAt: hoursAgo(14),
    updatedAt: hoursAgo(13.8)
  },
  {
    id: 'wth-02',
    trackingId: 'WTH-33190-8812',
    userId: 'USR-CLIENT-03',
    userPhone: '+91 98765 43210',
    methodId: 'method-upi-01',
    methodName: 'UPI Payout',
    currency: 'INR',
    amount: 4500,
    fee: 0,
    netPayoutAmount: 4500,
    receiverAccount: '919876543210@paytm',
    receiverName: 'Priya Sharma',
    status: 'completed',
    createdAt: hoursAgo(38),
    updatedAt: hoursAgo(37)
  },
  {
    id: 'wth-03',
    trackingId: 'WTH-22194-5510',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-jazzcash-03',
    methodName: 'JazzCash Wallet',
    currency: 'PKR',
    amount: 22000,
    fee: 100,
    netPayoutAmount: 21900,
    receiverAccount: '0300-1234567',
    receiverName: 'Ali Hassan',
    status: 'completed',
    createdAt: hoursAgo(65),
    updatedAt: hoursAgo(64)
  },
  {
    id: 'wth-04',
    trackingId: 'WTH-11928-3329',
    userId: 'USR-CLIENT-03',
    userPhone: '+91 98765 43210',
    methodId: 'method-upi-01',
    methodName: 'UPI Payout',
    currency: 'INR',
    amount: 9500,
    fee: 0,
    netPayoutAmount: 9500,
    receiverAccount: 'priya@okhdfcbank',
    receiverName: 'Priya Sharma',
    status: 'completed',
    createdAt: hoursAgo(90),
    updatedAt: hoursAgo(89)
  },
  {
    id: 'wth-05',
    trackingId: 'WTH-09182-4411',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    methodId: 'method-easypaisa-02',
    methodName: 'EasyPaisa Wallet',
    currency: 'PKR',
    amount: 18000,
    fee: 80,
    netPayoutAmount: 17920,
    receiverAccount: '0312-9876543',
    receiverName: 'Ali Hassan',
    status: 'completed',
    createdAt: hoursAgo(138),
    updatedAt: hoursAgo(137)
  }
];

export const INITIAL_EXCHANGE_ORDERS: ExchangeOrder[] = [
  {
    id: 'ord-01',
    trackingCode: 'ORD-77491-01',
    userId: 'USR-CLIENT-02',
    userPhone: '+92 312 9876543',
    fromCurrency: 'PKR',
    toCurrency: 'INR',
    fromMethodId: 'method-easypaisa-02',
    fromMethodName: 'EasyPaisa Wallet',
    toMethodId: 'method-upi-01',
    toMethodName: 'UPI (India)',
    sendAmount: 10000,
    receiveAmount: 3080,
    exchangeRate: 0.308,
    feeAmount: 50,
    senderAccount: '0312-9876543',
    receiverAccount: 'ali.settle@okhdfcbank',
    receiverName: 'Ali Hassan',
    utrOrTxId: 'TRX-774910',
    status: 'completed',
    adminNote: 'Settled to Indian beneficiary',
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(29.5)
  }
];

export const INITIAL_SUPPORT_CONFIG: SupportConfig = {
  whatsappNumber: '+92 300 1234567',
  whatsappMessage: 'Hello Support, I need assistance with my UPI exchange order/deposit.',
  telegramHandle: '@UPIPayExchangeSupport',
  supportEmail: 'support@upipay-exchange.com',
  noticeBannerText: '⚡ 24/7 Fast Top-Up & Withdrawal active! UPI, EasyPaisa, JazzCash & USDT supported.',
  noticeBannerActive: true,
  helpdeskWorkingHours: '24 Hours / 7 Days a week'
};

export const INITIAL_UPI_CHANNELS_AVAILABILITY = {
  manual: 'active' as const,
  auto: 'active' as const,
  link: 'active' as const
};

export const INITIAL_ADMIN_SECURITY = {
  adminPassword: 'admin123',
  requirePasswordPrompt: true
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    adminId: 'USR-ADMIN-01',
    adminPhone: '+92 300 1234567',
    action: 'SYSTEM_BOOT',
    category: 'settings',
    details: 'System initialized with Manual UPI, Auto Gateway, and Multiple Timed UPI Links.',
    timestamp: hoursAgo(120)
  }
];
