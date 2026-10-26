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
  Eye,
  Download,
  Building2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { InvoiceRecord, InvoiceScheduleSettings, PeriodicInvoiceRecord } from '../types/billing';
import { MOCK_CUSTOMER_PERIODIC_INVOICES } from '../data/mockBillingData';

interface CustomerBillingViewProps {
  invoices: InvoiceRecord[];
  periodicInvoices?: PeriodicInvoiceRecord[];
  scheduleSettings: InvoiceScheduleSettings;
  walletBalance: number;
  unpaidAmount: number;
  autoRecharge: boolean;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  onToggleAutoRecharge: (val: boolean) => void;
  onOpenTopUp: () => void;
  onOpenInvoicePreview: (invoice: InvoiceRecord) => void;
  onOpenOrderList: (invoice: InvoiceRecord) => void;
  onNavigateToSettings: () => void;
  onAddToast?: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const CustomerBillingView: React.FC<CustomerBillingViewProps> = ({
  invoices,
  periodicInvoices = MOCK_CUSTOMER_PERIODIC_INVOICES,
  scheduleSettings,
  walletBalance,
  unpaidAmount,
  autoRecharge,
  activeSubTab: controlledActiveTab,
  onSubTabChange,
  onToggleAutoRecharge,
  onOpenTopUp,
  onOpenInvoicePreview,
  onOpenOrderList,
  onNavigateToSettings,
  onAddToast,
}) => {
  // Tabs: Adding "Periodic Invoices" right next to "Invoice" per user specification
  const tabs = [
    'Transaction',
    'Order transaction',
    'Waiting payment',
    'Topup request',
    'Invoice',
    'Periodic Invoices',
  ];

  const [localActiveTab, setLocalActiveTab] = useState<string>('Invoice');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;

  const handleTabClick = (tab: string) => {
    setLocalActiveTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // --- Regular Invoices Filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string>('All Gateways');
  const [showGatewayDropdown, setShowGatewayDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Periodic Invoices Filters (Spec: Invoice ID, Date Created range) ---
  const [periodicSearchQuery, setPeriodicSearchQuery] = useState('');
  const [periodicStartDate, setPeriodicStartDate] = useState('');
  const [periodicEndDate, setPeriodicEndDate] = useState('');
  const [periodicPage, setPeriodicPage] = useState(1);

  // Filter regular invoices
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

  // Filter periodic invoices (Specification: Invoice ID, khoảng ngày tạo)
  const filteredPeriodicInvoices = useMemo(() => {
    return periodicInvoices.filter((item) => {
      // Filter by Invoice ID
      if (
        periodicSearchQuery.trim() &&
        !item.id.toLowerCase().includes(periodicSearchQuery.trim().toLowerCase())
      ) {
        return false;
      }

      // Filter by Date Created range (item.dateCreatedIso e.g. "2026-10-15")
      if (periodicStartDate && item.dateCreatedIso < periodicStartDate) {
        return false;
      }
      if (periodicEndDate && item.dateCreatedIso > periodicEndDate) {
        return false;
      }

      return true;
    });
  }, [periodicInvoices, periodicSearchQuery, periodicStartDate, periodicEndDate]);

  const totalPeriodicPages = Math.ceil(filteredPeriodicInvoices.length / itemsPerPage) || 1;
  const paginatedPeriodicInvoices = filteredPeriodicInvoices.slice(
    (periodicPage - 1) * itemsPerPage,
    periodicPage * itemsPerPage
  );

  // Reset periodic filters
  const handleResetPeriodicFilters = () => {
    setPeriodicSearchQuery('');
    setPeriodicStartDate('');
    setPeriodicEndDate('');
    setPeriodicPage(1);
  };

  // Download periodic invoice statement file
  const handleDownloadPeriodicInvoice = (record: PeriodicInvoiceRecord) => {
    const csvContent = [
      'PERIODIC INVOICE STATEMENT / HOÁ ĐƠN THEO KỲ',
      `Invoice ID: ${record.id}`,
      `Billing Period: ${record.billingPeriodFormatted}`,
      `Date Created: ${record.dateCreated}`,
      `Legal Entity: ${record.legalEntityName} (${record.legalEntityCode || 'FW-US'})`,
      `Total Amount: $${record.totalAmount.toFixed(2)} USD`,
      `Orders Count: ${record.ordersCount}`,
      `Status: ${record.status}`,
      `Customer: Printway Co., Ltd (vendor@printway.io)`,
      '',
      'Generated on: ' + new Date().toLocaleString(),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Statement_${record.id.replace('#', '')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onAddToast) {
      onAddToast(
        'Statement Downloaded',
        `Periodic invoice ${record.id} statement has been saved.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">Billing</h1>
      </div>

      {/* Metrics Row (Wallet Balance + Unpaid) */}
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
              onClick={() => handleTabClick(tab)}
              className={`h-8 px-4 rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0b1c30] text-white font-semibold shadow-xs'
                  : 'border border-[#e2e8f0] bg-white text-[#727785] hover:text-[#0b1c30] hover:border-[#c2c6d6]'
              }`}
            >
              {tab === 'Periodic Invoices' ? 'Periodic Invoices' : tab}
            </button>
          );
        })}
      </div>

      {/* Invoice Schedule Information Banner */}
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

      {/* VIEW: TAB "Periodic Invoices" */}
      {activeTab === 'Periodic Invoices' && (
        <div className="space-y-4">
          {/* Filters Toolbar for Periodic Invoices */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Search by Invoice ID */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-[#424754] mb-1">
                Invoice ID (Mã hóa đơn)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Invoice ID (e.g. #INV-P2026-10-B)"
                  value={periodicSearchQuery}
                  onChange={(e) => {
                    setPeriodicSearchQuery(e.target.value);
                    setPeriodicPage(1);
                  }}
                  className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
                <Search className="w-4 h-4 absolute right-2.5 top-2.5 text-[#94a3b8] pointer-events-none" />
              </div>
            </div>

            {/* Date Range: From Date */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-[#424754] mb-1">
                From Date (Từ ngày tạo)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={periodicStartDate}
                  onChange={(e) => {
                    setPeriodicStartDate(e.target.value);
                    setPeriodicPage(1);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
              </div>
            </div>

            {/* Date Range: To Date */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-[#424754] mb-1">
                To Date (Đến ngày tạo)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={periodicEndDate}
                  onChange={(e) => {
                    setPeriodicEndDate(e.target.value);
                    setPeriodicPage(1);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
              </div>
            </div>

            {/* Reset Filter Button */}
            <div className="sm:col-span-1">
              <button
                type="button"
                onClick={handleResetPeriodicFilters}
                title="Reset filters"
                className="w-full h-9 rounded-lg border border-[#e2e8f0] bg-white text-[#727785] hover:text-[#0b1c30] hover:bg-[#f8f9ff] flex items-center justify-center cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Periodic Invoices Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[12px] font-semibold text-[#727785]">
                    <th className="py-3.5 px-4">Invoice ID</th>
                    <th className="py-3.5 px-4">Billing Period</th>
                    <th className="py-3.5 px-4">Date Created</th>
                    <th className="py-3.5 px-4">Legal Entity</th>
                    <th className="py-3.5 px-4 text-right">Total Amount (USD)</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#0b1c30]">
                  {paginatedPeriodicInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#727785]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-[#c2c6d6]" />
                          <span className="font-medium text-[#424754]">No periodic invoices found.</span>
                          <span className="text-[12px] text-[#727785]">
                            Try clearing your search query or adjusting the date range filter.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPeriodicInvoices.map((record) => (
                      <tr key={record.id} className="hover:bg-[#f8f9ff] transition-colors">
                        {/* 1. Invoice ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0058c3] tracking-tight">
                            {record.id}
                          </span>
                          <span className="block text-[11px] text-[#727785]">
                            {record.ordersCount} orders included
                          </span>
                        </td>

                        {/* 2. Billing Period */}
                        <td className="py-3.5 px-4 font-medium text-[#424754]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#727785]" />
                            <span>{record.billingPeriodFormatted}</span>
                          </div>
                        </td>

                        {/* 3. Date Created */}
                        <td className="py-3.5 px-4 text-[#727785] font-mono text-[12px]">
                          {record.dateCreated}
                        </td>

                        {/* 4. Legal Entity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[#f1f5f9] text-[#0058c3] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {record.legalEntityCode || 'FW'}
                            </span>
                            <span className="text-[13px] font-medium text-[#0b1c30] truncate max-w-[280px]">
                              {record.legalEntityName}
                            </span>
                          </div>
                        </td>

                        {/* 5. Total Amount (USD) - 2 decimal places */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-[14px] text-[#0b1c30]">
                            ${record.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[11px] text-emerald-600 font-semibold">
                            {record.status}
                          </span>
                        </td>

                        {/* 6. Action (View / Download) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* View / Xem chi tiết */}
                            <button
                              type="button"
                              onClick={() => {
                                if (record.invoiceRecord) {
                                  onOpenInvoicePreview(record.invoiceRecord);
                                }
                              }}
                              title="View invoice details"
                              className="h-7 px-3 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            {/* Download / Tải về */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPeriodicInvoice(record)}
                              title="Download invoice statement"
                              className="h-7 px-3 rounded-lg bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#0058c3] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
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
            <div className="p-4 border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-[#727785] bg-white">
              <div>
                Showing <strong className="text-[#0b1c30]">{paginatedPeriodicInvoices.length}</strong> of{' '}
                <strong className="text-[#0b1c30]">{filteredPeriodicInvoices.length}</strong> periodic invoices
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPeriodicPage((p) => Math.max(p - 1, 1))}
                    disabled={periodicPage === 1}
                    className="w-7 h-7 rounded border border-[#e2e8f0] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 h-7 rounded bg-[#1e70eb] text-white font-bold flex items-center justify-center">
                    {periodicPage}
                  </span>
                  <button
                    onClick={() => setPeriodicPage((p) => Math.min(p + 1, totalPeriodicPages))}
                    disabled={periodicPage === totalPeriodicPages}
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
        </div>
      )}

      {/* VIEW: TAB "Invoice" (Standard Invoices) */}
      {activeTab === 'Invoice' && (
        <div className="space-y-4">
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

          {/* Invoices Table */}
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

            {/* Pagination Footer */}
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
      )}

      {/* VIEW: Other tabs placeholders */}
      {activeTab !== 'Invoice' && activeTab !== 'Periodic Invoices' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-[#94a3b8] mx-auto mb-3 opacity-60" />
          <h3 className="text-[16px] font-semibold text-[#0b1c30]">{activeTab} Ledger</h3>
          <p className="text-[13px] text-[#727785] mt-1 max-w-md mx-auto">
            Viewing records for {activeTab}. All items are automatically synchronized with your billing account.
          </p>
        </div>
      )}
    </div>
  );
};
