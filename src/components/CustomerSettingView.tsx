import React, { useState, useEffect } from 'react';
import {
  Save,
  ChevronDown,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  AlertCircle,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { InvoiceFrequency, InvoiceScheduleSettings } from '../types/billing';

interface CustomerSettingViewProps {
  scheduleSettings: InvoiceScheduleSettings;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSaveSchedule: (newSettings: InvoiceScheduleSettings) => void;
  onNavigateToBilling: () => void;
  onAddToast?: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

const TIMEZONE_OPTIONS = [
  'UTC+07:00 Asia/Ho_Chi_Minh',
  'UTC+00:00 Europe/London (GMT)',
  'UTC-05:00 America/New_York (EST)',
  'UTC-06:00 America/Chicago (CST)',
  'UTC-08:00 America/Los_Angeles (PST)',
  'UTC+08:00 Asia/Singapore (SGT)',
  'UTC+01:00 Europe/Paris (CET)',
  'UTC+09:00 Asia/Tokyo (JST)',
];

const PURCHASE_LABEL_OPTIONS = [
  'Automatically upon successful payment of the order',
  'Automatically in 4 hours',
  'Automatically in 8 hours',
  'Automatically in 12 hours',
  'Automatically in 24 hours',
];

export const CustomerSettingView: React.FC<CustomerSettingViewProps> = ({
  scheduleSettings,
  activeTab,
  onSaveSchedule,
  onNavigateToBilling,
  onAddToast,
}) => {
  // Main view tab: 'invoice-setting' matching image_b42c0245.png
  const [activeMainTab, setActiveMainTab] = useState<'invoice-setting' | 'account-preferences'>(
    'invoice-setting'
  );

  useEffect(() => {
    if (activeTab === 'invoice-setting') {
      setActiveMainTab('invoice-setting');
    }
  }, [activeTab]);

  // Invoice Setting State (Matching items 4 to 11 in image_b42c0245.png)
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState<boolean>(
    scheduleSettings.autoGenerate ?? true
  );
  const [frequency, setFrequency] = useState<InvoiceFrequency>(
    scheduleSettings.frequency || 'Monthly'
  );
  const [executionDay, setExecutionDay] = useState<string>(
    scheduleSettings.executionDay || 'Day 30'
  );
  const [executionTime, setExecutionTime] = useState<string>(
    scheduleSettings.executionTime || '18:00'
  );
  const [timezone, setTimezone] = useState<string>(
    scheduleSettings.timezone || 'UTC+07:00 Asia/Ho_Chi_Minh'
  );
  const [startDate, setStartDate] = useState<string>(
    scheduleSettings.dataStartDate || '2026-10-01'
  );
  const [startTime, setStartTime] = useState<string>(
    scheduleSettings.dataStartTime || '00:00'
  );
  const [selectedTxTypes, setSelectedTxTypes] = useState<
    ('Payment' | 'Surcharge' | 'Refund')[]
  >(scheduleSettings.transactionTypes || ['Payment', 'Surcharge', 'Refund']);

  // Account Preferences (preserved from earlier setup)
  const [notificationActive, setNotificationActive] = useState<boolean>(true);
  const [emailActive, setEmailActive] = useState<boolean>(true);
  const [purchaseLabelOption, setPurchaseLabelOption] = useState<string>(
    'Automatically upon successful payment of the order'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic generateOn options based on frequency
  const handleFrequencyChange = (newFreq: InvoiceFrequency) => {
    setFrequency(newFreq);
    if (newFreq === 'Monthly') {
      setExecutionDay('Day 30');
    } else if (newFreq === 'Weekly') {
      setExecutionDay('Monday');
    } else if (newFreq === 'Bi-Weekly') {
      setExecutionDay('Day 15 & Last day of month');
    } else if (newFreq === 'Daily') {
      setExecutionDay('Every day');
    } else if (newFreq === 'Quarterly') {
      setExecutionDay('Last day of quarter');
    }
  };

  const handleToggleTxType = (type: 'Payment' | 'Surcharge' | 'Refund') => {
    setSelectedTxTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSaveAll = () => {
    const updatedSettings: InvoiceScheduleSettings = {
      ...scheduleSettings,
      autoGenerate: autoGenerateInvoices,
      frequency,
      executionDay,
      executionTime,
      timezone,
      dataStartDate: startDate,
      dataStartTime: startTime,
      transactionTypes: selectedTxTypes,
    };

    onSaveSchedule(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);

    if (onAddToast) {
      onAddToast(
        'Settings Saved Successfully',
        `Invoice schedule configured: ${frequency} (${executionDay} at ${executionTime}).`,
        'success'
      );
    }
  };

  const handleCancel = () => {
    setAutoGenerateInvoices(scheduleSettings.autoGenerate);
    setFrequency(scheduleSettings.frequency || 'Monthly');
    setExecutionDay(scheduleSettings.executionDay || 'Day 30');
    setExecutionTime(scheduleSettings.executionTime || '18:00');
    setTimezone(scheduleSettings.timezone || 'UTC+07:00 Asia/Ho_Chi_Minh');
    setStartDate(scheduleSettings.dataStartDate || '2026-10-01');
    setStartTime(scheduleSettings.dataStartTime || '00:00');
    setSelectedTxTypes(scheduleSettings.transactionTypes || ['Payment', 'Surcharge', 'Refund']);
    onNavigateToBilling();
  };

  // Convert 24h to 12h display with Vietnamese SA/CH indicator (matching image 06:00 CH)
  const formatTimeVietnamese = (time24: string) => {
    if (!time24) return '18:00';
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return time24;
    const period = h >= 12 ? 'CH' : 'SA';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${m} ${period}`;
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-16">
      {/* Page Title & Subtitle (Matching image_b42c0245.png) */}
      <div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">Setting</h1>
        <p className="text-[13px] text-[#727785] mt-1">
          Configure automated consolidated invoice schedule and billing preferences
        </p>
      </div>

      {/* Top Bar: Tabs (Item 1) & Invoicing Status (Item 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-2">
        {/* Left: Tab Item (Item 1 in image_b42c0245.png) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveMainTab('invoice-setting')}
            className="flex items-center gap-2 pb-2 relative cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#006ee6]" />
              <span className="text-[14px] font-semibold text-[#006ee6]">Invoice Setting</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  autoGenerateInvoices
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                {autoGenerateInvoices ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Active bottom border indicator */}
            {activeMainTab === 'invoice-setting' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#006ee6] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('account-preferences')}
            className="flex items-center gap-2 pb-2 relative cursor-pointer text-[#727785] hover:text-[#0b1c30] transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span className="text-[14px] font-medium">Account Preferences</span>
            {activeMainTab === 'account-preferences' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#006ee6] rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Status Pill (Item 2 in image_b42c0245.png) */}
        <div className="px-3.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[12.5px] text-[#424754] flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
          <span>Automatic Consolidated Invoicing:</span>
          <strong className={autoGenerateInvoices ? 'text-emerald-600 font-bold' : 'text-slate-400 font-bold'}>
            {autoGenerateInvoices ? `Enabled (${frequency})` : 'Disabled'}
          </strong>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All settings updated and saved successfully.</span>
        </div>
      )}

      {/* VIEW 1: INVOICE SETTING (Exact 1:1 match of image_b42c0245.png) */}
      {activeMainTab === 'invoice-setting' && (
        <div className="space-y-5">
          {/* Item 3: Consolidated Invoice Settings Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs">
            <h2 className="text-[16px] font-bold text-[#0b1c30]">
              Consolidated Invoice Settings
            </h2>
            <p className="text-[13px] text-[#424754] mt-1.5 leading-relaxed">
              Automatically generate consolidated invoices based on your preferred schedule.
              <br />
              Individual transaction invoices will continue to be generated normally.
            </p>
          </div>

          {/* Item 4: Automatic Consolidated Invoice Toggle Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#0b1c30]">
                Automatic Consolidated Invoice
              </h3>
              <p className="text-[12.5px] text-[#727785] mt-0.5">
                Toggle automated periodic aggregation of eligible transactions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoGenerateInvoices(!autoGenerateInvoices)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  autoGenerateInvoices ? 'bg-[#006ee6]' : 'bg-slate-300'
                }`}
                title={autoGenerateInvoices ? 'Click to turn OFF' : 'Click to turn ON'}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    autoGenerateInvoices ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
              <span
                className={`font-mono font-bold text-[13px] ${
                  autoGenerateInvoices ? 'text-[#006ee6]' : 'text-slate-400'
                }`}
              >
                [ {autoGenerateInvoices ? 'ON' : 'OFF'} ]
              </span>
            </div>
          </div>

          {/* Main Form Card: Invoice Schedule & Orders Included (Items 5 to 13) */}
          {autoGenerateInvoices ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden p-6 space-y-6">
              {/* Divider: INVOICE SCHEDULE */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#e2e8f0] w-full" />
                <span className="bg-white px-4 text-[12px] font-bold tracking-wider text-[#0b1c30] uppercase shrink-0">
                  INVOICE SCHEDULE
                </span>
                <div className="border-t border-[#e2e8f0] w-full" />
              </div>

              {/* Item 5: Frequency * */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => handleFrequencyChange(e.target.value as InvoiceFrequency)}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#006ee6] cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Daily">Daily</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Item 6: Generate on * */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Generate on <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={executionDay}
                    onChange={(e) => setExecutionDay(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#006ee6] cursor-pointer"
                  >
                    {/* Monthly options */}
                    {frequency === 'Monthly' && (
                      <>
                        <option value="Day 30">Day 30</option>
                        <option value="Day 1">Day 1</option>
                        <option value="Day 5">Day 5</option>
                        <option value="Day 10">Day 10</option>
                        <option value="Day 15">Day 15</option>
                        <option value="Day 20">Day 20</option>
                        <option value="Day 25">Day 25</option>
                        <option value="Day 28">Day 28</option>
                        <option value="Last day of month">Last day of month</option>
                      </>
                    )}

                    {/* Weekly options */}
                    {frequency === 'Weekly' && (
                      <>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </>
                    )}

                    {/* Bi-Weekly options */}
                    {frequency === 'Bi-Weekly' && (
                      <>
                        <option value="Day 15 & Last day of month">Day 15 & Last day of month</option>
                        <option value="Day 1 & Day 15">Day 1 & Day 15</option>
                        <option value="Every 2nd Monday">Every 2nd Monday</option>
                        <option value="Every 2nd Friday">Every 2nd Friday</option>
                      </>
                    )}

                    {/* Daily options */}
                    {frequency === 'Daily' && (
                      <>
                        <option value="Every day">Every day</option>
                      </>
                    )}

                    {/* Quarterly options */}
                    {frequency === 'Quarterly' && (
                      <>
                        <option value="Last day of quarter">Last day of quarter</option>
                        <option value="First day of quarter">First day of quarter</option>
                        <option value="Day 15 of quarter end">Day 15 of quarter end</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Item 7: Notice box */}
                <div className="bg-[#fff9f0] border border-[#ffedd5] rounded-lg p-3 text-[12px] text-[#c2410c] flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <span>
                    {frequency === 'Monthly' || frequency === 'Quarterly' || frequency === 'Bi-Weekly'
                      ? 'If the selected day does not exist in a month, the invoice will be generated on the last day of that month.'
                      : frequency === 'Weekly'
                      ? 'The consolidated invoice will be generated weekly on the selected weekday.'
                      : 'The consolidated invoice will be generated every day at the scheduled time.'}
                  </span>
                </div>
              </div>

              {/* Item 8: Generate at * */}
              <div className="space-y-1.5 max-w-[300px]">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Generate at <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border border-[#e2e8f0] rounded-lg bg-white focus-within:ring-1 focus-within:ring-[#006ee6] overflow-hidden">
                  <input
                    type="time"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="h-10 pl-3 pr-2 flex-1 text-[13px] text-[#0b1c30] font-mono focus:outline-none bg-transparent cursor-pointer"
                  />
                  <div className="flex items-center gap-2 pr-3 pointer-events-none text-[12px] text-[#727785]">
                    <span className="text-[11.5px] font-semibold text-[#006ee6]">
                      {formatTimeVietnamese(executionTime)}
                    </span>
                    <Clock className="w-4 h-4 text-[#94a3b8]" />
                    <span className="font-mono text-[11px] text-[#94a3b8]">[ HH : MM ]</span>
                  </div>
                </div>
              </div>

              {/* Item 9: Timezone * */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#006ee6] cursor-pointer"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Item 10: Start collecting orders from * */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Start collecting orders from <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Date Input */}
                  <div className="relative flex-1 w-full sm:w-auto">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006ee6] bg-white cursor-pointer"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="relative flex-1 w-full sm:w-auto">
                    <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#006ee6]">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full h-10 px-3.5 text-[13px] text-[#0b1c30] font-mono focus:outline-none bg-transparent cursor-pointer"
                      />
                      <span className="pr-3 text-[11px] text-[#94a3b8] font-semibold whitespace-nowrap pointer-events-none">
                        {formatTimeVietnamese(startTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[12px] text-[#727785] mt-1.5 leading-relaxed">
                  This field defines when the system should start collecting Orders for the first Consolidated Invoice. After the first invoice is generated, the system automatically continues the next billing period to ensure no missing or overlapping Orders.
                </p>
              </div>

              {/* Divider: ORDERS INCLUDED */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#e2e8f0] w-full" />
                <span className="bg-white px-4 text-[12px] font-bold tracking-wider text-[#0b1c30] uppercase shrink-0">
                  ORDERS INCLUDED
                </span>
                <div className="border-t border-[#e2e8f0] w-full" />
              </div>

              {/* Item 11: Transaction Type */}
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#0b1c30]">
                  Transaction Type
                </label>
                <div className="flex flex-wrap items-center gap-6">
                  {(['Payment', 'Surcharge', 'Refund'] as const).map((type) => {
                    const isChecked = selectedTxTypes.includes(type);
                    return (
                      <label key={type} className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-[#0b1c30]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTxType(type)}
                          className="w-4 h-4 rounded text-[#006ee6] border-[#c2c6d6] focus:ring-[#006ee6] cursor-pointer"
                        />
                        <span className="font-medium">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Items 12 & 13: Cancel and Save Settings buttons */}
              <div className="pt-6 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-9 px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-[13px] transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="h-9 px-6 rounded-lg bg-[#006ee6] hover:bg-[#0058c3] text-white font-semibold text-[13px] transition-colors cursor-pointer shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          ) : (
            /* Inactive State Prompt */
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center shadow-xs">
              <p className="text-[14px] font-semibold text-[#0b1c30]">
                Automatic Consolidated Invoicing is currently turned OFF
              </p>
              <p className="text-[12.5px] text-[#727785] mt-1 max-w-md mx-auto">
                Toggle the switch above to <strong className="text-[#006ee6]">[ ON ]</strong> to configure your periodic aggregation schedule, frequency, and order inclusion settings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACCOUNT PREFERENCES (Preserved for general account preferences) */}
      {activeMainTab === 'account-preferences' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Account Preferences</h2>
            <p className="text-[12px] text-[#727785] mt-0.5">
              Manage system notifications, emails, and automatic purchase label policies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="space-y-4">
              <label className="block text-[13px] font-semibold text-[#0b1c30]">
                Method of receiving notifications
              </label>

              <div className="flex items-center justify-between py-2.5 border-b border-[#f1f5f9]">
                <span className="text-[13px] font-medium text-[#0b1c30]">In-app Notifications</span>
                <button
                  type="button"
                  onClick={() => setNotificationActive(!notificationActive)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    notificationActive ? 'bg-[#00d084]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-transform ${
                      notificationActive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-[#f1f5f9]">
                <span className="text-[13px] font-medium text-[#0b1c30]">Email Notifications</span>
                <button
                  type="button"
                  onClick={() => setEmailActive(!emailActive)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    emailActive ? 'bg-[#00d084]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-transform ${
                      emailActive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Purchase Label */}
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-[#0b1c30]">
                Purchase Label
              </label>
              <div className="space-y-2">
                {PURCHASE_LABEL_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[12.5px] text-[#424754]">
                    <input
                      type="radio"
                      name="pref_purchase_label"
                      checked={purchaseLabelOption === opt}
                      onChange={() => setPurchaseLabelOption(opt)}
                      className="w-4 h-4 text-[#006ee6] border-[#c2c6d6] focus:ring-[#006ee6] cursor-pointer"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              className="h-9 px-5 rounded-lg bg-[#006ee6] hover:bg-[#0058c3] text-white font-semibold text-[13px] shadow-xs cursor-pointer transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
