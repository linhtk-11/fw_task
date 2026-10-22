import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Wallet,
  Coins,
  Settings,
  UserCheck,
  Building2,
} from 'lucide-react';

interface TopNavProps {
  isSidebarCollapsed: boolean;
  userRole: 'customer' | 'admin';
  onSwitchRole: (role: 'customer' | 'admin') => void;
  walletBalance: number;
  unpaidAmount: number;
  onNavigateToSettings: () => void;
  onNavigateToBillingEntity?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isSidebarCollapsed,
  userRole,
  onSwitchRole,
  walletBalance,
  unpaidAmount,
  onNavigateToSettings,
  onNavigateToBillingEntity,
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'US' | 'VN' | 'UK'>('US');

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6 gap-3.5 bg-white border-b border-[#e2e8f0] shadow-xs select-none transition-all duration-300 ${
        isSidebarCollapsed ? 'left-[72px]' : 'left-60'
      }`}
    >
      {/* Left side: Role Switcher & Context Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center p-1 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] text-[12px] font-semibold">
          <button
            type="button"
            onClick={() => onSwitchRole('customer')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              userRole === 'customer'
                ? 'bg-white text-[#0058c3] shadow-xs font-bold'
                : 'text-[#727785] hover:text-[#0b1c30]'
            }`}
          >
            Customer View
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('admin')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              userRole === 'admin'
                ? 'bg-[#0058c3] text-white shadow-xs font-bold'
                : 'text-[#727785] hover:text-[#0b1c30]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </div>

        {userRole === 'admin' && (
          <button
            type="button"
            onClick={onNavigateToBillingEntity}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#0058c3] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors cursor-pointer border border-[#c2c6d6]/40"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Quản lý pháp nhân</span>
          </button>
        )}
      </div>

      {/* Right side: Balance Widgets (Customer) / Controls */}
      <div className="flex items-center gap-3.5">
        {/* Customer Mode Header Widgets */}
        {userRole === 'customer' && (
          <div className="flex items-center gap-3 mr-1">
            {/* Balance Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f8f9ff] border border-[#e2e8f0]">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] text-[#727785] block">Balance</span>
                <span className="text-[13px] font-bold text-[#0b1c30]">
                  ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          {/* Unpaid Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="w-6 h-6 rounded-md bg-orange-50 text-orange-500 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[10px] text-[#727785] block">Unpaid</span>
              <span className="text-[13px] font-bold text-[#0b1c30]">
                ${unpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Locale Switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors duration-150 cursor-pointer text-[13px] font-medium"
        >
          {selectedLanguage === 'US' && (
            <svg className="w-5 h-3.5 rounded-xs overflow-hidden shrink-0 shadow-xs" viewBox="0 0 640 480">
              <g fillRule="evenodd">
                <g strokeWidth="1pt">
                  <path d="M0 0h640v480H0z" fill="#bd3d44" />
                  <path d="M0 37h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0z" fill="#fff" />
                  <path d="M0 0h288v259H0z" fill="#192f5d" />
                </g>
              </g>
            </svg>
          )}
          {selectedLanguage === 'VN' && <span className="text-sm">🇻🇳</span>}
          {selectedLanguage === 'UK' && <span className="text-sm">🇬🇧</span>}
          <ChevronDown className="w-3.5 h-3.5 text-[#727785]" />
        </button>

        {showLanguageMenu && (
          <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#e2e8f0] rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]">
            <button
              onClick={() => {
                setSelectedLanguage('US');
                setShowLanguageMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30]"
            >
              <span>🇺🇸</span> English (US)
            </button>
            <button
              onClick={() => {
                setSelectedLanguage('VN');
                setShowLanguageMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30]"
            >
              <span>🇻🇳</span> Tiếng Việt
            </button>
            <button
              onClick={() => {
                setSelectedLanguage('UK');
                setShowLanguageMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30]"
            >
              <span>🇬🇧</span> English (UK)
            </button>
          </div>
        )}
      </div>

      {/* Notification Bell with Badge (15 in customer image, 3 in admin) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowNotificationMenu(!showNotificationMenu)}
          className="relative cursor-pointer hover:bg-[#f8f9ff] p-2 rounded-lg text-[#424754] transition-colors duration-150 flex items-center justify-center"
          title="Notifications"
        >
          <Bell className="w-[19px] h-[19px]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#0058c3] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
            {userRole === 'customer' ? '15' : '3'}
          </span>
        </button>

        {showNotificationMenu && (
          <div className="absolute right-0 mt-1.5 w-80 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0] font-semibold text-[#0b1c30]">
              <span>Notifications</span>
              <span className="text-[11px] text-[#0058c3] cursor-pointer hover:underline">Mark all read</span>
            </div>
            <div className="divide-y divide-[#f1f5f9] mt-1 max-h-64 overflow-y-auto">
              <div className="py-2.5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-[#0b1c30]">Invoice #100000063296 generated</p>
                  <p className="text-[11px] text-[#727785]">Weekly ledger settled: $109.25 paid</p>
                  <span className="text-[10px] text-[#94a3b8]">2 mins ago</span>
                </div>
              </div>
              <div className="py-2.5 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-[#0b1c30]">Next invoice cycle scheduled</p>
                  <p className="text-[11px] text-[#727785]">Next invoice generation scheduled for Oct 26, 2026</p>
                  <span className="text-[10px] text-[#94a3b8]">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Dropdown Pill (Matching image_837a4698.png) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 pl-3 pr-2 py-1.5 border-l border-[#e2e8f0] cursor-pointer hover:bg-[#f8f9ff] rounded-lg transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#0058c3] font-bold text-[12px] border border-[#c2c6d6]/40 shrink-0">
            TK
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-medium text-[#0b1c30] leading-tight">
              Tôn Khánh Linh
            </span>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-[#e5eeff] text-[#0058c3] text-[10px] font-semibold tracking-wide border border-[#c2c6d6]/30 self-start">
              {userRole === 'customer' ? 'Customer' : 'Super Admin'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#727785] ml-0.5" />
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[13px]">
            <div className="px-3.5 py-2 border-b border-[#e2e8f0]">
              <p className="font-semibold text-[#0b1c30]">Tôn Khánh Linh</p>
              <p className="text-[11px] text-[#727785]">khanhlinhbg03@gmail.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Account Active
              </span>
            </div>

            <div className="py-1">
              {userRole === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigateToBillingEntity) onNavigateToBillingEntity();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#eff4ff] flex items-center gap-2.5 text-[#0058c3] font-semibold cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#0058c3]" />
                  <span>Legal Entity Management (Pháp Nhân)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateToSettings();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#eff4ff] flex items-center gap-2.5 text-[#0b1c30] cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#0058c3]" />
                  <span>Account Information → Setting</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onSwitchRole(userRole === 'customer' ? 'admin' : 'customer');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#eff4ff] flex items-center justify-between text-[#0058c3] font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Switch to {userRole === 'customer' ? 'Admin Portal' : 'Customer View'}</span>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left px-3.5 py-2 hover:bg-[#eff4ff] flex items-center gap-2.5 text-[#e11d48] cursor-pointer border-t border-[#f1f5f9] mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
};
