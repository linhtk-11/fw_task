import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { InvoiceRecord, InvoiceScheduleSettings } from '../types/billing';

interface CustomerBillingViewProps {
  invoices: InvoiceRecord[];
  scheduleSettings: InvoiceScheduleSettings;
  walletBalance: number;
  unpaidAmount: number;
  autoRecharge: boolean;
  onToggleAutoRecharge: (val: boolean) => void;
  onOpenTopUp: () => void;
  onOpenInvoicePreview: (invoice: InvoiceRecord) => void;
  onOpenOrderList: (invoice: InvoiceRecord) => void;
  onNavigateToSettings: () => void;
}

export const CustomerBillingView: React.FC<CustomerBillingViewProps> = ({
  invoices,
  scheduleSettings,
  walletBalance,
  unpaidAmount,
  autoRecharge,
  onToggleAutoRecharge,
  onOpenTopUp,
  onOpenInvoicePreview,
  onOpenOrderList,
  onNavigateToSettings,
}) => {
  // Sub-tabs matching image_837a4698.png
  const [activeTab, setActiveTab] = useState<string>('Invoice');
  const tabs = [
    'Transaction',
    'Order transaction',
    'Waiting payment',
    'Topup request',
    'Invoice',
  ];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string>('All Gateways');
  const [showGatewayDropdown, setShowGatewayDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (
        searchQuery &&
        !inv.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedGateway !== 'All Gateways' &&
        inv.paymentGateway !== selectedGateway
      ) {
        return false;
      }
      return true;
    });
  }, [invoices, searchQuery, selectedGateway]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">Billing</h1>
      </div>

      {/* Metrics Row (2 cards matching image_837a4698.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Wallet Balance */}
        <div className="bg-white border-2 border-emerald-400 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[12px] text-[#727785] font-medium block">Wallet Balance</span>
                <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
                  ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenTopUp}
              className="h-8 px-4 rounded-lg bg-[#00a86b] hover:bg-[#008f5a] text-white font-semibold text-[13px] shadow-xs transition-colors cursor-pointer"
            >
              Top Up
            </button>
          </div>

          <div className="pt-3 mt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[12px]">
            <span className="text-[#727785]">Auto re-charge</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${autoRecharge ? 'text-emerald-700' : 'text-slate-400'}`}>
                {autoRecharge ? 'Active' : 'Inactive'}
              </span>
              <button
                type="button"
                onClick={() => onToggleAutoRecharge(!autoRecharge)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  autoRecharge ? 'bg-[#00a86b]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    autoRecharge ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Unpaid */}
        <div className="bg-white border-2 border-orange-400 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] text-[#727785] font-medium block">Unpaid</span>
            <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight mt-1 block">
              ${unpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[12px] text-[#727785]">
            <span>Outstanding account dues</span>
            <span className="font-semibold text-emerald-600">Settled (All Clear)</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-4 rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0b1c30] text-white font-semibold shadow-xs'
                  : 'border border-[#e2e8f0] bg-white text-[#727785] hover:text-[#0b1c30] hover:border-[#c2c6d6]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Section 4: Invoice Schedule Information Banner (User Spec #4) */}
      <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0058c3] text-white flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-[#0b1c30]">Invoice schedule</span>
              <span className="px-2 py-0.5 rounded bg-white text-[#0058c3] text-[11px] font-semibold border border-[#dce9ff]">
                {scheduleSettings.autoGenerate ? scheduleSettings.frequency : 'Manual Generation'}
              </span>
            </div>
            <div className="text-[12px] text-[#424754] mt-0.5">
              {scheduleSettings.autoGenerate ? (
                <>
                  Current period: <strong className="text-[#0b1c30]">{scheduleSettings.currentPeriod}</strong> • Next invoice:{' '}
                  <strong className="text-[#0058c3]">{scheduleSettings.nextInvoiceDate}</strong>
                </>
              ) : (
                'Automatic periodic invoice consolidation is currently disabled.'
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToSettings}
          className="text-[#0058c3] hover:text-[#004398] font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer self-end sm:self-auto shrink-0 hover:underline"
        >
          <span>Manage settings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Search */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-medium text-[#727785] mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Invoice ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
            />
            <Search className="w-4 h-4 absolute right-2.5 top-2.5 text-[#94a3b8] pointer-events-none" />
          </div>
        </div>

        {/* Date */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-medium text-[#727785] mb-1">Date</label>
          <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30]">
            <span>2026-10-13</span>
            <span className="text-[#94a3b8] mx-1">⇀</span>
            <span>2026-10-20</span>
            <Calendar className="w-4 h-4 text-[#727785] shrink-0" />
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="sm:col-span-3 relative">
          <label className="block text-[11px] font-medium text-[#727785] mb-1">Payment gateway</label>
          <div
            onClick={() => setShowGatewayDropdown(!showGatewayDropdown)}
            className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] cursor-pointer hover:border-[#c2c6d6]"
          >
            <span>{selectedGateway}</span>
            <ChevronDown className="w-4 h-4 text-[#727785]" />
          </div>

          {showGatewayDropdown && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1 z-30 text-[12px]">
              {['All Gateways', 'Fastway Wallet', 'Fastway Credit'].map((gw) => (
                <button
                  key={gw}
                  type="button"
                  onClick={() => {
                    setSelectedGateway(gw);
                    setShowGatewayDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff]"
                >
                  {gw}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table Container (Matching image_837a4698.png) */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[12px] font-semibold text-[#727785]">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Amount (USD)</th>
                <th className="py-3 px-4">Payment gateway</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#0b1c30]">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#727785]">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#0b1c30] tracking-tight">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0b1c30]">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#424754]">
                      {inv.paymentGateway}
                    </td>
                    <td className="py-3.5 px-4 text-[#727785] font-mono text-[12px]">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenInvoicePreview(inv)}
                          className="h-7 px-3 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12px] font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenOrderList(inv)}
                          className="h-7 px-3 rounded-lg bg-white border border-[#e2e8f0] text-[#424754] hover:bg-[#eff4ff] text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
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

        {/* Pagination Footer matching image_837a4698.png */}
        <div className="p-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3 text-[12px] text-[#727785] bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded border border-[#e2e8f0] flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded bg-[#1e70eb] text-white font-bold flex items-center justify-center">
              1
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded border border-[#e2e8f0] flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 border border-[#e2e8f0] px-2 py-1 rounded">
            <span>10 / page</span>
            <ChevronDown className="w-3 h-3 text-[#727785]" />
          </div>
        </div>
      </div>
    </div>
  );
};
