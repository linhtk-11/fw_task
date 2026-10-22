import React from 'react';
import { X, ArrowLeft, Printer, Download, Truck, Check, Receipt } from 'lucide-react';
import { InvoiceRecord, Customer, LegalEntity } from '../types/billing';

interface InvoicePreviewModalProps {
  invoice: InvoiceRecord;
  customer?: Customer;
  legalEntity?: LegalEntity;
  isCreationMode?: boolean;
  onClose: () => void;
  onGenerateInvoice?: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  customer,
  legalEntity,
  isCreationMode = false,
  onClose,
  onGenerateInvoice,
}) => {
  const activeCustomer = customer || invoice.customer;
  const activeEntity = legalEntity || invoice.legalEntity;

  // Calculate totals from orders if not explicitly set
  const orders = invoice.orders || [];
  const shippingFeeTotal =
    invoice.shippingFeeTotal ?? orders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  const relabelFeeTotal =
    invoice.relabelFeeTotal ?? orders.reduce((sum, o) => sum + (o.relabelFee || 0), 0);
  const discountTotal =
    invoice.discountTotal ?? orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const taxTotal =
    invoice.taxTotal ?? orders.reduce((sum, o) => sum + (o.tax || 0), 0);
  const overLengthFeeTotal = orders.reduce((sum, o) => sum + (o.overLengthFee || 0), 0);
  const seasonalFeeTotal =
    invoice.seasonalFeeTotal ?? orders.reduce((sum, o) => sum + (o.seasonalFee || 0), 0);
  const signatureFeeTotal =
    invoice.signatureFeeTotal ?? orders.reduce((sum, o) => sum + (o.signatureFee || 0), 0);
  const surchargeTotal =
    invoice.surchargeTotal ?? orders.reduce((sum, o) => sum + (o.surcharge || 0), 0);
  const cancelFeeTotal = orders.reduce((sum, o) => sum + (o.cancelFee || 0), 0);
  const refundTotal = orders.reduce((sum, o) => sum + (o.refund || 0), 0);

  // Markup calculation (shown in app, hidden on print per user requirement)
  const subtotal = orders.reduce((sum, o) => sum + o.total, 0);
  const markupPercent = invoice.markupPercent ?? 0;
  const markupAmount = invoice.markupAmount ?? (markupPercent > 0 ? (subtotal * markupPercent) / 100 : 0);
  const finalTotal = invoice.amount || (subtotal + markupAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-[#0b1c30]/50 backdrop-blur-[4px] animate-in fade-in duration-200"
      id="invoiceModal"
    >
      <div className="relative w-full max-w-[960px] max-h-[92vh] flex flex-col bg-white rounded-xl border border-[#c2c6d6]/40 shadow-2xl overflow-hidden">
        {/* Top Title Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e2e8f0] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0058c3]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0b1c30] leading-none">
                Invoice Preview
              </h3>
              <span className="text-[11px] text-[#727785]">
                Generated for billing reference {invoice.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#424754] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors cursor-pointer"
            title="Close Preview"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f8f9ff]/70 space-y-6">
          {/* White Paper Sheet */}
          <div
            id="printable-invoice"
            className="bg-white rounded-xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between pb-6 border-b border-[#e2e8f0] gap-6">
              <div className="space-y-1.5">
                <span className="inline-block text-[10px] font-bold tracking-widest text-[#0058c3] uppercase bg-[#eff4ff] px-2 py-0.5 rounded">
                  Official Ledger Document
                </span>
                <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
                  INVOICE
                </h1>
                <div className="pt-1 flex flex-col text-[13px] text-[#424754] space-y-0.5">
                  <div>
                    <span className="text-[#727785]">Invoice Number:</span>
                    <span className="font-semibold text-[#0b1c30] ml-1.5">
                      {invoice.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727785]">Date Created:</span>
                    <span className="font-medium text-[#0b1c30] ml-1.5">
                      {invoice.date.split(',')[0] || '20-10-2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Entity Right Side */}
              <div className="text-left sm:text-right space-y-1">
                <div className="flex items-center sm:justify-end gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-md bg-[#1e70eb] text-white flex items-center justify-center shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[20px] font-bold text-[#0058c3] tracking-tight">
                    Fastway
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-[#0b1c30]">
                  {activeEntity?.name || 'FASTWAY LOGISTICS FULFILLMENT LLC'}
                </p>
                <p className="text-[12px] text-[#424754] max-w-[280px] sm:ml-auto leading-relaxed">
                  {activeEntity?.address || '25722 Kingsland Blvd, Ste 103F, Katy, TX 77494, USA'}
                </p>
              </div>
            </div>

            {/* Bill To Card - (Type, Status, Total Invoice removed per prompt) */}
            <div className="py-4 border-b border-[#e2e8f0]">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#727785]">
                  Bill To
                </span>
                <h4 className="text-[15px] font-bold text-[#0b1c30]">
                  {activeCustomer?.companyName || 'Printway Co., Ltd'}
                </h4>
                <div className="text-[13px] text-[#424754] space-y-0.5 pt-0.5">
                  <p>
                    <span className="text-[#727785]">Email:</span>{' '}
                    <span className="text-[#0058c3] hover:underline cursor-pointer">
                      {activeCustomer?.email || 'vendor@printway.io'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Detail Table Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-bold text-[#0b1c30] uppercase tracking-wide">
                  Order Details Breakdown
                </h4>
                <span className="text-[12px] text-[#727785]">
                  {orders.length} items included
                </span>
              </div>

              <div className="border border-[#e2e8f0] rounded-lg overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-[11.5px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#eff4ff]/70 border-b border-[#e2e8f0] text-[#424754] font-semibold uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-2 text-right">Weight (gr)</th>
                      <th className="py-2.5 px-2 text-right">Shipping Fee</th>
                      <th className="py-2.5 px-2 text-right">Re-label</th>
                      <th className="py-2.5 px-2 text-right">Discount</th>
                      <th className="py-2.5 px-2 text-right">Tax</th>
                      <th className="py-2.5 px-2 text-right">Over Length</th>
                      <th className="py-2.5 px-2 text-right">Seasonal</th>
                      <th className="py-2.5 px-2 text-right">Signature</th>
                      <th className="py-2.5 px-2 text-right">Surcharge</th>
                      <th className="py-2.5 px-2 text-right">Cancel</th>
                      <th className="py-2.5 px-2 text-right">Refund</th>
                      <th className="py-2.5 px-3 text-right bg-[#dce9ff]/50 font-bold text-[#0b1c30]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]/60">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#0058c3]">
                          {order.id}
                        </td>
                        <td className="py-2.5 px-2 text-center text-[#0b1c30]">
                          {order.qty}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#424754]">
                          {order.weightGr}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#0b1c30]">
                          ${order.shippingFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#424754]">
                          ${order.relabelFee.toFixed(2)}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-right ${
                            order.discount < 0 ? 'text-emerald-600 font-medium' : 'text-[#727785]'
                          }`}
                        >
                          {order.discount < 0
                            ? `-$${Math.abs(order.discount).toFixed(2)}`
                            : `$${order.discount.toFixed(2)}`}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#424754]">
                          ${order.tax.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#727785]">
                          ${order.overLengthFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#424754]">
                          ${order.seasonalFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#727785]">
                          ${order.signatureFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#424754]">
                          ${order.surcharge.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#727785]">
                          ${order.cancelFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#727785]">
                          ${order.refund.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#0b1c30] bg-[#eff4ff]/30">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Calculation Section (No Markup per user requirement) */}
            <div className="flex justify-end pt-2">
              <div className="w-full md:w-96 bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e2e8f0]/60">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#727785]">
                    Summary Calculation
                  </span>
                  <span className="text-[11px] text-[#727785] font-medium">
                    {orders.length} Orders
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px] text-[#424754]">
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${shippingFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Re-label Fee</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${relabelFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      {discountTotal < 0
                        ? `-$${Math.abs(discountTotal).toFixed(2)}`
                        : `$${discountTotal.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Fee</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${taxTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over Length Fee</span>
                    <span className="text-[#727785]">
                      ${overLengthFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seasonal Fee</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${seasonalFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signature Fee</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${signatureFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharge</span>
                    <span className="text-[#0b1c30] font-medium">
                      ${surchargeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancel Fee</span>
                    <span className="text-[#727785]">
                      ${cancelFeeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund</span>
                    <span className="text-[#727785]">
                      ${refundTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#e2e8f0] flex justify-between items-baseline font-bold">
                    <span className="text-[14px] text-[#0b1c30]">
                      Total
                    </span>
                    <span className="text-[20px] text-[#0058c3]">
                      ${finalTotal.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Card (Moved to the bottom / end of document per user requirement) */}
            <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
              <div className="bg-[#eff4ff]/40 border border-[#e2e8f0] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e2e8f0]/60">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0b1c30]">
                    Payment Information
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                  <div>
                    <span className="text-[#727785] text-[11px] block">Currency</span>
                    <span className="font-medium text-[#0b1c30]">
                      {invoice.currency?.replace(/[()$€£]/g, '').trim() || 'USD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727785] text-[11px] block">SWIFT / BIC</span>
                    <span className="font-medium text-[#0b1c30] font-mono">
                      {activeCustomer?.swiftBic || 'CHASUS33'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727785] text-[11px] block">
                      Account Holder Name
                    </span>
                    <span className="font-medium text-[#0b1c30]">
                      {activeCustomer?.companyName
                        ? `Cty ${activeCustomer.companyName.replace(/Co\., Ltd|Inc\./i, '').trim()}`
                        : 'Cty Printway'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727785] text-[11px] block">
                      Account Number
                    </span>
                    <span className="font-semibold text-[#0b1c30] font-mono">
                      {activeCustomer?.accountNumber || '24325465655'}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-[#727785] text-[11px] block">
                      Bank or Institution Name
                    </span>
                    <span className="font-medium text-[#0b1c30]">
                      {activeCustomer?.bankName || 'JP MORGAN CHASE, N.A.'}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-[#727785] text-[11px] block">Bank Address</span>
                    <span className="text-[11px] text-[#424754] leading-tight block">
                      {activeCustomer?.bankAddress || '383 MADISON NEW YORK, NY10179'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#727785] italic">
                Invoice was created on a computer and is valid without the signature and seal
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions Sticky Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#eff4ff] text-[#424754] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isCreationMode ? 'Back to Edit' : 'Close Preview'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="h-8 px-3 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#eff4ff] text-[#424754] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print document"
              type="button"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {isCreationMode && onGenerateInvoice ? (
              <button
                onClick={onGenerateInvoice}
                className="h-8 px-4 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                type="button"
              >
                <Check className="w-4 h-4" />
                <span>Export Invoice</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="h-8 px-4 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12px] font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
