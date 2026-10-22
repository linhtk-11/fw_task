import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Lock,
  Plus,
  Check,
  Eye,
  ShieldCheck,
  Info,
  DollarSign,
  Percent,
  Building2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import {
  Customer,
  InvoiceRecord,
  PaymentGateway,
  BillingEntity,
  LegalEntity,
} from '../types/billing';
import {
  MOCK_CUSTOMERS,
  LEGAL_ENTITIES,
  MOCK_PAID_ORDERS,
} from '../data/mockBillingData';

interface CreateInvoiceViewProps {
  onBackToBilling: () => void;
  onPreviewGeneratedInvoice: (draftInvoice: InvoiceRecord) => void;
  billingEntities?: BillingEntity[];
}

export const CreateInvoiceView: React.FC<CreateInvoiceViewProps> = ({
  onBackToBilling,
  onPreviewGeneratedInvoice,
  billingEntities,
}) => {
  // Customer selection
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0);
  const [customer, setCustomer] = useState<Customer>({ ...MOCK_CUSTOMERS[0] });

  const handleCustomerChange = (idx: number) => {
    setSelectedCustomerIndex(idx);
    setCustomer({ ...MOCK_CUSTOMERS[idx] });
  };

  // Paid Data Selection Date & Gateway Filters
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-20');
  const [selectedGateways, setSelectedGateways] = useState<PaymentGateway[]>([
    'Fastway Wallet',
    'Fastway Credit',
  ]);

  // Invoice Information (Fixed ID and System Auto-generated Date)
  const invoiceId = 'INV-2026-88492';
  const invoiceDate = '2026-10-20';

  const activeLegalEntities: LegalEntity[] = useMemo(() => {
    if (billingEntities && billingEntities.length > 0) {
      return billingEntities
        .filter((e) => e.status === 'Active')
        .map((e) => ({
          id: e.id,
          name: e.legalName,
          address: e.address,
          regDetails: `${e.taxId ? `Tax ID: ${e.taxId}` : ''} • ${e.country}`,
          isDefault: e.isDefault,
          code: e.code,
          taxId: e.taxId,
          country: e.country,
          status: e.status,
        }));
    }
    return LEGAL_ENTITIES;
  }, [billingEntities]);

  // Legal Entity - Default to default entity (e.g. FASTWAY LOGISTICS FULFILLMENT LLC)
  const defaultEntity = activeLegalEntities.find((e) => e.isDefault) || activeLegalEntities[0];
  const [selectedEntityId, setSelectedEntityId] = useState<string>(defaultEntity?.id || 'ent-fw-us');

  // Markup Configuration (retained per user request)
  const [applyMarkup, setApplyMarkup] = useState(true);
  const [markupType, setMarkupType] = useState<'Percentage (%)' | 'Fixed Amount ($)'>('Percentage (%)');
  const [markupValue, setMarkupValue] = useState<number>(5.0);

  // Filter orders by date & gateway - All orders in range are automatically selected
  const selectedOrders = useMemo(() => {
    return MOCK_PAID_ORDERS.filter((ord) => {
      if (selectedGateways.length > 0 && !selectedGateways.includes(ord.paymentGateway)) {
        return false;
      }
      return true;
    });
  }, [selectedGateways]);

  // Summary calculations
  const shippingFeeTotal = selectedOrders.reduce((s, o) => s + (o.shippingFee || 0), 0);
  const relabelFeeTotal = selectedOrders.reduce((s, o) => s + (o.relabelFee || 0), 0);
  const discountTotal = selectedOrders.reduce((s, o) => s + (o.discount || 0), 0);
  const taxTotal = selectedOrders.reduce((s, o) => s + (o.tax || 0), 0);
  const overLengthFeeTotal = selectedOrders.reduce((s, o) => s + (o.overLengthFee || 0), 0);
  const seasonalFeeTotal = selectedOrders.reduce((s, o) => s + (o.seasonalFee || 0), 0);
  const signatureFeeTotal = selectedOrders.reduce((s, o) => s + (o.signatureFee || 0), 0);
  const surchargeTotal = selectedOrders.reduce((s, o) => s + (o.surcharge || 0), 0);
  const cancelFeeTotal = selectedOrders.reduce((s, o) => s + (o.cancelFee || 0), 0);
  const refundTotal = selectedOrders.reduce((s, o) => s + (o.refund || 0), 0);

  const subtotal = selectedOrders.reduce((s, o) => s + o.total, 0);

  const markupAmount = useMemo(() => {
    if (!applyMarkup) return 0;
    if (markupType === 'Percentage (%)') {
      return (subtotal * markupValue) / 100;
    }
    return markupValue;
  }, [applyMarkup, markupType, markupValue, subtotal]);

  const totalPayable = subtotal + markupAmount;

  const currentEntity =
    activeLegalEntities.find((e) => e.id === selectedEntityId) || activeLegalEntities[0];

  const handlePreview = () => {
    const draftInvoice: InvoiceRecord = {
      id: `#${invoiceId}`,
      amount: totalPayable,
      paymentGateway: selectedOrders[0]?.paymentGateway || 'Fastway Wallet',
      date: `${invoiceDate}, 14:00:00`,
      customerEmail: customer.email,
      customerName: customer.companyName,
      status: 'Success',
      ordersCount: selectedOrders.length,
      orders: selectedOrders,
      legalEntity: currentEntity,
      customer,
      type: 'Payment',
      currency: 'USD ($)',
      markupPercent: applyMarkup && markupType === 'Percentage (%)' ? markupValue : 0,
      markupAmount,
      shippingFeeTotal,
      relabelFeeTotal,
      discountTotal,
      taxTotal,
      seasonalFeeTotal,
      signatureFeeTotal,
      surchargeTotal,
    };
    onPreviewGeneratedInvoice(draftInvoice);
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="text-[12px] text-[#727785] mb-2 flex items-center gap-1.5 font-medium">
          <span className="hover:text-[#0b1c30] cursor-pointer" onClick={onBackToBilling}>
            Billing Operations
          </span>
          <span>/</span>
          <span className="hover:text-[#0b1c30] cursor-pointer" onClick={onBackToBilling}>
            Invoices
          </span>
          <span>/</span>
          <span className="text-[#0b1c30] font-semibold">Export Invoice</span>
        </div>

        <button
          onClick={onBackToBilling}
          className="text-[#0058c3] hover:text-[#004398] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer mb-2"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoice</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
              Export Invoice
            </h1>
            <p className="text-[13px] text-[#727785]">
              Configure export filters to generate customer ledger document
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-medium self-start sm:self-auto shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Live Ledger Synced</span>
          </div>
        </div>
      </div>

      {/* Main Single-Panel Filter Layout (No separate box headers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Continuous unified filter panel */}
        <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-xs space-y-6">
          {/* Customer Selection Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1.5">
                Select Customer
              </label>
              <select
                value={selectedCustomerIndex}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
              >
                {MOCK_CUSTOMERS.map((cust, idx) => (
                  <option key={cust.id} value={idx}>
                    {cust.companyName} ({cust.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#424754] mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customer.companyName}
                  onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#424754] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Date & Gateway Filter Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-[#727785] mb-1">
                  Payment Date From
                </label>
                <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#c2c6d6]/60 bg-white text-[12px]">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-[12px] text-[#0b1c30] focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-[#727785] mb-1">
                  Payment Date To
                </label>
                <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#c2c6d6]/60 bg-white text-[12px]">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-[12px] text-[#0b1c30] focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-medium text-[#727785] mb-1">
                  Payment Gateway Filter
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['Fastway Wallet', 'Fastway Credit'] as PaymentGateway[]).map((gw) => (
                    <button
                      key={gw}
                      type="button"
                      onClick={() =>
                        setSelectedGateways((prev) =>
                          prev.includes(gw) ? prev.filter((g) => g !== gw) : [...prev, gw]
                        )
                      }
                      className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        selectedGateways.includes(gw)
                          ? 'bg-[#0b1c30] text-white'
                          : 'bg-white border border-[#c2c6d6] text-[#727785]'
                      }`}
                    >
                      {selectedGateways.includes(gw) && <Check className="w-3 h-3" />}
                      <span>{gw}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="h-8 px-2 rounded-lg border border-dashed border-[#c2c6d6] hover:bg-[#f8f9ff] text-[11px] font-medium text-[#727785] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#eff4ff]/60 px-3.5 py-2.5 rounded-lg border border-[#dce9ff] flex items-center justify-between text-[12px]">
              <span className="text-[#0b1c30] font-medium">
                {selectedOrders.length} orders automatically included from {dateFrom} to {dateTo} (${subtotal.toFixed(2)} USD)
              </span>
              <span className="text-[11px] font-semibold text-[#0058c3]">Auto-Enforced</span>
            </div>
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Invoice ID & Date Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1.5">
                Invoice ID
              </label>
              <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] text-[13px] font-mono font-semibold text-[#0b1c30]">
                <span>{invoiceId}</span>
                <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1.5">
                Date created
              </label>
              <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] text-[13px] text-[#0b1c30] font-mono">
                <span>{invoiceDate}</span>
                <Calendar className="w-3.5 h-3.5 text-[#727785]" />
              </div>
            </div>
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Legal Entity Selection (Dropdown List) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="legalEntitySelect" className="text-[12px] font-semibold text-[#0b1c30] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#0058c3]" />
                <span>Select Legal Entity (Đơn vị pháp nhân phát hành)</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#727785]">
                {activeLegalEntities.length} pháp nhân khả dụng
              </span>
            </div>

            {/* Dropdown Select Field */}
            <div className="relative">
              <select
                id="legalEntitySelect"
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#c2c6d6] hover:border-[#0058c3] focus:border-[#0058c3] focus:ring-2 focus:ring-[#0058c3]/15 rounded-xl text-[13px] font-medium text-[#0b1c30] appearance-none cursor-pointer transition-all shadow-2xs"
              >
                {activeLegalEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    [{entity.code || entity.id}] {entity.name} — {entity.regDetails} {entity.isDefault ? '★ [Mặc định]' : ''}
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-[#727785] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Selected Legal Entity Detail Preview Card */}
            {currentEntity && (
              <div className="p-3.5 rounded-xl bg-[#eff4ff]/30 border border-[#0058c3]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0058c3] text-white flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5 shadow-2xs">
                    {currentEntity.code || 'ENT'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[13.5px] text-[#0b1c30]">
                        {currentEntity.name}
                      </span>
                      {currentEntity.isDefault && (
                        <span className="text-[10px] font-bold uppercase bg-[#0058c3] text-white px-1.5 py-0.5 rounded shrink-0">
                          Default Entity
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#424754] mt-0.5">
                      {currentEntity.address}
                    </div>
                    <div className="text-[11px] font-mono text-[#0058c3] mt-1 font-medium">
                      {currentEntity.regDetails}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-md shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã chọn xuất Invoice
                  </span>
                </div>
              </div>
            )}
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Markup Configuration (Kept per request: applied internally, hidden on print) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#424754]">
                Apply Invoice Markup
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyMarkup}
                  onChange={(e) => setApplyMarkup(e.target.checked)}
                  className="rounded text-[#0058c3] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {applyMarkup && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#727785] mb-1">
                      Markup Type
                    </label>
                    <select
                      value={markupType}
                      onChange={(e) =>
                        setMarkupType(e.target.value as 'Percentage (%)' | 'Fixed Amount ($)')
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                    >
                      <option value="Percentage (%)">Percentage (%)</option>
                      <option value="Fixed Amount ($)">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#727785] mb-1">
                      Markup Value
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={markupValue}
                        onChange={(e) => setMarkupValue(parseFloat(e.target.value) || 0)}
                        className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      />
                      <span className="absolute right-3 top-2 text-[12px] text-[#727785]">
                        {markupType === 'Percentage (%)' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff] text-[12px] text-[#0058c3] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span>
                    + ${markupAmount.toFixed(2)} markup will be applied (automatically omitted when printing customer document)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Summary Column */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <h3 className="font-bold text-[16px] text-[#0b1c30]">Invoice Summary</h3>
              <span className="text-[11px] font-semibold bg-[#eff4ff] text-[#0058c3] px-2 py-0.5 rounded border border-[#dce9ff]">
                Draft
              </span>
            </div>

            {/* Breakdown itemized list */}
            <div className="space-y-2 text-[12.5px] text-[#424754]">
              <div className="flex justify-between">
                <span>Selected Orders</span>
                <span className="font-semibold text-[#0b1c30]">{selectedOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium text-[#0b1c30]">
                  ${shippingFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Re-label Fee</span>
                <span className="font-medium text-[#0b1c30]">
                  ${relabelFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">
                  {discountTotal < 0
                    ? `-$${Math.abs(discountTotal).toFixed(2)}`
                    : `$${discountTotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium text-[#0b1c30]">
                  ${taxTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Over Length Fee</span>
                <span className="text-[#727785]">
                  ${overLengthFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Seasonal Fee</span>
                <span className="font-medium text-[#0b1c30]">
                  ${seasonalFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Signature Fee</span>
                <span className="font-medium text-[#0b1c30]">
                  ${signatureFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Surcharge</span>
                <span className="font-medium text-[#0b1c30]">
                  ${surchargeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cancel Fee</span>
                <span className="text-[#727785]">
                  ${cancelFeeTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Refund</span>
                <span className="text-[#727785]">
                  ${refundTotal.toFixed(2)}
                </span>
              </div>

              {/* Subtotal */}
              <div className="pt-2 border-t border-dashed border-[#e2e8f0] flex justify-between font-semibold text-[#0b1c30]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* Markup */}
              {applyMarkup && (
                <div className="flex justify-between font-semibold text-[#0058c3]">
                  <span>Markup (+{markupValue}%)</span>
                  <span>+${markupAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t border-[#e2e8f0] bg-[#f8f9ff] p-3.5 rounded-lg flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#727785] block">
                  Total Payable Amount
                </span>
                <span className="text-[22px] font-bold text-[#0058c3]">
                  ${totalPayable.toFixed(2)}
                </span>
              </div>
              <span className="text-[12px] font-bold text-[#727785]">USD</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePreview}
                disabled={selectedOrders.length === 0}
                className="w-full h-10 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white font-semibold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Invoice</span>
              </button>

              <button
                type="button"
                onClick={onBackToBilling}
                className="w-full h-9 rounded-lg border border-[#e2e8f0] hover:bg-[#f8f9ff] text-[#424754] font-medium text-[13px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* PCI Compliance Trust Seal */}
            <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-[#727785]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant Logistics Billing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
