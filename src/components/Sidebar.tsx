import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  ShoppingBag,
  Grid,
  Truck,
  Package,
  Tag,
  Wallet,
  FileBarChart,
  Users,
  Building2,
  Settings,
  Ticket,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
  Layers,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'billing' | 'export-invoice' | 'setting' | 'billing-entity' | 'legal-entity-detail';
  settingTab?: string;
  billingSubTab?: string;
  userRole: 'customer' | 'admin';
  onNavigate: (view: any, subTab?: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  expandable?: boolean;
  subItems?: string[];
  isActive?: boolean;
  action?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  settingTab = 'invoice-setting',
  billingSubTab = 'Invoice',
  userRole,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    orders: userRole === 'customer', // expand by default in customer view as seen in image_837a4698.png
    billing: true,
    products: false,
    pickup: false,
    freight: false,
    report: false,
    carrier: false,
    setting: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Customer navigation items matching image_837a4698.png
  const customerNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      expandable: true,
      subItems: ['Orders', 'SCAN Form', 'Check Address'],
    },
    { id: 'products', label: 'Products', icon: Grid, expandable: true },
    { id: 'discount', label: 'Discount', icon: Tag },
    {
      id: 'billing',
      label: 'Billing',
      icon: Wallet,
      expandable: true,
      subItems: ['Invoice', 'Periodic Invoices'],
      isActive: currentView === 'billing' || currentView === 'export-invoice',
      action: () => {
        toggleSection('billing');
        onNavigate('billing');
      },
    },
    { id: 'report', label: 'Report', icon: FileBarChart, expandable: true },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'ticket', label: 'Ticket', icon: Ticket },
    { id: 'integration', label: 'Integration', icon: Layers },
    {
      id: 'setting',
      label: 'Setting',
      icon: Settings,
      isActive: currentView === 'setting',
      action: () => {
        onNavigate('setting');
      },
    },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, expandable: true },
    { id: 'products', label: 'Products', icon: Grid, expandable: true },
    { id: 'pickup', label: 'Pickup', icon: Truck, expandable: true },
    { id: 'freight', label: 'Freight', icon: Package, expandable: true },
    { id: 'discount', label: 'Discount', icon: Tag },
    {
      id: 'billing',
      label: 'Billing',
      icon: Wallet,
      expandable: true,
      subItems: ['Invoice', 'Export Logs', 'Legal Entity'],
      isActive: currentView === 'billing' || currentView === 'export-invoice',
      action: () => {
        toggleSection('billing');
        onNavigate('billing');
      },
    },
    { id: 'report', label: 'Report', icon: FileBarChart, expandable: true },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'carrier-management', label: 'Carrier Management', icon: Building2, expandable: true },
    {
      id: 'setting',
      label: 'Setting',
      icon: Settings,
      expandable: true,
      subItems: ['Legal Entity', 'Role & Permission'],
      isActive: currentView === 'billing-entity' || currentView === 'legal-entity-detail' || (currentView === 'setting' && userRole === 'customer'),
      action: () => {
        toggleSection('setting');
        onNavigate('billing-entity');
      },
    },
    { id: 'ticket', label: 'Ticket', icon: Ticket },
  ];

  const items = userRole === 'customer' ? customerNavItems : adminNavItems;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between bg-white border-r border-[#e2e8f0] shadow-xs select-none transition-all duration-300 ${
        isCollapsed ? 'w-[72px] p-3' : 'w-60 p-4'
      }`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 pt-1 px-1">
          <div
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1e70eb] flex items-center justify-center text-white shadow-xs shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="text-[19px] font-bold text-[#0058c3] tracking-tight leading-none">
                  Fastway
                </div>
                <div className="text-[10px] text-[#727785] tracking-wider font-semibold mt-0.5">
                  {userRole === 'customer' ? 'CUSTOMER PORTAL' : 'LOGISTICS .CO'}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label="Toggle Menu"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754] transition-colors border border-[#c2c6d6]/40 cursor-pointer shrink-0"
            type="button"
            title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Tab Links */}
        <nav className="space-y-0.5 mt-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.isActive;

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.expandable) {
                      toggleSection(item.id);
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                    isItemActive
                      ? 'bg-[#dce9ff] text-[#0058c3] font-semibold shadow-xs'
                      : 'text-[#424754] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                  } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        isItemActive ? 'text-[#0058c3]' : 'text-[#727785]'
                      }`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.expandable && (
                    <ChevronDown
                      className={`w-4 h-4 text-[#727785] transition-transform duration-200 ${
                        expandedSections[item.id] ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Sub-items (expanded state matching image_837a4698.png) */}
                {!isCollapsed && item.expandable && expandedSections[item.id] && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-[12px] text-[#727785]">
                    {(item.subItems || ['Overview', 'Active Manifests']).map((sub) => {
                      const isSubActive =
                        (sub === 'Invoice Setting' && currentView === 'setting') ||
                        ((sub === 'Legal Entity' || sub === 'Billing Entity') && (currentView === 'billing-entity' || currentView === 'legal-entity-detail')) ||
                        (sub === 'Invoice' && currentView === 'billing' && billingSubTab === 'Invoice') ||
                        (sub === 'Periodic Invoices' && currentView === 'billing' && billingSubTab === 'Periodic Invoices') ||
                        (sub === 'Export Logs' && currentView === 'billing' && billingSubTab === 'Export Logs');

                      return (
                        <div
                          key={sub}
                          onClick={() => {
                            if (sub === 'Invoice Setting') {
                              onNavigate('setting', 'invoice-setting');
                            } else if (sub === 'Legal Entity' || sub === 'Billing Entity') {
                              onNavigate('billing-entity');
                            } else if (sub === 'Invoice') {
                              onNavigate('billing', 'Invoice');
                            } else if (sub === 'Periodic Invoices') {
                              onNavigate('billing', 'Periodic Invoices');
                            } else if (sub === 'Export Logs') {
                              onNavigate('billing', 'Export Logs');
                            }
                          }}
                          className={`py-1.5 px-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                            isSubActive
                              ? 'text-[#0058c3] font-semibold bg-[#eff4ff]'
                              : 'hover:text-[#0058c3] hover:bg-[#eff4ff]'
                          }`}
                        >
                          <span>{sub}</span>
                          {isSubActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058c3]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-[#727785] text-[11px]">
        {!isCollapsed ? (
          <>
            <span className="font-medium">v3.4.2 Customer</span>
            <Shield className="w-4 h-4 text-[#c2c6d6]" />
          </>
        ) : (
          <Shield className="w-4 h-4 mx-auto text-[#c2c6d6]" />
        )}
      </div>
    </aside>
  );
};
