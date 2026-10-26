import React, { useState } from 'react';
import {
  Save,
  ChevronDown,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Mail,
  Sliders,
  Shield,
  FileText,
  AlertCircle,
  HelpCircle,
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

const TIMEZONE_LIST = [
  { value: '00:00', label: '00:00 (GMT / London / UTC)' },
  { value: '+07:00', label: '+07:00 (Asia / Ho Chi Minh / Bangkok)' },
  { value: '-05:00', label: '-05:00 (America / New York / EST)' },
  { value: '-06:00', label: '-06:00 (America / Chicago / CST)' },
  { value: '-08:00', label: '-08:00 (America / Los Angeles / PST)' },
  { value: '+08:00', label: '+08:00 (Asia / Singapore / SGT)' },
  { value: '+01:00', label: '+01:00 (Europe / Paris / CET)' },
];

const PURCHASE_LABEL_OPTIONS = [
  'Automatically upon successful payment of the order',
  'Automatically in 4 hours',
  'Automatically in 8 hours',
  'Automatically in 12 hours',
  'Automatically in 24 hours',
];

const ACCOUNT_SUB_TABS = [
  'Profile',
  'Change password',
  'Setting',
  'Doc API',
  'Webhook',
  'Team member',
];

export const CustomerSettingView: React.FC<CustomerSettingViewProps> = ({
  scheduleSettings,
  activeTab,
  onSaveSchedule,
  onNavigateToBilling,
  onAddToast,
}) => {
  // Top navigation sub-tab (Default to 'Setting' matching image_917f6409.png)
  const [activeAccountTab, setActiveAccountTab] = useState<string>('Setting');

  // When navigated with activeTab = 'invoice-setting', ensure Setting tab is active and scroll to section
  React.useEffect(() => {
    if (activeTab === 'invoice-setting') {
      setActiveAccountTab('Setting');
      setTimeout(() => {
        const el = document.getElementById('invoice-setting-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [activeTab]);

  // Account Settings (Matching image_917f6409.png)
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('00:00');
  const [notificationActive, setNotificationActive] = useState<boolean>(true);
  const [emailActive, setEmailActive] = useState<boolean>(true);
  const [purchaseLabelOption, setPurchaseLabelOption] = useState<string>(
    'Automatically upon successful payment of the order'
  );

  // Invoice Setting (Integrated as requested: "Cho phần Invoice Setting vào màn hình trên")
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState<boolean>(
    scheduleSettings.autoGenerate
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
  const [startDate, setStartDate] = useState<string>(
    scheduleSettings.dataStartDate || '2026-10-01'
  );
  const [legalEntityChoice, setLegalEntityChoice] = useState<string>(
    'FASTWAY LOGISTICS FULFILLMENT LLC'
  );
  const [notificationRecipientEmail, setNotificationRecipientEmail] = useState<string>(
    'vendor@printway.io'
  );
  const [selectedTxTypes, setSelectedTxTypes] = useState<
    ('Payment' | 'Surcharge' | 'Refund')[]
  >(scheduleSettings.transactionTypes || ['Payment', 'Surcharge', 'Refund']);

  // Success indicator
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      dataStartDate: startDate,
      transactionTypes: selectedTxTypes,
      timezone: selectedTimeZone,
    };

    onSaveSchedule(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);

    if (onAddToast) {
      onAddToast(
        'Settings Saved Successfully',
        'Account configurations and Periodic Invoice schedule have been updated.',
        'success'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Top Header with Title and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
          Account information
        </h1>

        <button
          type="button"
          onClick={handleSaveAll}
          className="h-9 px-5 rounded-lg bg-[#0080ff] hover:bg-[#006ee6] text-white font-semibold text-[13px] shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Sub-tab Navigation Pills (Matching image_917f6409.png) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {ACCOUNT_SUB_TABS.map((tab) => {
          const isActive = activeAccountTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveAccountTab(tab)}
              className={`h-9 px-6 rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#12263f] text-white font-semibold shadow-xs'
                  : 'border border-[#d2d6dc] bg-white text-[#4b5563] hover:text-[#0b1c30] hover:border-[#9ca3af]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All settings updated and saved to account successfully.</span>
        </div>
      )}

      {/* Main Account Settings Grid (Matching layout of image_917f6409.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Time Zone + Method of receiving notifications */}
        <div className="space-y-5">
          {/* Card 1: Time Zone* */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs">
            <label className="block text-[13px] font-semibold text-[#0b1c30] mb-2">
              Time Zone<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTimeZone}
                onChange={(e) => setSelectedTimeZone(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0080ff] cursor-pointer"
              >
                {TIMEZONE_LIST.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Card 2: Method of receiving notifications* */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-4">
            <label className="block text-[13px] font-semibold text-[#0b1c30]">
              Method of receiving notifications<span className="text-red-500 ml-0.5">*</span>
            </label>

            {/* Row 1: Notifications */}
            <div className="flex items-center justify-between py-2 border-b border-[#f1f5f9]">
              <span className="text-[13px] font-medium text-[#0b1c30]">Notifications</span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    notificationActive
                      ? 'bg-[#e6f9f0] text-[#00a86b]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {notificationActive ? 'Active' : 'Inactive'}
                </span>
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
            </div>

            {/* Row 2: Email */}
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] font-medium text-[#0b1c30]">Email</span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    emailActive
                      ? 'bg-[#e6f9f0] text-[#00a86b]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {emailActive ? 'Active' : 'Inactive'}
                </span>
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
          </div>
        </div>

        {/* Right Column: Card 3: Purchase Label* */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#0b1c30]">
              Purchase Label<span className="text-red-500 ml-0.5">*</span>
            </label>
            <p className="text-[12px] text-[#727785] mt-1 leading-relaxed">
              Choose the time to purchase the label from the moment the order is successfully paid. Changes will be applied to new orders
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {PURCHASE_LABEL_OPTIONS.map((opt) => {
              const isSelected = purchaseLabelOption === opt;
              return (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer group text-[13px] text-[#0b1c30]"
                >
                  <input
                    type="radio"
                    name="purchase_label_delay"
                    checked={isSelected}
                    onChange={() => setPurchaseLabelOption(opt)}
                    className="w-4 h-4 text-[#0080ff] border-[#c2c6d6] focus:ring-[#0080ff] cursor-pointer"
                  />
                  <span className={`${isSelected ? 'font-medium text-[#0b1c30]' : 'text-[#424754] group-hover:text-[#0b1c30]'}`}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Integrated Section: Invoice Setting / Cài đặt hóa đơn theo kỳ */}
      {/* Spec: "Phần Cho phần Invoice Setting vào màn hình trên" */}
      <div id="invoice-setting-section" className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden scroll-mt-6">
        {/* Card Header with Status Badge */}
        <div className="p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafbfc]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] text-[#0058c3] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                Invoice Setting (Cài đặt hóa đơn theo kỳ)
              </h2>
              <p className="text-[12px] text-[#727785]">
                Configure periodic billing cycles, consolidated invoices, and automated delivery
              </p>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#0b1c30]">
              Active:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                autoGenerateInvoices
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {autoGenerateInvoices ? 'Active' : 'Inactive'}
            </span>
            <button
              type="button"
              onClick={() => setAutoGenerateInvoices(!autoGenerateInvoices)}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                autoGenerateInvoices ? 'bg-[#00d084]' : 'bg-slate-300'
              }`}
              title={autoGenerateInvoices ? 'Deactivate periodic invoices' : 'Activate periodic invoices'}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-transform ${
                  autoGenerateInvoices ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Body: Only shown when Active is enabled */}
        {autoGenerateInvoices ? (
          <div className="p-6 space-y-6">
            {/* Active Period Overview Banner */}
            <div className="bg-[#f0f7ff] border border-[#d0e5ff] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0058c3] shrink-0" />
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#0058c3] uppercase block">
                    Current Active Billing Cycle
                  </span>
                  <span className="text-[13px] font-semibold text-[#0b1c30]">
                    {scheduleSettings.currentPeriod}
                  </span>
                </div>
              </div>

              <div className="text-[12px] text-[#424754] flex items-center gap-2">
                <span>Next invoice execution:</span>
                <strong className="text-[#0058c3] font-semibold">
                  {scheduleSettings.nextInvoiceDate}
                </strong>
              </div>
            </div>

            {/* Form Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Frequency Selection */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">
                  Billing Frequency (Tần suất xuất hóa đơn)
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as InvoiceFrequency)}
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0080ff] cursor-pointer"
                  >
                    <option value="Daily">Daily (Hàng ngày)</option>
                    <option value="Weekly">Weekly (Hàng tuần)</option>
                    <option value="Bi-Weekly">Bi-Weekly (2 tuần / kỳ)</option>
                    <option value="Monthly">Monthly (Hàng tháng)</option>
                    <option value="Quarterly">Quarterly (Hàng quý)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Execution Schedule */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">
                  Execution Day & Time (Thời điểm xuất)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={executionDay}
                      onChange={(e) => setExecutionDay(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0080ff] cursor-pointer"
                    >
                      <option value="Day 15">Day 15</option>
                      <option value="Day 30">Day 30</option>
                      <option value="Last day of month">Last day</option>
                      <option value="Friday">Friday</option>
                      <option value="Monday">Monday</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#727785] absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                  <input
                    type="time"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0080ff]"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">
                  Start Collecting Orders From (Bắt đầu gom đơn)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0080ff]"
                />
              </div>

              {/* Preferred Legal Entity */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">
                  Legal Entity (Pháp nhân phát hành mặc định)
                </label>
                <div className="relative">
                  <select
                    value={legalEntityChoice}
                    onChange={(e) => setLegalEntityChoice(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#0b1c30] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0080ff] cursor-pointer"
                  >
                    <option value="FASTWAY LOGISTICS FULFILLMENT LLC">
                      FASTWAY LOGISTICS FULFILLMENT LLC (FW-US) — 1300 E 7th St, Austin, TX 78702
                    </option>
                    <option value="PRINTWAY LLC">
                      PRINTWAY LLC (PW-US) — 16192 Coastal Hwy, Lewes, DE 19958
                    </option>
                    <option value="PRINTWAY VIETNAM CO., LTD">
                      PRINTWAY VIETNAM CO., LTD (PW-VN) — 12A Floor, Peakview Tower, Hanoi
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Notification Email */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">
                  Invoice Recipient Email (Email nhận hóa đơn)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={notificationRecipientEmail}
                    onChange={(e) => setNotificationRecipientEmail(e.target.value)}
                    className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#e2e8f0] text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0080ff]"
                  />
                  <Mail className="w-4 h-4 text-[#727785] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Included Transaction Types */}
            <div className="pt-2 border-t border-[#f1f5f9]">
              <label className="block text-[12px] font-semibold text-[#0b1c30] mb-2">
                Included Transactions (Loại giao dịch gộp vào kỳ)
              </label>
              <div className="flex flex-wrap gap-4 text-[13px] text-[#0b1c30]">
                {(['Payment', 'Surcharge', 'Refund'] as const).map((type) => {
                  const isChecked = selectedTxTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTxType(type)}
                        className="w-4 h-4 rounded text-[#0080ff] border-[#c2c6d6] focus:ring-[#0080ff] cursor-pointer"
                      />
                      <span>{type} Orders</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#fafbfc]">
            <p className="text-[14px] font-semibold text-[#0b1c30]">
              Invoice Setting is currently Inactive
            </p>
            <p className="text-[12px] text-[#727785] mt-1 max-w-md mx-auto">
              Switch on <strong className="text-[#0058c3]">Active</strong> above to display and configure billing frequency, execution day/time, starting date, legal entity, and automatic delivery settings.
            </p>
          </div>
        )}

        {/* Card Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateToBilling}
            className="text-[13px] text-[#0058c3] hover:text-[#004398] font-semibold flex items-center gap-1 cursor-pointer"
          >
            ← Return to Billing Ledger
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="h-8.5 px-5 rounded-lg bg-[#0080ff] hover:bg-[#006ee6] text-white font-semibold text-[13px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
