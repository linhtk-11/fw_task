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
  Eye,
  User,
  Building2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  InvoiceRecord,
  BillingMetrics,
  PaymentGateway,
  ExportLogRecord,
} from '../types/billing';
import { INITIAL_EXPORT_LOGS } from '../data/mockBillingData';

interface BillingDashboardProps {
  metrics: BillingMetrics;
  invoices: InvoiceRecord[];
  exportLogs?: ExportLogRecord[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigateCreateInvoice: () => void;
  onOpenInvoicePreview: (invoice: InvoiceRecord) => void;
  onOpenOrderList: (invoice: InvoiceRecord) => void;
  onOpenSentPayment: () => void;
  onExportSummary: () => void;
  onNavigateToBillingEntity?: () => void;
  onToast?: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  metrics,
  invoices,
  exportLogs = INITIAL_EXPORT_LOGS,
  activeTab: activeTabProp,
  onTabChange,
  onNavigateCreateInvoice,
  onOpenInvoicePreview,
  onOpenOrderList,
  onOpenSentPayment,
  onExportSummary,
  onNavigateToBillingEntity,
  onToast,
}) => {
  // Sub-tabs: 'Export Logs' placed right after 'Invoice' and before 'Legal Entity'
  const [internalActiveTab, setInternalActiveTab] = useState<string>('Invoice');
  const currentTab = activeTabProp !== undefined ? activeTabProp : internalActiveTab;

  const setActiveTab = (tab: string) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const tabs = [
    'Transaction',
    'Order transaction',
    'Orders unpaid',
    'Topup request',
    'Credit',
    'Invoice',
    'Export Logs',
    'Legal Entity',
  ];

  // Invoice Filters & Pagination
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

  // Filter invoices for "Invoice" tab
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (
        searchQuery &&
        !inv.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedGateways.length > 0 && !selectedGateways.includes(inv.paymentGateway)) {
        return false;
      }
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

  // Export Logs Filters & Pagination
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logDateQuery, setLogDateQuery] = useState('');
  const [logCustomerFilter, setLogCustomerFilter] = useState('All Customers');
  const [showLogCustomerDropdown, setShowLogCustomerDropdown] = useState(false);
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Distinct Customer list for Export Logs
  const logCustomerOptions = useMemo(() => {
    const custSet = new Set<string>();
    exportLogs.forEach((l) => {
      if (l.customerName) custSet.add(l.customerName);
    });
    return Array.from(custSet);
  }, [exportLogs]);

  // Filter Export Logs
  const filteredExportLogs = useMemo(() => {
    return exportLogs.filter((log) => {
      // Search by Invoice ID or Customer
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase().trim();
        const matchesInvoice = log.invoiceId.toLowerCase().includes(q);
        const matchesCustomer =
          log.customerName.toLowerCase().includes(q) ||
          log.customerEmail.toLowerCase().includes(q);
        if (!matchesInvoice && !matchesCustomer) {
          return false;
        }
      }

      // Date Search (searches exportTimestamp or dataPeriod)
      if (logDateQuery.trim()) {
        const dq = logDateQuery.trim().toLowerCase();
        const matchesTimestamp = log.exportTimestamp.toLowerCase().includes(dq);
        const matchesPeriod = log.dataPeriod.toLowerCase().includes(dq);
        if (!matchesTimestamp && !matchesPeriod) {
          return false;
        }
      }

      // Customer Filter dropdown
      if (logCustomerFilter !== 'All Customers') {
        if (
          log.customerName !== logCustomerFilter &&
          log.customerEmail !== logCustomerFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [exportLogs, logSearchQuery, logDateQuery, logCustomerFilter]);

  const totalLogPages = Math.ceil(filteredExportLogs.length / logsPerPage) || 1;
  const paginatedExportLogs = filteredExportLogs.slice(
    (logCurrentPage - 1) * logsPerPage,
    logCurrentPage * logsPerPage
  );

  const hasLogFilters =
    Boolean(logSearchQuery.trim()) ||
    Boolean(logDateQuery.trim()) ||
    logCustomerFilter !== 'All Customers';

  const resetLogFilters = () => {
    setLogSearchQuery('');
    setLogDateQuery('');
    setLogCustomerFilter('All Customers');
    setLogCurrentPage(1);
  };

  // Actions for Export Logs
  const handleViewLog = (log: ExportLogRecord) => {
    if (log.invoiceRecord) {
      onOpenInvoicePreview(log.invoiceRecord);
    } else {
      const fallbackInv: InvoiceRecord = {
        id: log.invoiceId,
        amount: log.totalAmount,
        paymentGateway: 'Fastway Wallet',
        date: log.exportTimestamp,
        customerEmail: log.customerEmail,
        customerName: log.customerName,
        status: 'Success',
        ordersCount: 1,
        orders: [],
        legalEntity: {
          id: 'ent-fw-us',
          name: log.legalEntityName,
          address: '25722 Kingsland Blvd, Ste 103F, Katy, TX 77494, USA',
          regDetails: '',
          code: log.legalEntityCode || 'FW-US',
        },
        type: 'Payment',
        currency: `${log.currency} ($)`,
      };
      onOpenInvoicePreview(fallbackInv);
    }
  };

  const handleDownloadLog = (log: ExportLogRecord) => {
    const textData = `FASTWAY LOGISTICS - INVOICE EXPORT LOG
===================================================
Invoice ID:        ${log.invoiceId}
Customer:          ${log.customerName} (${log.customerEmail})
Data Period:       ${log.dataPeriod}
Legal Entity:      ${log.legalEntityName} [${log.legalEntityCode || ''}]
Payment Gateway:   ${log.paymentGateway || log.invoiceRecord?.paymentGateway || 'Fastway Wallet'}
Total Amount:      $${log.totalAmount.toFixed(2)} ${log.currency}
Exported By:       ${log.exportedBy}
Export Timestamp:  ${log.exportTimestamp}
===================================================
Generated via Fastway Logistics Fulfillment Platform.
`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${log.invoiceId.replace('#', '')}_export_log.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onToast) {
      onToast(
        'Tải về thành công',
        `Đã tải xuống file bản ghi xuất hóa đơn ${log.invoiceId}.`,
        'success'
      );
    }
  };

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

      {/* Metrics Row (6-column responsive grid) */}
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
          const isActive = currentTab === tab;
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
              {tab === 'Export Logs' && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1e70eb] text-white">
                  {exportLogs.length}
                </span>
              )}
              {tab === 'Legal Entity' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0058c3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXPORT LOGS */}
      {currentTab === 'Export Logs' && (
        <div className="space-y-4">
          {/* Export Logs Toolbar: Search by Invoice ID, Date, Customer */}
          <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {/* 1. Search by Invoice ID or Customer */}
              <div>
                <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
                  Search (Invoice ID, Customer)
                </label>
                <div className="relative">
                  <input
                    className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0058c3] focus:border-[#0058c3] bg-white"
                    placeholder="Search by Invoice ID or Customer..."
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => {
                      setLogSearchQuery(e.target.value);
                      setLogCurrentPage(1);
                    }}
                  />
                  <Search className="w-4 h-4 absolute right-2.5 top-2.5 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>

              {/* 2. Date Filter */}
              <div>
                <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
                  Date (Thời điểm xuất / Kỳ dữ liệu)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={logDateQuery}
                    onChange={(e) => {
                      setLogDateQuery(e.target.value);
                      setLogCurrentPage(1);
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                  />
                  {logDateQuery && (
                    <button
                      type="button"
                      onClick={() => setLogDateQuery('')}
                      className="absolute right-8 top-2.5 text-[#94a3b8] hover:text-[#0b1c30] text-[11px] cursor-pointer"
                      title="Clear date"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Customer Filter */}
              <div className="relative">
                <label className="block text-[12px] text-[#424754] font-medium mb-1.5">
                  Customer
                </label>
                <div
                  onClick={() => setShowLogCustomerDropdown(!showLogCustomerDropdown)}
                  className="flex items-center justify-between h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] cursor-pointer hover:border-[#c2c6d6]"
                >
                  <span className="text-[#0b1c30] truncate">{logCustomerFilter}</span>
                  <ChevronDown className="w-4 h-4 text-[#727785] ml-1 shrink-0" />
                </div>

                {showLogCustomerDropdown && (
                  <div className="absolute left-0 mt-1 w-60 bg-white border border-[#e2e8f0] rounded-lg shadow-lg py-1 z-40 text-[12px] max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setLogCustomerFilter('All Customers');
                        setShowLogCustomerDropdown(false);
                        setLogCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] cursor-pointer ${
                        logCustomerFilter === 'All Customers' ? 'font-bold text-[#0058c3] bg-[#eff4ff]' : ''
                      }`}
                    >
                      All Customers
                    </button>
                    {logCustomerOptions.map((cName) => (
                      <button
                        key={cName}
                        type="button"
                        onClick={() => {
                          setLogCustomerFilter(cName);
                          setShowLogCustomerDropdown(false);
                          setLogCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] cursor-pointer ${
                          logCustomerFilter === cName ? 'font-bold text-[#0058c3] bg-[#eff4ff]' : ''
                        }`}
                      >
                        {cName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Clear filter and Export Invoice */}
            <div className="flex items-center gap-2 justify-end">
              {hasLogFilters && (
                <button
                  type="button"
                  onClick={resetLogFilters}
                  className="h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8f9ff] text-[#727785] hover:text-[#0b1c30] transition-colors flex items-center gap-1.5 text-[12.5px] font-medium cursor-pointer"
                  title="Xóa bộ lọc"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

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

          {/* Export Logs Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 border-b border-[#e2e8f0] text-[12px] font-semibold text-[#424754]">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Kỳ dữ liệu</th>
                    <th className="py-3 px-4">Pháp nhân</th>
                    <th className="py-3 px-4">Payment gateway</th>
                    <th className="py-3 px-4">Người xuất</th>
                    <th className="py-3 px-4">Thời điểm xuất</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]/60 text-[13px] text-[#0b1c30]">
                  {paginatedExportLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#727785]">
                        <FileText className="w-8 h-8 text-[#94a3b8] mx-auto mb-2 opacity-60" />
                        <p className="font-medium text-[#0b1c30]">Không tìm thấy bản ghi Export Log nào.</p>
                        <p className="text-[12px] text-[#727785] mt-1">
                          Thử thay đổi từ khóa tìm kiếm hoặc ngày lọc.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedExportLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#f8f9ff] transition-colors">
                        {/* 1. Invoice ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0b1c30] tracking-tight whitespace-nowrap">
                          {log.invoiceId}
                        </td>

                        {/* 2. Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0b1c30] text-[13px]">
                            {log.customerName}
                          </div>
                          <div className="text-[11.5px] text-[#727785]">
                            {log.customerEmail}
                          </div>
                        </td>

                        {/* 3. Kỳ dữ liệu */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eff4ff] text-[#0058c3] text-[11.5px] font-medium border border-[#dce9ff]">
                            {log.dataPeriod}
                          </span>
                        </td>

                        {/* 4. Pháp nhân */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {log.legalEntityCode && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0b1c30] text-white shrink-0">
                                {log.legalEntityCode}
                              </span>
                            )}
                            <span
                              className="font-medium text-[#0b1c30] text-[12.5px] max-w-[200px] truncate block"
                              title={log.legalEntityName}
                            >
                              {log.legalEntityName}
                            </span>
                          </div>
                        </td>

                        {/* 5. Payment gateway */}
                        <td className="py-3.5 px-4 text-[#424754] text-[13px] whitespace-nowrap font-medium">
                          {log.paymentGateway || log.invoiceRecord?.paymentGateway || 'Fastway Wallet'}
                        </td>

                        {/* 6. Người xuất */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[12.5px] text-[#424754]">
                            <User className="w-3.5 h-3.5 text-[#727785] shrink-0" />
                            <span>{log.exportedBy}</span>
                          </div>
                        </td>

                        {/* 7. Thời điểm xuất */}
                        <td className="py-3.5 px-4 text-[#727785] font-mono text-[12px] whitespace-nowrap">
                          {log.exportTimestamp}
                        </td>

                        {/* 8. Hành động: Xem / Tải về */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewLog(log)}
                              className="h-7 px-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0058c3] text-[11.5px] font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-[#dce9ff] shadow-2xs"
                              title="Xem chi tiết hóa đơn"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadLog(log)}
                              className="h-7 px-2.5 rounded-lg bg-white hover:bg-[#f8f9ff] text-[#424754] text-[11.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer border border-[#e2e8f0] shadow-2xs"
                              title="Tải về hóa đơn"
                            >
                              <Download className="w-3.5 h-3.5 text-[#727785]" />
                              <span>Tải về</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Export Logs */}
            <div className="p-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#727785] bg-white">
              <div className="text-[12px]">
                Showing{' '}
                <span className="font-semibold text-[#0b1c30]">
                  {paginatedExportLogs.length > 0 ? (logCurrentPage - 1) * logsPerPage + 1 : 0} -{' '}
                  {Math.min(logCurrentPage * logsPerPage, filteredExportLogs.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[#0b1c30]">
                  {filteredExportLogs.length}
                </span>{' '}
                bản ghi
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLogCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={logCurrentPage === 1}
                  className="h-8 px-2.5 rounded-lg border border-[#e2e8f0] text-[#727785] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-[12px] hover:bg-[#f8f9ff] cursor-pointer"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {[...Array(totalLogPages)].map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setLogCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        logCurrentPage === p
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
                  onClick={() => setLogCurrentPage((p) => Math.min(p + 1, totalLogPages))}
                  disabled={logCurrentPage === totalLogPages || totalLogPages === 0}
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
      )}

      {/* TAB 2: INVOICE */}
      {currentTab === 'Invoice' && (
        <div className="space-y-4">
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
      )}

      {/* OTHER TABS PLACEHOLDER */}
      {currentTab !== 'Invoice' && currentTab !== 'Export Logs' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
          <Building2 className="w-10 h-10 text-[#94a3b8] mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-[16px] text-[#0b1c30]">
            {currentTab}
          </h3>
          <p className="text-[13px] text-[#727785] mt-1 max-w-md mx-auto">
            Dữ liệu mục {currentTab} đang được đồng bộ tự động theo thời gian thực từ hệ thống thanh toán và cổng ngân hàng.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('Invoice')}
              className="px-4 h-9 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              Về danh sách Invoice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Export Logs')}
              className="px-4 h-9 rounded-lg border border-[#e2e8f0] hover:bg-[#f8f9ff] text-[#0b1c30] text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              Xem Export Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
