import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  ChevronDown,
  X,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { InvoiceFrequency, InvoiceScheduleSettings } from '../types/billing';

interface CustomerSettingViewProps {
  scheduleSettings: InvoiceScheduleSettings;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  onSaveSchedule: (newSettings: InvoiceScheduleSettings) => void;
  onNavigateToBilling: () => void;
}

const TIMEZONE_OPTIONS = [
  'UTC+07:00 Asia/Ho_Chi_Minh',
  'UTC-05:00 America/New_York (Eastern Time)',
  'UTC-06:00 America/Chicago (Central Time)',
  'UTC-07:00 America/Denver (Mountain Time)',
  'UTC-08:00 America/Los_Angeles (Pacific Time)',
  'UTC+00:00 Europe/London (GMT)',
  'UTC+08:00 Asia/Singapore (SGT)',
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAYS_OF_MONTH = [
  ...Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`),
  'Last day of month',
];

export const CustomerSettingView: React.FC<CustomerSettingViewProps> = ({
  scheduleSettings,
  activeTab: externalActiveTab,
  onTabChange,
  onSaveSchedule,
  onNavigateToBilling,
}) => {
  // Main Toggle
  const [autoGenerate, setAutoGenerate] = useState(scheduleSettings.autoGenerate);

  // Configuration Fields
  const [frequency, setFrequency] = useState<InvoiceFrequency>(
    scheduleSettings.frequency || 'Monthly'
  );
  const [executionDay, setExecutionDay] = useState(
    scheduleSettings.executionDay || 'Day 30'
  );
  const [executionTime, setExecutionTime] = useState(
    scheduleSettings.executionTime || '18:00'
  );
  const [selectedTimezone, setSelectedTimezone] = useState(
    scheduleSettings.timezone || 'UTC+07:00 Asia/Ho_Chi_Minh'
  );

  // Start Collecting Orders From
  const [startDate, setStartDate] = useState(
    scheduleSettings.dataStartDate || '2026-10-01'
  );
  const [startTime, setStartTime] = useState(
    scheduleSettings.dataStartTime || '00:00'
  );

  // Orders Included Filters
  const [selectedTxTypes, setSelectedTxTypes] = useState<
    ('Payment' | 'Surcharge' | 'Refund')[]
  >(scheduleSettings.transactionTypes || ['Payment', 'Surcharge', 'Refund']);

  // UI States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Toggle Transaction Type Checkbox
  const handleToggleTxType = (type: 'Payment' | 'Surcharge' | 'Refund') => {
    setSelectedTxTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Helper text check for Day 29, 30, 31
  const isHighDayOfMonth =
    frequency === 'Monthly' &&
    (executionDay === 'Day 29' ||
      executionDay === 'Day 30' ||
      executionDay === 'Day 31');

  // Dynamic real-time calculation of Schedule values for save confirmation and header
  const previewData = useMemo(() => {
    const formattedStartDate = 'Oct 01, 2026';
    let formattedEndDate = 'Oct 30, 2026';
    let nextDate = 'Oct 30, 2026';
    let orderCount = 128;
    let estAmount = 4526.8;

    if (frequency === 'Daily') {
      formattedEndDate = 'Oct 01, 2026';
      nextDate = 'Oct 02, 2026';
      orderCount = 8;
      estAmount = 245.5;
    } else if (frequency === 'Weekly') {
      formattedEndDate = 'Oct 07, 2026';
      nextDate = `Oct 08, 2026 (${executionDay})`;
      orderCount = 34;
      estAmount = 1120.4;
    } else if (frequency === 'Bi-Weekly') {
      formattedEndDate = 'Oct 14, 2026';
      nextDate = 'Oct 15, 2026';
      orderCount = 68;
      estAmount = 2280.9;
    } else if (frequency === 'Monthly') {
      const dayNum = executionDay.replace('Day ', '');
      formattedEndDate =
        executionDay === 'Last day of month'
          ? 'Oct 31, 2026'
          : `Oct ${dayNum.padStart(2, '0')}, 2026`;
      nextDate = formattedEndDate;
      orderCount = 128;
      estAmount = 4526.8;
    } else if (frequency === 'Quarterly') {
      formattedEndDate = 'Dec 31, 2026';
      nextDate = 'Jan 01, 2027';
      orderCount = 380;
      estAmount = 14250.0;
    }

    if (!selectedTxTypes.includes('Surcharge')) estAmount -= 240.0;
    if (!selectedTxTypes.includes('Refund')) estAmount += 350.0;
    if (!selectedTxTypes.includes('Payment')) estAmount = Math.max(0, estAmount - 4000.0);

    return {
      periodStart: `${formattedStartDate} ${startTime}`,
      periodEnd: `${formattedEndDate} ${executionTime}`,
      nextInvoice: `${nextDate} at ${executionTime}`,
      orderCount: selectedTxTypes.length === 0 ? 0 : orderCount,
      estimatedAmount: selectedTxTypes.length === 0 ? 0 : estAmount,
    };
  }, [frequency, executionDay, executionTime, startTime, selectedTxTypes]);

  // Trigger Save
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const commitSave = () => {
    onSaveSchedule({
      autoGenerate,
      frequency,
      executionDay,
      executionTime,
      timezone: selectedTimezone,
      dataStartDate: startDate,
      dataStartTime: startTime,
      transactionTypes: selectedTxTypes,
      paymentStatus: 'Successful',
      currentPeriod: `${previewData.periodStart} → ${previewData.periodEnd}`,
      nextInvoiceDate: previewData.nextInvoice,
      estimatedOrdersCount: previewData.orderCount,
      estimatedAmount: previewData.estimatedAmount,
    });

    setShowConfirmModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4500);
  };

  const handleCancel = () => {
    setAutoGenerate(scheduleSettings.autoGenerate);
    setFrequency(scheduleSettings.frequency || 'Monthly');
    setExecutionDay(scheduleSettings.executionDay || 'Day 30');
    setExecutionTime(scheduleSettings.executionTime || '18:00');
    setSelectedTimezone(scheduleSettings.timezone || 'UTC+07:00 Asia/Ho_Chi_Minh');
    setStartDate(scheduleSettings.dataStartDate || '2026-10-01');
    setStartTime(scheduleSettings.dataStartTime || '00:00');
    setSelectedTxTypes(scheduleSettings.transactionTypes || ['Payment', 'Surcharge', 'Refund']);
    onNavigateToBilling();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <div className="text-[12px] text-[#727785] flex items-center gap-1.5 font-medium">
        <span
          className="hover:text-[#0b1c30] cursor-pointer transition-colors"
          onClick={onNavigateToBilling}
        >
          Account Information
        </span>
        <span>/</span>
        <span
          className="hover:text-[#0b1c30] cursor-pointer transition-colors"
          onClick={onNavigateToBilling}
        >
          Setting
        </span>
        <span>/</span>
        <span className="text-[#0b1c30] font-semibold">
          Invoice Setting
        </span>
      </div>

      {/* Main Setting Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">Setting</h1>
        <p className="text-[13.5px] text-[#727785] mt-1">
          Configure automated consolidated invoice schedule and billing preferences
        </p>
      </div>

      {/* Header bar opening Invoice Setting */}
      <div className="border-b border-[#e2e8f0] bg-white rounded-t-xl px-4 pt-2 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="px-4 py-3 text-[14px] font-bold text-[#0058c3] relative flex items-center gap-2 border-b-2 border-[#0058c3] -mb-px">
            <FileText className="w-4 h-4" />
            <span>Invoice Setting</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                autoGenerate
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {autoGenerate ? 'Active' : 'Off'}
            </span>
          </div>
        </div>

        <div className="pr-2 text-[12px] text-[#727785] hidden sm:flex items-center gap-2">
          <span>Automatic Consolidated Invoicing:</span>
          <span className={`font-semibold ${autoGenerate ? 'text-emerald-600' : 'text-slate-500'}`}>
            {autoGenerate ? `Enabled (${frequency})` : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[13.5px] font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>✓ Consolidated Invoice settings updated successfully.</span>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= INVOICE SETTING (CONSOLIDATED INVOICE SETTINGS) ================= */}
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Sub-header Banner with Description */}
        <div className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl p-5">
          <h2 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
            Consolidated Invoice Settings
          </h2>
            <p className="text-[13.5px] text-[#424754] mt-1">
              Automatically generate consolidated invoices based on your preferred schedule.
            </p>
            <p className="text-[12.5px] text-[#727785] mt-0.5">
              Individual transaction invoices will continue to be generated normally.
            </p>
          </div>

          {/* Main Toggle Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[15px] font-bold text-[#0b1c30] block">
                  Automatic Consolidated Invoice
                </span>
                <span className="text-[12px] text-[#727785] mt-0.5 block">
                  Toggle automated periodic aggregation of eligible transactions
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058c3]" />
                <span
                  className={`ml-3 text-[13px] font-bold tracking-wide ${
                    autoGenerate ? 'text-[#0058c3]' : 'text-slate-500'
                  }`}
                >
                  {autoGenerate ? '[ ON ]' : '[ OFF ]'}
                </span>
              </label>
            </div>
          </div>

          {/* Enabled State: Expanded Configuration Form */}
          {autoGenerate && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* ────────────────── 1. Invoice Schedule ────────────────── */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="h-px bg-[#e2e8f0] flex-1" />
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#0b1c30] px-2">
                    Invoice Schedule
                  </h3>
                  <span className="h-px bg-[#e2e8f0] flex-1" />
                </div>

                <div className="space-y-4">
                  {/* Frequency * */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={frequency}
                        onChange={(e) => {
                          const val = e.target.value as InvoiceFrequency;
                          setFrequency(val);
                          if (val === 'Weekly') setExecutionDay('Monday');
                          else if (val === 'Monthly') setExecutionDay('Day 30');
                          else if (val === 'Bi-Weekly') setExecutionDay('Oct 12, 2026');
                          else if (val === 'Quarterly') setExecutionDay('Oct 01, 2026');
                        }}
                        className="w-full h-10 px-3 pr-8 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Field: Generate on * */}
                  {frequency === 'Weekly' && (
                    <div>
                      <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                        Generate on <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={executionDay}
                        onChange={(e) => setExecutionDay(e.target.value)}
                        className="w-full h-10 px-3 pr-8 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {frequency === 'Monthly' && (
                    <div>
                      <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                        Generate on <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={executionDay}
                        onChange={(e) => setExecutionDay(e.target.value)}
                        className="w-full h-10 px-3 pr-8 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      >
                        {DAYS_OF_MONTH.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      {isHighDayOfMonth && (
                        <p className="text-[11.5px] text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-md p-2 mt-1.5 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            If the selected day does not exist in a month, the invoice will be generated on the last day of that month.
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {(frequency === 'Bi-Weekly' || frequency === 'Quarterly') && (
                    <div>
                      <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                        First generation date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={
                          executionDay.includes('-')
                            ? executionDay
                            : frequency === 'Bi-Weekly'
                            ? '2026-10-12'
                            : '2026-10-01'
                        }
                        onChange={(e) => setExecutionDay(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      />
                    </div>
                  )}

                  {/* Generate at * */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                      Generate at <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 max-w-xs">
                      <input
                        type="time"
                        value={executionTime}
                        onChange={(e) => setExecutionTime(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] font-mono text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3] w-36"
                      />
                      <span className="text-[12px] text-[#727785] font-mono">[ HH : MM ]</span>
                    </div>
                  </div>

                  {/* Timezone * */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                      Timezone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                    >
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start collecting orders from * */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-1.5">
                      Start collecting orders from <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-[#c2c6d6]/80 text-[13.5px] font-mono text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3] w-32"
                      />
                    </div>
                    <p className="text-[11.5px] text-[#727785] mt-1.5 leading-relaxed">
                      This field defines when the system should start collecting Orders for the first Consolidated Invoice. After the first invoice is generated, the system automatically continues the next billing period to ensure no missing or overlapping Orders.
                    </p>
                  </div>
                </div>
              </div>

              {/* ────────────────── 2. Orders Included ────────────────── */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-3">
                  <span className="h-px bg-[#e2e8f0] flex-1" />
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#0b1c30] px-2">
                    Orders Included
                  </h3>
                  <span className="h-px bg-[#e2e8f0] flex-1" />
                </div>

                <div className="space-y-4">
                  {/* Transaction Type */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#0b1c30] mb-2">
                      Transaction Type
                    </label>
                    <div className="flex flex-wrap items-center gap-6">
                      {(['Payment', 'Surcharge', 'Refund'] as const).map((type) => {
                        const checked = selectedTxTypes.includes(type);
                        return (
                          <label
                            key={type}
                            className="inline-flex items-center gap-2.5 cursor-pointer text-[13.5px] text-[#0b1c30] select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleTxType(type)}
                              className="w-4 h-4 rounded border-slate-300 text-[#0058c3] focus:ring-[#0058c3]"
                            />
                            <span className="font-medium">{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cancel and Save Settings */}
              <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-10 px-5 rounded-lg border border-[#e2e8f0] text-[#424754] text-[13.5px] font-medium hover:bg-[#f8f9ff] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="h-10 px-6 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[13.5px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>

      {/* ================= SAVE CONFIRMATION MODAL ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-[3px] animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-xl border border-[#e2e8f0] shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-[17px] font-bold text-[#0b1c30]">
                Save Consolidated Invoice Settings?
              </h3>
              <p className="text-[12px] text-[#727785] mt-0.5">
                Review your schedule configuration before committing changes
              </p>
            </div>

            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0] text-[13px] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#727785]">Frequency</span>
                <span className="font-semibold text-[#0b1c30]">{frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#727785]">Schedule</span>
                <span className="font-semibold text-[#0b1c30]">
                  {executionDay} at {executionTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#727785]">Timezone</span>
                <span className="font-medium text-[#0b1c30]">
                  {selectedTimezone.split(' ')[0]}
                </span>
              </div>
              <div className="border-t border-[#e2e8f0] pt-2">
                <span className="text-[#727785] block text-[11px] uppercase font-bold tracking-wider mb-1">
                  First Billing Period
                </span>
                <span className="font-mono text-[12px] font-semibold text-[#0b1c30] block">
                  {previewData.periodStart} → {previewData.periodEnd}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e2e8f0] pt-2">
                <span className="text-[#727785]">Next Consolidated Invoice</span>
                <span className="font-semibold text-[#0058c3]">
                  {previewData.nextInvoice}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="h-9 px-4 rounded-lg border border-[#e2e8f0] text-[#424754] text-[13px] font-medium hover:bg-[#f8f9ff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitSave}
                className="h-9 px-5 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[13px] font-semibold shadow-xs cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
