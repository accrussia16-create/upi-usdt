export type Currency = 'PKR' | 'INR' | 'USDT';

export type PaymentMethodCode = 'upi' | 'easypaisa' | 'jazzcash' | 'usdt_trc20' | 'usdt_bep20' | 'bank_transfer';

export type UPISubType = 'manual' | 'auto_gateway' | 'upi_link' | 'wallet_3p';
export type OptionAvailability = 'active' | 'unavailable' | 'hidden';

export interface UserBalances {
  pkr: number;
  inr: number;
  usdt: number;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  role: 'user' | 'admin';
  status: 'active' | 'deactivated';
  balance: UserBalances;
  createdAt: string;
  lastLogin: string;
  passwordHash?: string;
  salt?: string;
}

export interface PaymentMethodConfig {
  id: string;
  code: PaymentMethodCode;
  name: string;
  currency: Currency;
  icon: string;
  type: 'fiat' | 'crypto';
  accountTitle: string;
  accountNumber: string;
  qrCodeUrl?: string;
  instructions: string;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  isActive: boolean;
  receiverFieldLabel: string;
  receiverFieldPlaceholder: string;
}

/**
 * 1. Manual UPI Item (Admin can Add, Remove, Edit UPI ID)
 */
export interface ManualUPIItem {
  id: string;
  name: string; // e.g. "Primary UPI ID", "HDFC Desk"
  upiId: string; // e.g. "upipay.desk@icici"
  payeeName: string;
  instructions?: string;
  availability: OptionAvailability; // 'active' | 'unavailable' | 'hidden'
  createdAt: string;
}

/**
 * 2. Auto Payment Gateway Configuration (Admin can Connect to API)
 */
export interface AutoGatewayConfig {
  id: string;
  providerName: string; // e.g. "91Jeeto Gateway API", "Cashfree", "PayU"
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  environment: 'production' | 'sandbox';
  isConnected: boolean;
  isAutoApprove: boolean; // Auto-credits user balance
  availability: OptionAvailability; // 'active' | 'unavailable' | 'hidden'
  minAmount: number;
  maxAmount: number;
  lastTestedAt?: string;
  notes?: string;
}

/**
 * 3. UPI Link Item (Admin can Add multiple links named Link 1, Link 2 with own countdown timer)
 */
export interface UPILinkItem {
  id: string;
  name: string; // e.g. "Link 1", "Link 2", "Link 3" (User sees this)
  url: string; // payment link
  startTime: string; // ISO String
  expiryTime: string; // ISO String
  afterExpiryAction: 'mark_unavailable' | 'auto_remove';
  availability: OptionAvailability; // 'active' | 'unavailable' | 'hidden'
  instructions?: string;
  priority: number;
  createdAt: string;
}

/**
 * General UPI Payment Option (Backward compatibility helper)
 */
export interface UPIPaymentOption {
  id: string;
  subType: UPISubType; // 'manual' | 'auto_gateway' | 'upi_link' | 'wallet_3p'
  title: string;
  tag: string; // 'MANUAL', 'AUTO', 'UPI LINK'
  availability: OptionAvailability; // 'active' | 'unavailable' | 'hidden'
  upiId: string;
  payeeName: string;
  walletUrl?: string; // payment link
  gatewayUrl?: string; // auto gateway URL
  instructions: string;
  minAmount: number;
  maxAmount: number;
  startTime: string; // ISO String
  expiryTime: string; // ISO String
  afterExpiryAction?: 'mark_unavailable' | 'auto_remove';
  isAutoApprove: boolean;
  priority: number;
  notes?: string;
}

export interface UPIChannelsAvailability {
  manual: OptionAvailability; // 'active' | 'unavailable' | 'hidden'
  auto: OptionAvailability;   // 'active' | 'unavailable' | 'hidden'
  link: OptionAvailability;   // 'active' | 'unavailable' | 'hidden'
}

export interface AdminSecurityConfig {
  adminPassword: string; // Admin panel access password (default: 'admin123')
  requirePasswordPrompt: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface ExchangeOrder {
  id: string;
  trackingCode: string;
  userId: string;
  userPhone: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromMethodId: string;
  fromMethodName: string;
  toMethodId: string;
  toMethodName: string;
  sendAmount: number;
  receiveAmount: number;
  exchangeRate: number;
  feeAmount: number;
  senderAccount?: string;
  receiverAccount: string;
  receiverName?: string;
  utrOrTxId?: string;
  status: OrderStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface DepositTransaction {
  id: string;
  trackingId: string;
  userId: string;
  userPhone: string;
  methodId: string;
  methodName: string;
  currency: Currency;
  amount: number;
  fee: number;
  finalCreditAmount: number;
  upiOptionId?: string;
  upiSubType?: UPISubType;
  upiIdUsed?: string;
  upiLinkName?: string;
  utrNumber: string;
  senderAccount?: string;
  proofNote?: string;
  status: TransactionStatus;
  isAutoApproved?: boolean;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface WithdrawalTransaction {
  id: string;
  trackingId: string;
  userId: string;
  userPhone: string;
  methodId: string;
  methodName: string;
  currency: Currency;
  amount: number;
  fee: number;
  netPayoutAmount: number;
  receiverAccount: string;
  receiverName: string;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateConfig {
  id: string;
  pair: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  spreadPercent: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminPhone: string;
  action: string;
  category: 'deposit' | 'withdrawal' | 'exchange' | 'user' | 'rates' | 'upi_links' | 'settings';
  details: string;
  timestamp: string;
}

export interface SupportConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  telegramHandle: string;
  supportEmail: string;
  noticeBannerText: string;
  noticeBannerActive: boolean;
  helpdeskWorkingHours: string;
}
