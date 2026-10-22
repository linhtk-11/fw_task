import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Calendar,
  X,
  ChevronDown,
  Plus,
  RefreshCw,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { InvoiceRecord, BillingMetrics, PaymentGateway } from '../types/billing';

interface BillingDashboardProps {
  metrics: BillingMetrics;
  invoices: InvoiceRecord[];
  onNavigateCreateInvoice: () => void;
  onOpenInvoicePreview: (invoice: InvoiceRecord) => void;
  onOpenOrderList: (invoice: InvoiceRecord) => void;
  onOpenSentPayment: () => void;
  onExportSummary: () => void;
  onNavigateToBillingEntity?: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  metrics,
  invoices,
  onNavigateCreateInvoice,
  onOpenInvoicePreview,
  onOpenOrderList,
  onOpenSentPayment,
  onExportSummary,
  onNavigateToBillingEntity,
}) => {
  // Sub-tabs
  const [activeTab, setActiveTab] = useState<string>('Invoice');
  const tabs = [
    'Transaction',
    'Order transaction',
    'Orders unpaid',
    'Topup request',
    'Credit',
    'Invoice',
    'Legal Entity',
  ];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGateways, setSelectedGateways] = useState<PaymentGateway[]>([
    'Fastway Wallet',
    'Fastway Credit',
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('All Customers');
  const [showGatewayDropdown, setShowGatewayDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleGateway = (gw: PaymentGateway) => {
    setSelectedGateways((prev) =>
      prev.includes(gw) ? prev.filter((g) => g !== gw) : [...prev, gw]
    );
  };

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search by ID or customer email
      if (
        searchQuery &&
        !inv.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Gateway filter
      if (selectedGateways.length > 0 && !selectedGateways.includes(inv.paymentGateway)) {
        return false;
      }
      // Customer filter
      if (selectedCustomer !== 'All Customers' && inv.customerEmail !== selectedCustomer) {
        return false;
      }
      return true;
    });
  }, [invoices, searchQuery, selectedGateways, selectedCustomer]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight">Billing</h1>
        <button
          onClick={onExportSummary}
          className="h-8 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-[#424754] text-[13px] font-medium hover:bg-[#f8f9ff] hover:text-[#0b1c30] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          type="button"
        >
          <Download className="w-4 h-4 text-[#727785]" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Metrics Row (6-column responsive grid matching Image 1) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Balance (Highlight Card) */}
        <div className="bg-white border-2 border-emerald-500/40 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Balance</div>
          <div className="flex items-baseline justify-between mt-2 gap-2 flex-wrap">
            <span className="text-[22px] font-bold text-[#0b1c30] tracking-tight">
              ${metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={onOpenSentPayment}
              className="h-7 px-2.5 rounded-lg bg-[#006c49] hover:bg-[#005236] text-white transition-colors text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
              type="button"
            >
              <span>Sent Payment</span>
            </button>
          </div>
        </div>

        {/* 2. Top Up */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Top Up</div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-2 tracking-tight">
            ${metrics.topUp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 3. Used Credit */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Used Credit</div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-2 tracking-tight">
            ${metrics.usedCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 4. Sent */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Sent</div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-2 tracking-tight">
            ${metrics.sent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 5. Paid */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Paid</div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-2 tracking-tight">
            ${metrics.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 6. Refund */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[12px] text-[#727785] font-medium">Refund</div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-2 tracking-tight">
            ${metrics.refund.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </section>

      {/* Sub-tab Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab === 'Legal Entity' && onNavigateToBillingEntity) {
                  onNavigateToBillingEntity();
                } else {
                  setActiveTab(tab);
                }
              }}
              className={`h-8 px-4 rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#213145] text-white font-semibold shadow-xs'
                  : 'border border-[#e2e8f0] bg-white text-[#727785] hover:text-[#0b1c30] hover:border-[#c2c6d6]'
              }`}
            >
              <span>{tab}</span>
              {tab === 'Legal Entity' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0058c3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters & Actions Toolbar */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* Search by Invoice ID */}
          <div>
            <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
              Search
            </label>
            <div className="relative">
              <input
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0058c3] focus:border-[#0058c3] bg-white"
                placeholder="Search by Invoice ID"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 absolute right-2.5 top-2.5 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
              Date
            </label>
            <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30]">
              <span>2026-10-13</span>
              <span className="text-[#94a3b8] mx-1">⇀</span>
              <span>2026-10-20</span>
              <Calendar className="w-4 h-4 text-[#727785] ml-2 shrink-0" />
            </div>
          </div>

          {/* Payment gateway Filter (Pills display) */}
          <div className="relative">
            <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
              Payment gateway
            </label>
            <div
              onClick={() => setShowGatewayDropdown(!showGatewayDropdown)}
              className="flex items-center justify-between h-9 px-2 rounded-lg border border-[#e2e8f0] bg-white text-[13px] cursor-pointer hover:border-[#c2c6d6]"
            >
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 custom-scrollbar">
                {selectedGateways.length === 0 && (
                  <span className="text-[12px] text-[#94a3b8]">All Gateways</span>
                )}
                {selectedGateways.map((gw) => (
                  <span
                    key={gw}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#0058c3] text-[11px] font-medium whitespace-nowrap"
                  >
                    {gw}
                    <X
                      className="w-3 h-3 hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGateway(gw);
                      }}
                    />
                  </span>
                ))}
              </div>
              <ChevronDown className="w-4 h-4 text-[#727785] ml-1 shrink-0" />
            </div>

            {showGatewayDropdown && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-[#e2e8f0] rounded-lg shadow-lg py-1 z-40 text-[12px]">
                {(['Fastway Wallet', 'Fastway Credit', 'Bank Wire'] as PaymentGateway[]).map(
                  (gw) => (
                    <label
                      key={gw}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#eff4ff] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGateways.includes(gw)}
                        onChange={() => toggleGateway(gw)}
                        className="rounded text-[#0058c3] focus:ring-0"
                      />
                      <span>{gw}</span>
                    </label>
                  )
                )}
              </div>
            )}
          </div>

          {/* Customers Filter */}
          <div className="relative">
            <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
              Customers
            </label>
            <div
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] cursor-pointer hover:border-[#c2c6d6]"
            >
              <span className="text-[#0b1c30] truncate">{selectedCustomer}</span>
              <ChevronDown className="w-4 h-4 text-[#727785] ml-1 shrink-0" />
            </div>

            {showCustomerDropdown && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-[#e2e8f0] rounded-lg shadow-lg py-1 z-40 text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer('All Customers');
                    setShowCustomerDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff]"
                >
                  All Customers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer('vendor@printway.io');
                    setShowCustomerDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff]"
                >
                  Printway Co., Ltd (vendor@printway.io)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer('billing@techlogix.com');
                    setShowCustomerDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff]"
                >
                  TechLogix Global (billing@techlogix.com)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Export Invoice */}
        <div className="flex items-center justify-end">
          <button
            onClick={onNavigateCreateInvoice}
            className="h-9 px-4 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white transition-colors flex items-center gap-1.5 text-[13px] font-semibold shadow-xs whitespace-nowrap cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Export Invoice</span>
          </button>
        </div>
      </section>

      {/* Invoices Data Table Container */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/60 border-b border-[#e2e8f0] text-[12px] font-semibold text-[#424754]">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Amount (USD)</th>
                <th className="py-3 px-4">Payment gateway</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60 text-[13px] text-[#0b1c30]">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#727785]">
                    No invoices match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#0b1c30] tracking-tight">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-[#424754]">
                      {inv.paymentGateway}
                    </td>
                    <td className="py-3 px-4 text-[#727785] font-mono text-[12px]">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-[#424754]">
                      {inv.customerEmail}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenInvoicePreview(inv)}
                          className="h-7 px-2.5 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[11.5px] font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          type="button"
                          title="Open Invoice Document"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => onOpenOrderList(inv)}
                          className="h-7 px-2.5 rounded-lg bg-white border border-[#e2e8f0] text-[#424754] hover:bg-[#eff4ff] text-[11.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          type="button"
                          title="View order line items"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                          <span>Order list</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#727785] bg-white">
          <div className="text-[12px]">
            Showing{' '}
            <span className="font-semibold text-[#0b1c30]">
              {paginatedInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
            </span>{' '}
            of <span className="font-semibold text-[#0b1c30]">{filteredInvoices.length}</span> records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 rounded-lg border border-[#e2e8f0] text-[#727785] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-[12px] hover:bg-[#f8f9ff] cursor-pointer"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#1e70eb] text-white'
                      : 'hover:bg-[#eff4ff] text-[#424754]'
                  }`}
                  type="button"
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-2.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8f9ff] text-[#0b1c30] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-[12px] transition-colors cursor-pointer"
              type="button"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
