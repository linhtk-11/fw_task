export type PaymentGateway = 'Fastway Wallet' | 'Fastway Credit' | 'Bank Wire' | 'Direct Debit';

export interface OrderItem {
  id: string;
  orderName: string;
  paymentDate: string;
  paymentGateway: PaymentGateway;
  qty: number;
  weightGr: number;
  shippingFee: number;
  relabelFee: number;
  discount: number;
  tax: number;
  overLengthFee: number;
  seasonalFee: number;
  signatureFee: number;
  surcharge: number;
  cancelFee: number;
  refund: number;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Refunded';
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  billingAddress: string;
  accountNumber: string;
  swiftBic: string;
  bankName: string;
  bankAddress: string;
}

export interface MappedCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  assignedDate: string;
}

export interface BillingEntity {
  id: string;
  code: string; // e.g. "FW-US", "PW-US", "PW-VN"
  legalName: string;
  taxId: string;
  country: string;
  countryCode?: string;
  address: string;
  contactEmail?: string;
  contactPhone?: string;
  bankName: string;
  accountNumber: string;
  swiftBic: string;
  bankAddress: string;
  status: 'Active' | 'Inactive';
  isDefault?: boolean;
  customerCount: number;
  mappedCustomers?: MappedCustomer[];
  invoicesIssuedCount?: number;
  totalInvoicedAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalEntity {
  id: string;
  name: string;
  address: string;
  regDetails: string;
  isDefault?: boolean;
  code?: string;
  taxId?: string;
  country?: string;
  status?: 'Active' | 'Inactive';
}

export interface InvoiceRecord {
  id: string;
  amount: number;
  paymentGateway: PaymentGateway;
  date: string;
  customerEmail: string;
  customerName: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  ordersCount: number;
  orders: OrderItem[];
  legalEntity?: LegalEntity;
  customer?: Customer;
  markupPercent?: number;
  markupAmount?: number;
  shippingFeeTotal?: number;
  relabelFeeTotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  seasonalFeeTotal?: number;
  signatureFeeTotal?: number;
  surchargeTotal?: number;
  type: string;
  currency: string;
}

export interface BillingMetrics {
  balance: number;
  topUp: number;
  usedCredit: number;
  sent: number;
  paid: number;
  refund: number;
}

export type InvoiceFrequency = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly';

export interface InvoiceScheduleSettings {
  autoGenerate: boolean;
  frequency: InvoiceFrequency;
  currentPeriod: string;
  nextInvoiceDate: string;
  timezone: string;
  executionDay: string;
  executionTime: string;
  dataStartDate: string;
  dataStartTime?: string;
  transactionTypes?: ('Payment' | 'Surcharge' | 'Refund')[];
  paymentStatus?: string;
  estimatedOrdersCount?: number;
  estimatedAmount?: number;
}
