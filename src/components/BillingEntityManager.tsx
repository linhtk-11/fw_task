import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit2,
  Users,
  CreditCard,
  Star,
  X,
  ShieldCheck,
  Check,
  Download,
  Mail,
  Calendar,
} from 'lucide-react';
import { BillingEntity, MappedCustomer } from '../types/billing';
import { MOCK_CUSTOMERS } from '../data/mockBillingData';

interface BillingEntityManagerProps {
  entities: BillingEntity[];
  onAddEntity: (newEntity: BillingEntity) => void;
  onUpdateEntity: (updatedEntity: BillingEntity) => void;
  onToggleStatus: (entityId: string, newStatus: 'Active' | 'Inactive') => void;
  onSetDefault: (entityId: string) => void;
  onReassignCustomers?: (fromEntityId: string, toEntityId: string) => void;
  onNavigateToInvoice: () => void;
}

const COUNTRY_OPTIONS = [
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export const BillingEntityManager: React.FC<BillingEntityManagerProps> = ({
  entities,
  onAddEntity,
  onUpdateEntity,
  onToggleStatus,
  onSetDefault,
  onReassignCustomers,
  onNavigateToInvoice,
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal & Drawer States
  const [detailEntity, setDetailEntity] = useState<BillingEntity | null>(null);
  const [editingEntity, setEditingEntity] = useState<BillingEntity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerMappingModalEntity, setCustomerMappingModalEntity] = useState<BillingEntity | null>(null);
  const [mappingModalSearchQuery, setMappingModalSearchQuery] = useState('');

  // Deactivation & Activation confirmation modals
  const [deactivateEntityTarget, setDeactivateEntityTarget] = useState<BillingEntity | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [activateEntityTarget, setActivateEntityTarget] = useState<BillingEntity | null>(null);

  // Form State for Create / Edit
  const initialFormState = {
    code: '',
    legalName: '',
    taxId: '',
    country: 'USA',
    countryCode: 'US',
    address: '',
    contactEmail: '',
    contactPhone: '',
    bankName: '',
    accountNumber: '',
    swiftBic: '',
    bankAddress: '',
    status: 'Active' as 'Active' | 'Inactive',
    isDefault: false,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Customer Assignment State in Create / Edit Modal
  const [assignedCustomerIds, setAssignedCustomerIds] = useState<string[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Filtered customers for assignment section
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return MOCK_CUSTOMERS;
    const q = customerSearchQuery.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customerSearchQuery]);

  const toggleCustomerSelection = (customerId: string) => {
    setAssignedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllFilteredCustomers = () => {
    const idsToAdd = filteredCustomers.map((c) => c.id);
    setAssignedCustomerIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllCustomers = () => {
    setAssignedCustomerIds([]);
  };

  // Filter Logic for Entity Table
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = entity.code.toLowerCase().includes(q);
        const matchName = entity.legalName.toLowerCase().includes(q);
        const matchTax = entity.taxId.toLowerCase().includes(q);
        const matchAddr = entity.address.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchTax && !matchAddr) return false;
      }
      // Country
      if (selectedCountry !== 'All' && entity.country !== selectedCountry) {
        return false;
      }
      // Status
      if (selectedStatus !== 'All' && entity.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [entities, searchQuery, selectedCountry, selectedStatus]);

  // Metrics
  const totalCount = entities.length;
  const activeCount = entities.filter((e) => e.status === 'Active').length;
  const inactiveCount = entities.filter((e) => e.status === 'Inactive').length;
  const totalMapped = entities.reduce((sum, e) => sum + (e.customerCount || 0), 0);
  const defaultEntity = entities.find((e) => e.isDefault) || entities[0];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedStatus('All');
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      code: '',
      legalName: '',
      taxId: '',
      country: 'USA',
      countryCode: 'US',
      address: '',
      contactEmail: 'billing@company.com',
      contactPhone: '',
      bankName: '',
      accountNumber: '',
      swiftBic: '',
      bankAddress: '',
      status: 'Active',
      isDefault: false,
    });
    setAssignedCustomerIds([]);
    setCustomerSearchQuery('');
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (entity: BillingEntity) => {
    setEditingEntity(entity);
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
      isDefault: !!entity.isDefault,
    });
    // Initialize assigned customer IDs from entity.mappedCustomers
    const existingIds = (entity.mappedCustomers || []).map((mc) => {
      const match = MOCK_CUSTOMERS.find(
        (c) => c.id === mc.id || c.companyName.toLowerCase() === mc.companyName.toLowerCase()
      );
      return match ? match.id : mc.id;
    });
    setAssignedCustomerIds(existingIds);
    setCustomerSearchQuery('');
    setFormErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = 'Entity Code is required.';
    if (!formData.legalName.trim()) errors.legalName = 'Company Legal Name is required.';
    if (!formData.taxId.trim()) errors.taxId = 'Tax ID / EIN is required.';
    if (!formData.country.trim()) errors.country = 'Registered Country is required.';
    if (!formData.address.trim()) errors.address = 'Registered Business Address is required.';

    // Check duplicate code
    const duplicate = entities.find(
      (e) =>
        e.code.toLowerCase() === formData.code.trim().toLowerCase() &&
        (!editingEntity || e.id !== editingEntity.id)
    );
    if (duplicate) {
      errors.code = `Entity Code "${formData.code}" already exists in the system.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Form (Create or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const matchedCountry = COUNTRY_OPTIONS.find((c) => c.name === formData.country);

    // Build assigned mapped customers array
    const assignedMappedCustomers: MappedCustomer[] = assignedCustomerIds.map((custId) => {
      const cust = MOCK_CUSTOMERS.find((c) => c.id === custId);
      const existing = editingEntity?.mappedCustomers?.find((m) => m.id === custId);
      return {
        id: custId,
        companyName: cust?.companyName || existing?.companyName || 'Customer',
        contactName: cust?.contactName || existing?.contactName || 'Representative',
        email: cust?.email || existing?.email || 'billing@customer.com',
        assignedDate: existing?.assignedDate || new Date().toISOString().slice(0, 10),
      };
    });

    if (editingEntity) {
      // Update
      const updated: BillingEntity = {
        ...editingEntity,
        code: formData.code.toUpperCase().trim(),
        legalName: formData.legalName.trim(),
        taxId: formData.taxId.trim(),
        country: formData.country,
        countryCode: matchedCountry ? matchedCountry.code : 'US',
        address: formData.address.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        swiftBic: formData.swiftBic.trim(),
        bankAddress: formData.bankAddress.trim(),
        status: formData.status,
        isDefault: formData.isDefault,
        customerCount: assignedMappedCustomers.length,
        mappedCustomers: assignedMappedCustomers,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      onUpdateEntity(updated);
      setEditingEntity(null);
      if (detailEntity && detailEntity.id === updated.id) {
        setDetailEntity(updated);
      }
    } else {
      // Create
      const newEntity: BillingEntity = {
        id: `ent-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        legalName: formData.legalName.trim(),
        taxId: formData.taxId.trim(),
        country: formData.country,
        countryCode: matchedCountry ? matchedCountry.code : 'US',
        address: formData.address.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        swiftBic: formData.swiftBic.trim(),
        bankAddress: formData.bankAddress.trim(),
        status: formData.status,
        isDefault: formData.isDefault,
        customerCount: assignedMappedCustomers.length,
        mappedCustomers: assignedMappedCustomers,
        invoicesIssuedCount: 0,
        totalInvoicedAmount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      onAddEntity(newEntity);
      setIsCreateModalOpen(false);
    }
  };

  // Handle status toggle switch with confirmation pop up
  const handleToggleStatusClick = (entity: BillingEntity) => {
    if (entity.status === 'Active') {
      setDeactivateEntityTarget(entity);
      const otherActive = entities.find(
        (e) => e.status === 'Active' && e.id !== entity.id
      );
      setReassignTargetId(otherActive ? otherActive.id : '');
    } else {
      setActivateEntityTarget(entity);
    }
  };

  const confirmDeactivation = () => {
    if (!deactivateEntityTarget) return;
    if (deactivateEntityTarget.customerCount > 0 && reassignTargetId && onReassignCustomers) {
      onReassignCustomers(deactivateEntityTarget.id, reassignTargetId);
    }
    onToggleStatus(deactivateEntityTarget.id, 'Inactive');
    setDeactivateEntityTarget(null);
  };

  const confirmActivation = () => {
    if (!activateEntityTarget) return;
    onToggleStatus(activateEntityTarget.id, 'Active');
    setActivateEntityTarget(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Entity Code', 'Legal Name', 'Tax ID', 'Country', 'Customers', 'Status', 'Address', 'Bank'];
    const rows = filteredEntities.map((e) => [
      `"${e.code}"`,
      `"${e.legalName}"`,
      `"${e.taxId}"`,
      `"${e.country}"`,
      e.customerCount || 0,
      e.status,
      `"${e.address.replace(/"/g, '""')}"`,
      `"${e.bankName}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fastway_Billing_Entities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[12px] text-[#727785] flex items-center gap-1.5 font-medium">
        <span
          className="hover:text-[#0b1c30] cursor-pointer transition-colors"
          onClick={onNavigateToInvoice}
        >
          Billing
        </span>
        <span>/</span>
        <span className="text-[#0058c3] font-semibold">Setting</span>
        <span>/</span>
        <span className="text-[#0b1c30] font-semibold">Legal Entity Management</span>
      </div>

      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight">
              Legal Entity Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5eeff] text-[#0058c3] border border-[#c2c6d6]/40">
              Master Data
            </span>
          </div>
          <p className="text-[13px] text-[#727785] mt-1">
            Manage legal entities authorized to issue commercial invoices and handle customer settlements across Fastway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#424754] bg-white border border-[#c2c6d6] hover:bg-[#f8f9ff] hover:text-[#0b1c30] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#727785]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Legal Entity</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
            <span>Total Entities</span>
            <Building2 className="w-4 h-4 text-[#0058c3]" />
          </div>
          <div className="text-[22px] font-bold text-[#0b1c30] mt-1.5">{totalCount}</div>
          <div className="text-[11px] text-[#727785] mt-0.5">Commercial invoice issuers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
            <span>Active Entities</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-[22px] font-bold text-emerald-700 mt-1.5">{activeCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Ready for invoice generation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
            <span>Inactive Entities</span>
            <XCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-[22px] font-bold text-gray-500 mt-1.5">{inactiveCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Suspended from new invoices</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#727785] text-[12px] font-medium">
            <span>Assigned Customers</span>
            <Users className="w-4 h-4 text-[#0058c3]" />
          </div>
          <div className="text-[22px] font-bold text-[#0058c3] mt-1.5">{totalMapped}</div>
          <div className="text-[11px] text-[#727785] mt-0.5 truncate">
            Default: {defaultEntity?.code || 'FW-US'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#727785] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal name, entity code, Tax ID (EIN / VAT)..."
              className="w-full pl-9 pr-8 py-2 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3] focus:ring-1 focus:ring-[#0058c3] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#0b1c30]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Country Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              aria-label="Filter by country"
              className="w-full py-2 px-3 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3] text-[#0b1c30]"
            >
              <option value="All">All Countries</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              aria-label="Filter by status"
              className="w-full py-2 px-3 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3] text-[#0b1c30]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="sm:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="w-full py-2 px-2.5 text-[12px] font-medium text-[#424754] hover:text-[#0b1c30] bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#c2c6d6] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entity Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#424754] text-[12px] uppercase font-semibold border-b border-[#e2e8f0] tracking-wider">
                <th className="py-3 px-4 w-28">Entity Code</th>
                <th className="py-3 px-4 min-w-[220px]">Legal Name</th>
                <th className="py-3 px-4 min-w-[130px]">Tax ID / EIN</th>
                <th className="py-3 px-4 w-36">Country</th>
                <th className="py-3 px-4 w-36">Customer</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#727785]">
                    <Building2 className="w-10 h-10 mx-auto text-[#c2c6d6] mb-2" />
                    <p className="font-medium text-[#0b1c30]">No billing entities found</p>
                    <p className="text-[12px] mt-0.5">
                      Try adjusting your search criteria or click Reset to view all records.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntities.map((entity) => {
                  const countryItem = COUNTRY_OPTIONS.find((c) => c.name === entity.country);
                  const isDefault = entity.isDefault;

                  return (
                    <tr
                      key={entity.id}
                      onClick={() => setDetailEntity(entity)}
                      className="hover:bg-[#f8f9ff] transition-colors cursor-pointer group"
                      title="Click row to view details"
                    >
                      {/* Entity Code */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#eff4ff] group-hover:bg-[#dce9ff] text-[#0058c3] transition-colors font-mono">
                          {entity.code}
                        </span>
                      </td>

                      {/* Legal Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0b1c30] group-hover:text-[#0058c3] transition-colors">
                            {entity.legalName}
                          </span>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#727785] truncate max-w-md mt-0.5">
                          {entity.address}
                        </div>
                      </td>

                      {/* Tax ID */}
                      <td className="py-3.5 px-4 font-mono text-[#0b1c30] font-medium">
                        {entity.taxId}
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#0b1c30]">
                          <span className="text-[15px]">{countryItem?.flag || '🌐'}</span>
                          <span>{entity.country}</span>
                        </div>
                      </td>

                      {/* Customer Mapping Link */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerMappingModalEntity(entity);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] hover:text-[#0058c3] transition-colors cursor-pointer"
                          title="Click to view assigned customers list"
                        >
                          <Users className="w-3.5 h-3.5 text-[#727785]" />
                          <span className="font-semibold">{entity.customerCount || 0}</span>
                          <span>Customers</span>
                        </button>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={entity.status === 'Active'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatusClick(entity);
                            }}
                            title={`Click to ${entity.status === 'Active' ? 'deactivate' : 'activate'} legal entity`}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0058c3] focus:ring-offset-1 ${
                              entity.status === 'Active' ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                entity.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[12px] font-semibold select-none ${
                              entity.status === 'Active' ? 'text-emerald-700' : 'text-gray-500'
                            }`}
                          >
                            {entity.status === 'Active' ? 'Active' : 'Deactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(entity);
                            }}
                            title="Edit legal entity"
                            className="p-1.5 rounded hover:bg-[#eff4ff] text-[#727785] hover:text-[#0058c3] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isDefault && entity.status === 'Active' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(entity.id);
                              }}
                              title="Set as default legal entity"
                              className="p-1.5 rounded hover:bg-amber-50 text-[#727785] hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="px-4 py-3 bg-[#f8f9ff] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#727785] gap-2">
          <div>
            Showing <span className="font-bold text-[#0b1c30]">{filteredEntities.length}</span> of{' '}
            <span className="font-bold text-[#0b1c30]">{entities.length}</span> legal entities
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Legal entities with historical invoice records cannot be deleted to preserve financial audit compliance.</span>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateModalOpen || editingEntity) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8f9ff]">
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1c30]">
                  {editingEntity ? 'Edit Legal Entity' : 'Create Legal Entity'}
                </h3>
                <p className="text-[12px] text-[#727785]">
                  {editingEntity
                    ? `Update corporate and settlement information for ${editingEntity.code}`
                    : 'Set up a new legal entity for commercial invoice issuance on Fastway'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingEntity(null);
                }}
                className="w-8 h-8 rounded-lg text-[#727785] hover:text-[#0b1c30] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Section 1: Corporate Legal Information */}
              <div>
                <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>1. Corporate Legal Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Entity Code */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Entity Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. FW-US, PW-VN, FW-EU"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border font-mono ${
                        formErrors.code ? 'border-red-500 bg-red-50/30' : 'border-[#c2c6d6]'
                      } focus:outline-none focus:border-[#0058c3]`}
                    />
                    {formErrors.code && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.code}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Registered Country <span className="text-red-500">*</span>
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
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Legal Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Company Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      placeholder="e.g. FASTWAY LOGISTICS FULFILLMENT LLC"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border ${
                        formErrors.legalName ? 'border-red-500 bg-red-50/30' : 'border-[#c2c6d6]'
                      } focus:outline-none focus:border-[#0058c3] font-semibold`}
                    />
                    {formErrors.legalName && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.legalName}</p>
                    )}
                  </div>

                  {/* Tax ID */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Tax ID / EIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="e.g. 84-2910391, 0108923451"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border font-mono ${
                        formErrors.taxId ? 'border-red-500 bg-red-50/30' : 'border-[#c2c6d6]'
                      } focus:outline-none focus:border-[#0058c3]`}
                    />
                    {formErrors.taxId && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.taxId}</p>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Billing / Accounting Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="billing@fastway.com"
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3]"
                    />
                  </div>

                  {/* Registered Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Registered Business Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Suite, street address, city, state, postal code, country..."
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border ${
                        formErrors.address ? 'border-red-500 bg-red-50/30' : 'border-[#c2c6d6]'
                      } focus:outline-none focus:border-[#0058c3]`}
                    />
                    {formErrors.address && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Bank Account Details */}
              <div className="pt-2 border-t border-[#e2e8f0]">
                <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>2. Settlement Bank Account Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. BANK OF AMERICA, N.A., JP MORGAN CHASE..."
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3]"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="e.g. 98432104523"
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] font-mono focus:outline-none focus:border-[#0058c3]"
                    />
                  </div>

                  {/* SWIFT / BIC */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      value={formData.swiftBic}
                      onChange={(e) => setFormData({ ...formData, swiftBic: e.target.value.toUpperCase() })}
                      placeholder="e.g. BOFAUS3N, CHASUS33"
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] font-mono focus:outline-none focus:border-[#0058c3]"
                    />
                  </div>

                  {/* Bank Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                      Bank Branch Address
                    </label>
                    <input
                      type="text"
                      value={formData.bankAddress}
                      onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                      placeholder="e.g. 100 N Tryon St, Charlotte, NC 28255, USA"
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c2c6d6] focus:outline-none focus:border-[#0058c3]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Customer Assignment */}
              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>3. Customer Assignment</span>
                    </h4>
                    <p className="text-[11.5px] text-[#727785] mt-0.5">
                      Select customers to map to this legal entity as their default commercial invoice issuer.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#0058c3] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#0058c3]/20">
                      Assigned: {assignedCustomerIds.length} customers
                    </span>
                  </div>
                </div>

                {/* Search & Bulk Select Controls */}
                <div className="space-y-2 mb-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-[#727785] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        placeholder="Search by company name, email..."
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
                        onClick={handleSelectAllFilteredCustomers}
                        className="text-[#0058c3] hover:underline font-medium cursor-pointer"
                      >
                        Select all ({filteredCustomers.length})
                      </button>
                      <span className="text-[#c2c6d6]">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllCustomers}
                        className="text-[#727785] hover:text-red-600 font-medium cursor-pointer"
                      >
                        Deselect all
                      </button>
                    </div>
                  </div>

                  {/* Customer Selection Scroll List */}
                  <div className="border border-[#c2c6d6] rounded-xl max-h-[190px] overflow-y-auto divide-y divide-[#f1f5f9] bg-white shadow-2xs">
                    {filteredCustomers.length === 0 ? (
                      <div className="py-6 text-center text-[12px] text-[#727785]">
                        No customers matched your search query.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isSelected = assignedCustomerIds.includes(cust.id);
                        const otherEntityMapping = entities.find(
                          (e) =>
                            (!editingEntity || e.id !== editingEntity.id) &&
                            e.mappedCustomers?.some(
                              (mc) => mc.id === cust.id || mc.companyName.toLowerCase() === cust.companyName.toLowerCase()
                            )
                        );

                        return (
                          <div
                            key={cust.id}
                            onClick={() => toggleCustomerSelection(cust.id)}
                            className={`p-2.5 px-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#eff4ff]/60 hover:bg-[#eff4ff]/90'
                                : 'hover:bg-[#f8f9ff]'
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
                                  <span className="text-[12.5px] font-semibold text-[#0b1c30] truncate">
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

                            <div className="text-right shrink-0">
                              {otherEntityMapping ? (
                                <span className="text-[10.5px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                  Currently: {otherEntityMapping.code}
                                </span>
                              ) : (
                                <span className="text-[10.5px] text-[#727785] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Status & Default Configuration */}
              <div className="pt-2 border-t border-[#e2e8f0]">
                <h4 className="text-[13px] font-bold text-[#0058c3] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>4. Status & Default Configuration</span>
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-[#0058c3] rounded border-[#c2c6d6] focus:ring-[#0058c3]"
                    />
                    <label htmlFor="isDefaultCheckbox" className="text-[13px] font-medium text-[#0b1c30] cursor-pointer">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingEntity(null);
                  }}
                  className="px-4 py-2 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] rounded-lg transition-colors border border-[#c2c6d6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingEntity ? 'Save Changes' : 'Create Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS DRAWER / MODAL */}
      {detailEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8f9ff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0058c3] text-white flex items-center justify-center font-bold text-[15px] shadow-xs">
                  {detailEntity.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#0b1c30]">
                      {detailEntity.legalName}
                    </h3>
                    {detailEntity.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#727785]">
                    Tax ID: <span className="font-mono font-semibold">{detailEntity.taxId}</span> • Country:{' '}
                    <span className="font-semibold">{detailEntity.country}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = detailEntity;
                    setDetailEntity(null);
                    openEditModal(toEdit);
                  }}
                  className="px-3 py-1.5 text-[12px] font-semibold text-[#0058c3] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailEntity(null)}
                  className="w-8 h-8 rounded-lg text-[#727785] hover:text-[#0b1c30] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                  <span className="text-[11px] text-[#727785] block font-medium">Assigned Customers</span>
                  <span className="text-[18px] font-bold text-[#0058c3]">{detailEntity.customerCount || 0}</span>
                  <span className="text-[11px] text-[#727785] block">Customers</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                  <span className="text-[11px] text-[#727785] block font-medium">Invoices Issued</span>
                  <span className="text-[18px] font-bold text-[#0b1c30]">
                    {(detailEntity.invoicesIssuedCount || 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#727785] block">Invoices</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                  <span className="text-[11px] text-[#727785] block font-medium">Total Invoiced Revenue</span>
                  <span className="text-[18px] font-bold text-emerald-700">
                    ${(detailEntity.totalInvoicedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-[#727785] block">USD</span>
                </div>
              </div>

              {/* Section 1: Corporate Legal Information */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-[#0b1c30] border-b border-[#e2e8f0] pb-1.5 flex items-center justify-between">
                  <span>Corporate Legal Information</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      detailEntity.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {detailEntity.status}
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-[13px]">
                  <div>
                    <span className="text-[#727785] block text-[11px]">Legal Name:</span>
                    <span className="font-semibold text-[#0b1c30]">{detailEntity.legalName}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Entity Code:</span>
                    <span className="font-mono font-bold text-[#0058c3]">{detailEntity.code}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Tax ID / EIN:</span>
                    <span className="font-mono font-semibold text-[#0b1c30]">{detailEntity.taxId}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Country:</span>
                    <span className="font-semibold text-[#0b1c30]">{detailEntity.country}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#727785] block text-[11px]">Registered Business Address:</span>
                    <span className="font-medium text-[#0b1c30]">{detailEntity.address}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Billing Email:</span>
                    <span className="font-medium font-mono text-[#0058c3]">{detailEntity.contactEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Contact Phone:</span>
                    <span className="font-medium text-[#0b1c30]">{detailEntity.contactPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Settlement Bank Account */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-[#0b1c30] border-b border-[#e2e8f0] pb-1.5">
                  Settlement Bank Account Details
                </h4>
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] grid grid-cols-2 gap-y-2 text-[13px]">
                  <div className="col-span-2">
                    <span className="text-[#727785] block text-[11px]">Bank Name:</span>
                    <span className="font-bold text-[#0b1c30]">{detailEntity.bankName || 'Not configured'}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">Account Number / IBAN:</span>
                    <span className="font-mono font-bold text-[#0058c3]">{detailEntity.accountNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#727785] block text-[11px]">SWIFT / BIC:</span>
                    <span className="font-mono font-bold text-[#0b1c30]">{detailEntity.swiftBic || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#727785] block text-[11px]">Bank Address:</span>
                    <span className="text-[#424754] text-[12px]">{detailEntity.bankAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Assigned Customers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                  <h4 className="text-[13px] font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0058c3]" />
                    <span>Assigned Customers ({detailEntity.customerCount || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailEntity;
                      setDetailEntity(null);
                      setCustomerMappingModalEntity(target);
                    }}
                    className="text-[12px] font-semibold text-[#0058c3] hover:underline cursor-pointer"
                  >
                    View all customers & manage →
                  </button>
                </div>

                <div className="divide-y divide-[#f1f5f9] border border-[#e2e8f0] rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
                  {(detailEntity.mappedCustomers && detailEntity.mappedCustomers.length > 0) ? (
                    detailEntity.mappedCustomers.map((cust) => (
                      <div key={cust.id} className="p-3 flex items-center justify-between text-[12px] hover:bg-[#f8f9ff]">
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-[#0b1c30] truncate">{cust.companyName}</div>
                          <div className="text-[11px] font-mono text-[#0058c3] truncate">{cust.email}</div>
                        </div>
                        <span className="text-[11px] text-[#727785] bg-[#f1f5f9] px-2 py-0.5 rounded font-mono shrink-0">
                          {cust.assignedDate}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[#727785] text-[12px]">
                      No customers are currently mapped to this legal entity.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-between">
              <span className="text-[11px] text-[#727785]">
                Created: {detailEntity.createdAt || '2024-01-01'} • Last Updated: {detailEntity.updatedAt || 'Today'}
              </span>
              <button
                type="button"
                onClick={() => setDetailEntity(null)}
                className="px-4 py-1.5 text-[12px] font-semibold text-[#424754] bg-white border border-[#c2c6d6] hover:bg-[#f8f9ff] rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAPPED CUSTOMERS MODAL (ALL CUSTOMERS SHOWN IN FULL) */}
      {customerMappingModalEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8f9ff]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-[#0b1c30]">
                    Assigned Customers List
                  </h3>
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#eff4ff] text-[#0058c3]">
                    {customerMappingModalEntity.code}
                  </span>
                </div>
                <p className="text-[12px] text-[#727785] mt-0.5">
                  Legal Entity: <span className="font-semibold text-[#0b1c30]">{customerMappingModalEntity.legalName}</span> ({customerMappingModalEntity.customerCount} Customers)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomerMappingModalEntity(null);
                  setMappingModalSearchQuery('');
                }}
                className="w-8 h-8 rounded-lg text-[#727785] hover:text-[#0b1c30] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Customers Bar */}
            <div className="p-4 border-b border-[#e2e8f0] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-[#727785] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mappingModalSearchQuery}
                  onChange={(e) => setMappingModalSearchQuery(e.target.value)}
                  placeholder="Search customers by company name or email..."
                  className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3]"
                />
              </div>
            </div>

            {/* Customers List Table - Showing FULL List */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f8f9ff] text-[#424754] uppercase font-semibold text-[11px] border-b border-[#e2e8f0]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Assigned Date</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {(customerMappingModalEntity.mappedCustomers || [])
                    .filter((c) => {
                      if (!mappingModalSearchQuery.trim()) return true;
                      const q = mappingModalSearchQuery.toLowerCase();
                      return (
                        c.companyName.toLowerCase().includes(q) ||
                        c.email.toLowerCase().includes(q)
                      );
                    })
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#0b1c30]">
                            {cust.companyName}
                          </div>
                          {cust.contactName && (
                            <div className="text-[11px] text-[#727785]">
                              {cust.contactName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[12px] text-[#0058c3]">
                          {cust.email}
                        </td>
                        <td className="py-3 px-3 text-[#727785] font-mono">
                          {cust.assignedDate}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {(customerMappingModalEntity.mappedCustomers || []).length === 0 && (
                <div className="p-8 text-center text-[13px] text-[#727785]">
                  No customers are currently assigned to this legal entity.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-between">
              <span className="text-[12px] text-[#727785]">
                Total: <span className="font-bold text-[#0b1c30]">{customerMappingModalEntity.customerCount || (customerMappingModalEntity.mappedCustomers || []).length}</span> customers
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomerMappingModalEntity(null);
                  setMappingModalSearchQuery('');
                }}
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#0058c3] hover:bg-[#004bb0] rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARNING MODAL: DEACTIVATING ENTITY WITH MAPPED CUSTOMERS */}
      {/* DEACTIVATE LEGAL ENTITY MODAL */}
      {deactivateEntityTarget && (
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
                  Entity <span className="font-bold text-[#0b1c30]">{deactivateEntityTarget.code} - {deactivateEntityTarget.legalName}</span>
                  {deactivateEntityTarget.customerCount > 0 ? (
                    <> is currently assigned to <span className="font-bold text-red-600">{deactivateEntityTarget.customerCount} customers</span>.</>
                  ) : (
                    <> currently has no assigned customers.</>
                  )}
                </p>
              </div>
            </div>

            {deactivateEntityTarget.customerCount > 0 ? (
              <>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 leading-relaxed">
                  <strong>Notice:</strong> Once deactivated, this entity cannot issue automated invoices. Please reassign these customers to an active legal entity before deactivating.
                </div>

                {/* Reassign Option */}
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-2">
                  <label className="block text-[12px] font-semibold text-[#0b1c30]">
                    Reassign these {deactivateEntityTarget.customerCount} customers to another active entity:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full py-2 px-3 text-[13px] bg-white border border-[#c2c6d6] rounded-lg focus:outline-none focus:border-[#0058c3]"
                  >
                    {entities
                      .filter((e) => e.status === 'Active' && e.id !== deactivateEntityTarget.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.code} - {e.legalName} ({e.country}) {e.isDefault ? '★ Default' : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeactivateEntityTarget(null)}
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

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeactivateEntityTarget(null)}
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

      {/* ACTIVATE LEGAL ENTITY CONFIRMATION MODAL */}
      {activateEntityTarget && (
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
                  Are you sure you want to activate legal entity <span className="font-bold text-[#0b1c30]">{activateEntityTarget.code} - {activateEntityTarget.legalName}</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-900 leading-relaxed">
              Once activated, this legal entity will be available to issue commercial invoices and can be assigned to customers.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActivateEntityTarget(null)}
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
