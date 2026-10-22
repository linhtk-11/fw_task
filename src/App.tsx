import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { BillingDashboard } from './components/BillingDashboard';
import { CustomerBillingView } from './components/CustomerBillingView';
import { CustomerSettingView } from './components/CustomerSettingView';
import { CreateInvoiceView } from './components/CreateInvoiceView';
import { BillingEntityManager } from './components/BillingEntityManager';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { OrderListModal } from './components/OrderListModal';
import { SentPaymentModal } from './components/SentPaymentModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  INITIAL_METRICS,
  INITIAL_INVOICES,
  CUSTOMER_INVOICES,
  CUSTOMER_METRICS,
  INITIAL_INVOICE_SCHEDULE,
  MOCK_CUSTOMERS,
  LEGAL_ENTITIES,
  INITIAL_BILLING_ENTITIES,
} from './data/mockBillingData';
import {
  InvoiceRecord,
  BillingMetrics,
  PaymentGateway,
  InvoiceScheduleSettings,
  BillingEntity,
} from './types/billing';

export default function App() {
  // Default to Customer role per request ("khi màn hình customer thì như này, build cho tôi")
  const [userRole, setUserRole] = useState<'customer' | 'admin'>('customer');
  const [currentView, setCurrentView] = useState<'billing' | 'export-invoice' | 'setting' | 'billing-entity'>('billing');
  const [settingTab, setSettingTab] = useState<'general' | 'invoice-setting'>('invoice-setting');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Metrics
  const [adminMetrics, setAdminMetrics] = useState<BillingMetrics>(INITIAL_METRICS);
  const [walletBalance, setWalletBalance] = useState<number>(CUSTOMER_METRICS.walletBalance);
  const [unpaidAmount, setUnpaidAmount] = useState<number>(CUSTOMER_METRICS.unpaid);
  const [autoRecharge, setAutoRecharge] = useState<boolean>(CUSTOMER_METRICS.autoRecharge);

  // Invoices
  const [customerInvoices, setCustomerInvoices] = useState<InvoiceRecord[]>(CUSTOMER_INVOICES);
  const [adminInvoices, setAdminInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);

  // Billing Entities State (Master data managed by Admin)
  const [billingEntities, setBillingEntities] = useState<BillingEntity[]>(INITIAL_BILLING_ENTITIES);

  // Invoice Schedule Settings
  const [scheduleSettings, setScheduleSettings] = useState<InvoiceScheduleSettings>(
    INITIAL_INVOICE_SCHEDULE
  );

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [isCreationModePreview, setIsCreationModePreview] = useState(false);
  const [orderListInvoice, setOrderListInvoice] = useState<InvoiceRecord | null>(null);
  const [isSentPaymentOpen, setIsSentPaymentOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate / Export invoice handler
  const handleGenerateInvoice = () => {
    if (!previewInvoice) return;

    if (userRole === 'customer') {
      setCustomerInvoices((prev) => [previewInvoice, ...prev]);
    } else {
      setAdminInvoices((prev) => [previewInvoice, ...prev]);
      setAdminMetrics((prev) => ({
        ...prev,
        paid: prev.paid + previewInvoice.amount,
      }));
    }

    addToast(
      'Invoice Exported',
      `Invoice ${previewInvoice.id} generated successfully for $${previewInvoice.amount.toFixed(2)} USD.`
    );

    setPreviewInvoice(null);
    setCurrentView('billing');
  };

  // Export summary CSV handler
  const handleExportSummary = () => {
    const activeInvoices = userRole === 'customer' ? customerInvoices : adminInvoices;
    const headers = ['Invoice ID', 'Amount (USD)', 'Payment gateway', 'Date', 'Customer', 'Status'];
    const rows = activeInvoices.map((inv) => [
      inv.id,
      inv.amount.toFixed(2),
      inv.paymentGateway,
      `"${inv.date}"`,
      inv.customerEmail,
      inv.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fastway_Billing_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Export Completed', 'Billing ledger summary exported to CSV format.', 'info');
  };

  // Top Up / Send payment handler
  const handlePayment = (amount: number, gateway: PaymentGateway, notes: string) => {
    if (userRole === 'customer') {
      setWalletBalance((prev) => prev + amount);
      addToast(
        'Wallet Top-Up Completed',
        `$${amount.toFixed(2)} has been added to your Fastway Wallet balance.`
      );
    } else {
      setAdminMetrics((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - amount),
        sent: prev.sent + amount,
      }));
      addToast(
        'Payment Dispatched',
        `$${amount.toFixed(2)} sent via ${gateway}. Memo: ${notes || 'Carrier settlement'}`
      );
    }
  };

  // Save Schedule Handler
  const handleSaveSchedule = (newSettings: InvoiceScheduleSettings) => {
    setScheduleSettings(newSettings);
    addToast(
      'Invoice Schedule Updated',
      `Frequency set to ${newSettings.frequency}. Next invoice cycle: ${newSettings.nextInvoiceDate}.`
    );
  };

  // Billing Entity Management Handlers (Admin)
  const handleAddEntity = (newEntity: BillingEntity) => {
    setBillingEntities((prev) => {
      let updated = [...prev];
      if (newEntity.isDefault) {
        updated = updated.map((e) => ({ ...e, isDefault: false }));
      }
      return [newEntity, ...updated];
    });
    addToast(
      'Entity Created',
      `Billing entity ${newEntity.code} - ${newEntity.legalName} has been created successfully.`
    );
  };

  const handleUpdateEntity = (updatedEntity: BillingEntity) => {
    setBillingEntities((prev) =>
      prev.map((e) => {
        if (e.id === updatedEntity.id) {
          return updatedEntity;
        }
        if (updatedEntity.isDefault) {
          return { ...e, isDefault: false };
        }
        return e;
      })
    );
    addToast(
      'Entity Updated',
      `Information for ${updatedEntity.code} saved successfully.`
    );
  };

  const handleToggleEntityStatus = (entityId: string, newStatus: 'Active' | 'Inactive') => {
    setBillingEntities((prev) =>
      prev.map((e) => (e.id === entityId ? { ...e, status: newStatus } : e))
    );
    addToast(
      'Status Updated',
      `Billing entity status updated to ${newStatus}.`,
      newStatus === 'Active' ? 'success' : 'info'
    );
  };

  const handleSetDefaultEntity = (entityId: string) => {
    setBillingEntities((prev) =>
      prev.map((e) => ({
        ...e,
        isDefault: e.id === entityId,
      }))
    );
    const ent = billingEntities.find((e) => e.id === entityId);
    addToast(
      'Default Entity Set',
      `Set ${ent?.code || 'entity'} as the default commercial invoice issuer.`,
      'success'
    );
  };

  const handleReassignCustomers = (fromEntityId: string, toEntityId: string) => {
    setBillingEntities((prev) => {
      const fromEnt = prev.find((e) => e.id === fromEntityId);
      const toEnt = prev.find((e) => e.id === toEntityId);
      if (!fromEnt || !toEnt) return prev;

      const customersToMove = fromEnt.mappedCustomers || [];
      const movedCount = fromEnt.customerCount || 0;

      return prev.map((e) => {
        if (e.id === fromEntityId) {
          return {
            ...e,
            customerCount: 0,
            mappedCustomers: [],
          };
        }
        if (e.id === toEntityId) {
          return {
            ...e,
            customerCount: (e.customerCount || 0) + movedCount,
            mappedCustomers: [...(e.mappedCustomers || []), ...customersToMove],
          };
        }
        return e;
      });
    });
    addToast(
      'Customers Reassigned',
      `All assigned customers were successfully transferred to the target entity.`,
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        settingTab={settingTab}
        userRole={userRole}
        onNavigate={(view, subTab) => {
          setCurrentView(view);
          if (subTab) setSettingTab(subTab);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Top Header Bar */}
      <TopNav
        isSidebarCollapsed={isSidebarCollapsed}
        userRole={userRole}
        onSwitchRole={(role) => {
          setUserRole(role);
          setCurrentView('billing');
          addToast(
            `Switched to ${role === 'customer' ? 'Customer Portal' : 'Admin Operations'}`,
            `Viewing Fastway interface as ${role === 'customer' ? 'Customer' : 'Super Admin'}.`,
            'info'
          );
        }}
        walletBalance={walletBalance}
        unpaidAmount={unpaidAmount}
        onNavigateToSettings={() => {
          setCurrentView('setting');
          setSettingTab('invoice-setting');
        }}
        onNavigateToBillingEntity={() => setCurrentView('billing-entity')}
      />

      {/* Main Content Area */}
      <main
        className={`pt-20 px-4 sm:px-6 md:px-8 pb-12 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-[72px]' : 'ml-60'
        }`}
      >
        {/* Billing Entity Manager (Admin) */}
        {currentView === 'billing-entity' && (
          <BillingEntityManager
            entities={billingEntities}
            onAddEntity={handleAddEntity}
            onUpdateEntity={handleUpdateEntity}
            onToggleStatus={handleToggleEntityStatus}
            onSetDefault={handleSetDefaultEntity}
            onReassignCustomers={handleReassignCustomers}
            onNavigateToInvoice={() => setCurrentView('billing')}
          />
        )}

        {/* Customer Setting View */}
        {currentView === 'setting' && (
          <CustomerSettingView
            scheduleSettings={scheduleSettings}
            activeTab={settingTab}
            onTabChange={setSettingTab}
            onSaveSchedule={handleSaveSchedule}
            onNavigateToBilling={() => setCurrentView('billing')}
          />
        )}

        {/* Customer Billing View */}
        {currentView === 'billing' && userRole === 'customer' && (
          <CustomerBillingView
            invoices={customerInvoices}
            scheduleSettings={scheduleSettings}
            walletBalance={walletBalance}
            unpaidAmount={unpaidAmount}
            autoRecharge={autoRecharge}
            onToggleAutoRecharge={(val) => {
              setAutoRecharge(val);
              addToast(
                val ? 'Auto Re-charge Enabled' : 'Auto Re-charge Disabled',
                val
                  ? 'Your wallet will automatically replenish when funds run low.'
                  : 'Automatic top-ups have been paused.',
                'info'
              );
            }}
            onOpenTopUp={() => setIsSentPaymentOpen(true)}
            onOpenInvoicePreview={(inv) => {
              setPreviewInvoice(inv);
              setIsCreationModePreview(false);
            }}
            onOpenOrderList={(inv) => setOrderListInvoice(inv)}
            onNavigateToSettings={() => {
              setCurrentView('setting');
              setSettingTab('invoice-setting');
            }}
          />
        )}

        {/* Admin Billing Dashboard */}
        {currentView === 'billing' && userRole === 'admin' && (
          <BillingDashboard
            metrics={adminMetrics}
            invoices={adminInvoices}
            onNavigateCreateInvoice={() => setCurrentView('export-invoice')}
            onOpenInvoicePreview={(inv) => {
              setPreviewInvoice(inv);
              setIsCreationModePreview(false);
            }}
            onOpenOrderList={(inv) => setOrderListInvoice(inv)}
            onOpenSentPayment={() => setIsSentPaymentOpen(true)}
            onExportSummary={handleExportSummary}
            onNavigateToBillingEntity={() => setCurrentView('billing-entity')}
          />
        )}

        {/* Export Invoice View (Admin / Operations) */}
        {currentView === 'export-invoice' && (
          <CreateInvoiceView
            onBackToBilling={() => setCurrentView('billing')}
            onPreviewGeneratedInvoice={(draftInvoice) => {
              setPreviewInvoice(draftInvoice);
              setIsCreationModePreview(true);
            }}
            billingEntities={billingEntities}
          />
        )}
      </main>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          customer={previewInvoice.customer || MOCK_CUSTOMERS[0]}
          legalEntity={previewInvoice.legalEntity || LEGAL_ENTITIES[0]}
          isCreationMode={isCreationModePreview}
          onClose={() => setPreviewInvoice(null)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {/* Order List Breakdown Modal */}
      {orderListInvoice && (
        <OrderListModal
          invoice={orderListInvoice}
          onClose={() => setOrderListInvoice(null)}
          onOpenInvoicePreview={() => {
            const inv = orderListInvoice;
            setOrderListInvoice(null);
            setPreviewInvoice(inv);
            setIsCreationModePreview(false);
          }}
        />
      )}

      {/* Top Up / Sent Payment Modal */}
      {isSentPaymentOpen && (
        <SentPaymentModal
          currentBalance={userRole === 'customer' ? walletBalance : adminMetrics.balance}
          onClose={() => setIsSentPaymentOpen(false)}
          onSubmitPayment={handlePayment}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
