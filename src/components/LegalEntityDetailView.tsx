import React, { useState, useMemo } from 'react';
import {
  Building2,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Star,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Plus,
  Globe,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react';
import { BillingEntity, MappedCustomer } from '../types/billing';
import { MOCK_CUSTOMERS } from '../data/mockBillingData';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'US', name: 'USA', flag: '🇺🇸', currency: 'USD' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
];

interface LegalEntityDetailViewProps {
  entityId: string;
  entities: BillingEntity[];
  initialMode?: 'view' | 'edit';
  onBack: () => void;
  onUpdateEntity: (updatedEntity: BillingEntity) => void;
  onToggleStatus: (entityId: string, newStatus: 'Active' | 'Inactive') => void;
  onSetDefault: (entityId: string) => void;
  onReassignCustomers?: (fromEntityId: string, toEntityId: string) => void;
}

export const LegalEntityDetailView: React.FC<LegalEntityDetailViewProps> = ({
  entityId,
  entities,
  initialMode = 'view',
  onBack,
  onUpdateEntity,
  onToggleStatus,
  onSetDefault,
  onReassignCustomers,
}) => {
  const entity = entities.find((e) => e.id === entityId) || entities[0];

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Status toggle confirmation modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  // Form State for editing
  const [formData, setFormData] = useState({
    code: entity?.code || '',
    legalName: entity?.legalName || '',
    taxId: entity?.taxId || '',
    country: entity?.country || 'USA',
    countryCode: entity?.countryCode || 'US',
    address: entity?.address || '',
    contactEmail: entity?.contactEmail || '',
    contactPhone: entity?.contactPhone || '',
    bankName: entity?.bankName || '',
    accountNumber: entity?.accountNumber || '',
    swiftBic: entity?.swiftBic || '',
    bankAddress: entity?.bankAddress || '',
    status: entity?.status || 'Active',
    isDefault: entity?.isDefault || false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [assignedCustomerIds, setAssignedCustomerIds] = useState<string[]>(
    entity?.mappedCustomers?.map((c) => c.id) || []
  );

  // Synchronize when entity changes
  React.useEffect(() => {
    if (entity) {
      setFormData({
        code: entity.code,
        legalName: entity.legalName,
        taxId: entity.taxId,
        country: entity.country,
        countryCode: entity.countryCode || 'US',
        address: entity.address,
        contactEmail: entity.contactEmail || '',
        contactPhone: entity.contactPhone || '',
        bankName: entity.bankName,
        accountNumber: entity.accountNumber,
        swiftBic: entity.swiftBic,
        bankAddress: entity.bankAddress,
        status: entity.status,
        isDefault: entity.isDefault || false,
      });
      setAssignedCustomerIds(entity.mappedCustomers?.map((c) => c.id) || []);
    }
  }, [entity]);

  // Customers eligible for assignment:
  // ONLY unassigned customers or customers that already belong to this entity.
  // Prohibit customers already mapped to any other legal entity.
  const eligibleCustomers = useMemo(() => {
    if (!entity) return [];
    return MOCK_CUSTOMERS.filter((cust) => {
      const otherEntity = entities.find(
        (e) =>
          e.id !== entity.id &&
          e.mappedCustomers?.some(
            (mc) => mc.id === cust.id || mc.companyName.toLowerCase() === cust.companyName.toLowerCase()
          )
      );
      return !otherEntity;
    });
  }, [entities, entity]);

  const filteredEligibleCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return eligibleCustomers;
    const q = customerSearchQuery.toLowerCase();
    return eligibleCustomers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        (c.contactName && c.contactName.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q)
    );
  }, [eligibleCustomers, customerSearchQuery]);

  // Customer search inside View mode (searching currently mapped customers)
  const mappedCustomersInView = useMemo(() => {
    const list = entity?.mappedCustomers || [];
    if (!customerSearchQuery.trim()) return list;
    const q = customerSearchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.contactName && c.contactName.toLowerCase().includes(q))
    );
  }, [entity?.mappedCustomers, customerSearchQuery]);

  const countryItem = COUNTRY_OPTIONS.find((c) => c.name === (entity?.country || formData.country));

  // Toggle selection in edit mode
  const toggleCustomerSelection = (customerId: string) => {
    setAssignedCustomerIds((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAllEligible = () => {
    const ids = filteredEligibleCustomers.map((c) => c.id);
    setAssignedCustomerIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setAssignedCustomerIds([]);
  };

  // Status toggle handler
  const handleToggleStatusSwitch = () => {
    if (entity.status === 'Active') {
      const otherActive = entities.find((e) => e.status === 'Active' && e.id !== entity.id);
      setReassignTargetId(otherActive ? otherActive.id : '');
      setShowDeactivateModal(true);
    } else {
      setShowActivateModal(true);
    }
  };

  const confirmDeactivation = () => {
    if (entity.customerCount > 0 && reassignTargetId && onReassignCustomers) {
      onReassignCustomers(entity.id, reassignTargetId);
    }
    onToggleStatus(entity.id, 'Inactive');
    setShowDeactivateModal(false);
  };

  const confirmActivation = () => {
    onToggleStatus(entity.id, 'Active');
    setShowActivateModal(false);
  };

  // Form Validation & Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) errors.code = 'Entity Code is required.';
    if (!formData.legalName.trim()) errors.legalName = 'Legal Entity Name is required.';
    if (!formData.taxId.trim()) errors.taxId = 'Tax ID / EIN is required.';
    if (!formData.address.trim()) errors.address = 'Registered address is required.';
    if (!formData.bankName.trim()) errors.bankName = 'Settlement bank name is required.';
    if (!formData.accountNumber.trim()) errors.accountNumber = 'Account number is required.';
    if (!formData.swiftBic.trim()) errors.swiftBic = 'SWIFT / BIC code is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const matchedCountry = COUNTRY_OPTIONS.find((c) => c.name === formData.country);

    // Map selected customer IDs to MappedCustomer objects
    const updatedMappedCustomers: MappedCustomer[] = assignedCustomerIds.map((id) => {
      const existing = entity.mappedCustomers?.find((c) => c.id === id);
      if (existing) return existing;
      const custData = MOCK_CUSTOMERS.find((c) => c.id === id);
      return {
        id,
        companyName: custData?.companyName || id,
        email: custData?.email || '',
        contactName: custData?.contactName || '',
        assignedDate: new Date().toISOString().slice(0, 10),
      };
    });

    const updated: BillingEntity = {
      ...entity,
      code: formData.code.toUpperCase().trim(),
      legalName: formData.legalName.trim(),
      taxId: formData.taxId.trim(),
      country: formData.country,
      countryCode: matchedCountry ? matchedCountry.code : entity.countryCode || 'US',
      address: formData.address.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber.trim(),
      swiftBic: formData.swiftBic.trim(),
      bankAddress: formData.bankAddress.trim(),
      status: formData.status,
      isDefault: formData.isDefault,
      customerCount: updatedMappedCustomers.length,
      mappedCustomers: updatedMappedCustomers,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onUpdateEntity(updated);
    setMode('view');
  };

  const handleCancelEdit = () => {
    // Revert form data
    setFormData({
      code: entity.code,
      legalName: entity.legalName,
      taxId: entity.taxId,
      country: entity.country,
      countryCode: entity.countryCode || 'US',
      address: entity.address,
      contactEmail: entity.contactEmail || '',
      contactPhone: entity.contactPhone || '',
      bankName: entity.bankName,
      accountNumber: entity.accountNumber,
      swiftBic: entity.swiftBic,
      bankAddress: entity.bankAddress,
      status: entity.status,
      isDefault: entity.isDefault || false,
    });
    setAssignedCustomerIds(entity.mappedCustomers?.map((c) => c.id) || []);
    setFormErrors({});
    setMode('view');
  };

  if (!entity) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center space-y-4">
        <h2 className="text-[18px] font-bold text-[#0b1c30]">Legal Entity Not Found</h2>
        <p className="text-[13px] text-[#727785]">The requested legal entity could not be found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#0058c3] text-white text-[13px] font-semibold rounded-lg hover:bg-[#004bb0]"
        >
          Back to Legal Entity Management
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2 text-[12px] text-[#727785]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[#0058c3] hover:underline font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Legal Entity Management</span>
          </button>
          <span>/</span>
          <span className="text-[#727785]">Setting</span>
          <span>/</span>
          <span className="text-[#0b1c30] font-semibold">{entity.code} Details</span>
        </div>

        {/* Mode & Action Controls */}
        <div className="flex items-center gap-2.5">
          {mode === 'view' ? (
            <>
              {!entity.isDefault && entity.status === 'Active' && (
                <button
                  type="button"
                  onClick={() => onSetDefault(entity.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Set as Default</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMode('edit')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Legal Entity</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#424754] bg-white border border-[#c2c6d6] hover:bg-[#f8f9ff] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0058c3] text-white flex items-center justify-center font-bold text-[20px] shadow-sm shrink-0 tracking-tight">
              {entity.code}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[22px] font-bold text-[#0b1c30] tracking-tight">
                  {entity.legalName}
                </h1>
                {entity.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Default Issuer
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#eff4ff] text-[#0058c3] border border-[#0058c3]/20">
                  {entity.code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#727785] mt-1.5">
                <div className="flex items-center gap-1">
                  <span>Country:</span>
                  <span className="font-semibold text-[#0b1c30]">{countryItem?.flag} {entity.country}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>Tax ID (EIN/VAT):</span>
                  <span className="font-mono font-semibold text-[#0b1c30]">{entity.taxId}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>Settlement Bank:</span>
                  <span className="font-semibold text-[#0b1c30]">{entity.bankName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Switch Widget */}
          <div className="flex items-center gap-3.5 bg-[#f8f9ff] px-4 py-3 rounded-xl border border-[#e2e8f0] self-start lg:self-center">
            <div className="text-left">
              <span className="block text-[11px] text-[#727785] font-medium">Issuer Status</span>
              <span className={`text-[13px] font-bold ${entity.status === 'Active' ? 'text-emerald-700' : 'text-gray-500'}`}>
                {entity.status === 'Active' ? 'Active for Invoicing' : 'Deactivated'}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={entity.status === 'Active'}
              onClick={handleToggleStatusSwitch}
              title={`Click to ${entity.status === 'Active' ? 'deactivate' : 'activate'} this legal entity`}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0058c3] ${
                entity.status === 'Active' ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  entity.status === 'Active' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Financial & Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e2e8f0]">
          <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
              <span>Assigned Customers</span>
              <Users className="w-4 h-4 text-[#0058c3]" />
            </div>
            <div className="text-[22px] font-bold text-[#0058c3] mt-1">
              {entity.customerCount || (entity.mappedCustomers?.length || 0)}
            </div>
            <div className="text-[11px] text-[#727785] mt-0.5">Commercial customers mapped</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
              <span>Commercial Invoices Issued</span>
              <FileText className="w-4 h-4 text-[#0b1c30]" />
            </div>
            <div className="text-[22px] font-bold text-[#0b1c30] mt-1">
              {(entity.invoicesIssuedCount || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#727785] mt-0.5">Weekly settled cycles</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
              <span>Total Invoiced Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[22px] font-bold text-emerald-700 mt-1">
              ${(entity.totalInvoicedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Audited commercial volume</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
              <span>Registration & Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[15px] font-bold text-[#0b1c30] mt-2">
              Valid & Audit Ready
            </div>
            <div className="text-[11px] text-[#727785] mt-0.5">Compliant for tax export</div>
          </div>
        </div>
      </div>

      {/* Mode Switch: View Screen vs Edit Screen */}
      {mode === 'view' ? (
        /* ======================== VIEW SCREEN ======================== */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Corporate Legal Information */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <h3 className="text-[15px] font-bold text-[#0b1c30] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0058c3]" />
                  <span>1. Corporate Legal Information</span>
                </h3>
                <span className="text-[11px] text-[#727785] font-mono">
                  ID: {entity.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[13px]">
                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Legal Name</span>
                  <span className="font-semibold text-[#0b1c30]">{entity.legalName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Entity Code</span>
                  <span className="font-mono font-bold text-[#0058c3]">{entity.code}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Tax ID / EIN / VAT</span>
                  <span className="font-mono font-semibold text-[#0b1c30]">{entity.taxId}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Country / Jurisdiction</span>
                  <span className="font-semibold text-[#0b1c30]">{countryItem?.flag} {entity.country} ({entity.countryCode})</span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Registered Business Address</span>
                  <span className="font-medium text-[#0b1c30] leading-relaxed">{entity.address}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Contact Email</span>
                  <span className="font-mono text-[#0058c3]">{entity.contactEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Contact Phone</span>
                  <span className="font-mono text-[#0b1c30]">{entity.contactPhone || 'N/A'}</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11.5px] text-[#727785]">
                  <span>Created: <span className="font-mono font-medium text-[#0b1c30]">{entity.createdAt || '2024-01-01'}</span></span>
                  <span>Last Updated: <span className="font-mono font-medium text-[#0b1c30]">{entity.updatedAt || 'Today'}</span></span>
                </div>
              </div>
            </div>

            {/* Section 2: Settlement Bank Account Information */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <h3 className="text-[15px] font-bold text-[#0b1c30] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0058c3]" />
                  <span>2. Settlement Bank Account Information</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Settlement Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[13px]">
                <div className="col-span-2">
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Beneficiary Bank Name</span>
                  <span className="font-bold text-[#0b1c30]">{entity.bankName}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Account Number / IBAN</span>
                  <span className="font-mono font-bold text-[#0058c3] tracking-wide">{entity.accountNumber}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">SWIFT / BIC Code</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{entity.swiftBic}</span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[11px] text-[#727785] uppercase tracking-wider font-medium">Bank Branch Address</span>
                  <span className="font-medium text-[#0b1c30] leading-relaxed">{entity.bankAddress}</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-[#f1f5f9] flex items-center gap-2 text-[11px] text-[#727785]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>These banking details will automatically print on all commercial invoices issued by this entity.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Assignment Directory */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-[15px] font-bold text-[#0b1c30] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0058c3]" />
                  <span>3. Customer Assignment Directory</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#0058c3]">
                    {entity.mappedCustomers?.length || 0} Customers
                  </span>
                </h3>
                <p className="text-[12px] text-[#727785] mt-0.5">
                  Customers mapped to this legal entity as their default commercial invoice issuer.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#727785] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search assigned customers..."
                    className="w-64 pl-9 pr-8 py-1.5 text-[12px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                  {customerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#0b1c30]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#0058c3] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage / Assign Customers</span>
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#f8f9ff] text-[#424754] uppercase font-semibold text-[11px] border-b border-[#e2e8f0]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Customer Company</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Date</th>
                    <th className="py-3 px-4 text-right">Invoicing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {mappedCustomersInView.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[13px] text-[#727785]">
                        {customerSearchQuery
                          ? 'No customers matched your search query.'
                          : 'No customers are currently assigned to this legal entity.'}
                      </td>
                    </tr>
                  ) : (
                    mappedCustomersInView.map((cust, idx) => (
                      <tr key={cust.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#727785]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#0b1c30]">{cust.companyName}</span>
                          {cust.contactName && (
                            <span className="block text-[11px] text-[#727785] mt-0.5">
                              {cust.contactName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#0058c3]">
                          {cust.email}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#727785]">
                          {cust.assignedDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between text-[12px] text-[#727785]">
              <span>Showing <strong className="text-[#0b1c30]">{mappedCustomersInView.length}</strong> of <strong className="text-[#0b1c30]">{entity.mappedCustomers?.length || 0}</strong> assigned customers</span>
              <span>All invoices for these customers will be issued by <strong className="font-mono text-[#0058c3]">{entity.code}</strong></span>
            </div>
          </div>
        </div>
      ) : (
        /* ======================== EDIT SCREEN ======================== */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#0058c3]" />
                  <span>Edit Legal Entity: {entity.code}</span>
                </h3>
                <p className="text-[12px] text-[#727785] mt-0.5">
                  Update corporate identification, banking settlement information, and customer assignment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-[#424754] bg-white border border-[#c2c6d6] hover:bg-[#f8f9ff] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Section 1: Corporate Legal Information */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>1. Corporate Legal Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Entity Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FW-US, FW-VN"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-mono font-bold uppercase bg-white"
                  />
                  {formErrors.code && <p className="text-red-500 text-[11px] mt-1">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="e.g. FASTWAY LOGISTICS FULFILLMENT LLC"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-semibold bg-white"
                  />
                  {formErrors.legalName && <p className="text-red-500 text-[11px] mt-1">{formErrors.legalName}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Tax ID (EIN / VAT / Mã số thuế) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g. 84-2910391 or 0315998123"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-mono bg-white"
                  />
                  {formErrors.taxId && <p className="text-red-500 text-[11px] mt-1">{formErrors.taxId}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Country / Jurisdiction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const matched = COUNTRY_OPTIONS.find((c) => c.name === e.target.value);
                      setFormData({
                        ...formData,
                        country: e.target.value,
                        countryCode: matched ? matched.code : 'US',
                      });
                    }}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Registered Business Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 25722 Kingsland Blvd, Ste 103F, Katy, TX 77494, USA"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                  {formErrors.address && <p className="text-red-500 text-[11px] mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="billing@fastway.com"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (832) 412-8890"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Settlement Bank Account Information */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-4">
              <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>2. Settlement Bank Account Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Beneficiary Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. BANK OF AMERICA, N.A."
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-semibold bg-white"
                  />
                  {formErrors.bankName && <p className="text-red-500 text-[11px] mt-1">{formErrors.bankName}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Account Number / IBAN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 98432104523"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-mono bg-white"
                  />
                  {formErrors.accountNumber && <p className="text-red-500 text-[11px] mt-1">{formErrors.accountNumber}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    SWIFT / BIC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.swiftBic}
                    onChange={(e) => setFormData({ ...formData, swiftBic: e.target.value.toUpperCase() })}
                    placeholder="e.g. BOFAUS3N"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] font-mono uppercase bg-white"
                  />
                  {formErrors.swiftBic && <p className="text-red-500 text-[11px] mt-1">{formErrors.swiftBic}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                    Bank Branch Address
                  </label>
                  <input
                    type="text"
                    value={formData.bankAddress}
                    onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                    placeholder="e.g. 100 N Tryon St, Charlotte, NC 28255, USA"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Customer Assignment */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>3. Customer Assignment</span>
                  </h4>
                  <p className="text-[12px] text-[#727785] mt-0.5">
                    Select unassigned customers or manage current customers for this legal entity. Customers assigned to other entities are excluded.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#0058c3] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#0058c3]/20">
                  Assigned: {assignedCustomerIds.length} customers
                </span>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#727785] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full pl-9 pr-8 py-1.5 text-[12px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3] bg-white"
                  />
                  {customerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#0b1c30]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11.5px] shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSelectAllEligible}
                    className="text-[#0058c3] hover:underline font-medium cursor-pointer"
                  >
                    Select all ({filteredEligibleCustomers.length})
                  </button>
                  <span className="text-[#c2c6d6]">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[#727785] hover:text-red-600 font-medium cursor-pointer"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              {/* Customer Table */}
              <div className="border border-[#c2c6d6] rounded-xl max-h-72 overflow-y-auto divide-y divide-[#f1f5f9] bg-white shadow-2xs">
                {filteredEligibleCustomers.length === 0 ? (
                  <div className="py-8 text-center text-[12.5px] text-[#727785]">
                    No eligible customers found.
                  </div>
                ) : (
                  filteredEligibleCustomers.map((cust) => {
                    const isSelected = assignedCustomerIds.includes(cust.id);
                    return (
                      <div
                        key={cust.id}
                        onClick={() => toggleCustomerSelection(cust.id)}
                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#eff4ff]/60 hover:bg-[#eff4ff]/90' : 'hover:bg-[#f8f9ff]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#0058c3] border-[#c2c6d6] focus:ring-[#0058c3] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-[#0b1c30] truncate">
                                {cust.companyName}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#727785] font-mono truncate mt-0.5">
                              {cust.email}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isSelected ? 'Selected' : 'Unassigned'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Section 4: Status & Default Configuration */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-4">
              <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Status & Default Configuration</span>
              </h4>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editDefaultCheckbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#0058c3] rounded border-[#c2c6d6] focus:ring-[#0058c3]"
                  />
                  <label htmlFor="editDefaultCheckbox" className="text-[13px] font-medium text-[#0b1c30] cursor-pointer">
                    <span className="font-semibold">Set as default legal entity</span>
                    <span className="block text-[11px] text-[#727785]">
                      Automatically apply this legal entity when issuing invoices if the customer has no specific entity assigned.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-semibold text-[#0b1c30]">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-2.5 py-1 text-[12px] font-semibold rounded-md border border-[#c2c6d6] bg-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] rounded-lg transition-colors border border-[#c2c6d6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-[13px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* DEACTIVATE LEGAL ENTITY MODAL */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1c30]">
                  Deactive Legal Entity
                </h3>
                <p className="text-[13px] text-[#727785] mt-1 leading-relaxed">
                  Entity <span className="font-bold text-[#0b1c30]">{entity.code} - {entity.legalName}</span>
                  {entity.customerCount > 0 ? (
                    <> is currently assigned to <span className="font-bold text-red-600">{entity.customerCount} customers</span>.</>
                  ) : (
                    <> currently has no assigned customers.</>
                  )}
                </p>
              </div>
            </div>

            {entity.customerCount > 0 ? (
              <>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 leading-relaxed">
                  <strong>Notice:</strong> Once deactivated, this entity cannot issue automated invoices. Please reassign these customers to an active legal entity before deactivating.
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-2">
                  <label className="block text-[12px] font-semibold text-[#0b1c30]">
                    Reassign these {entity.customerCount} customers to another active entity:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full py-2 px-3 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3]"
                  >
                    {entities
                      .filter((e) => e.status === 'Active' && e.id !== entity.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.code} - {e.legalName} ({e.country}) {e.isDefault ? '★ Default' : ''}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateModal(false)}
                    className="px-4 py-2 text-[12px] font-medium text-[#424754] hover:bg-[#f8f9ff] rounded-lg border border-[#c2c6d6] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmDeactivation}
                    disabled={!reassignTargetId}
                    className="px-4 py-2 text-[12px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Reassign & Deactivate
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-700 leading-relaxed">
                  Are you sure you want to deactivate this legal entity? Once deactivated, it cannot be used for commercial invoice issuance until reactivated.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateModal(false)}
                    className="px-4 py-2 text-[12px] font-medium text-[#424754] hover:bg-[#f8f9ff] rounded-lg border border-[#c2c6d6] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmDeactivation}
                    className="px-4 py-2 text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Deactivate Legal Entity
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ACTIVATE LEGAL ENTITY MODAL */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1c30]">
                  Activate Legal Entity
                </h3>
                <p className="text-[13px] text-[#727785] mt-1 leading-relaxed">
                  Are you sure you want to activate legal entity <span className="font-bold text-[#0b1c30]">{entity.code} - {entity.legalName}</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-900 leading-relaxed">
              Once activated, this legal entity will be available to issue commercial invoices and can be assigned to customers.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowActivateModal(false)}
                className="px-4 py-2 text-[12px] font-medium text-[#424754] hover:bg-[#f8f9ff] rounded-lg border border-[#c2c6d6] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmActivation}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs cursor-pointer"
              >
                Activate Legal Entity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
