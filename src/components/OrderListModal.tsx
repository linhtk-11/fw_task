import React from 'react';
import { X, Package, CheckCircle2, DollarSign, Calendar, Truck } from 'lucide-react';
import { InvoiceRecord } from '../types/billing';

interface OrderListModalProps {
  invoice: InvoiceRecord;
  onClose: () => void;
  onOpenInvoicePreview: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({
  invoice,
  onClose,
  onOpenInvoicePreview,
}) => {
  const orders = invoice.orders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-[3px] animate-in fade-in duration-150">
      <div className="relative w-full max-w-[800px] max-h-[85vh] flex flex-col bg-white rounded-xl border border-[#e2e8f0] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0058c3]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0b1c30] leading-tight">
                Order List for {invoice.id}
              </h3>
              <p className="text-[12px] text-[#727785]">
                {invoice.customerName} • {orders.length} order{orders.length !== 1 ? 's' : ''} • Total:{' '}
                <span className="font-semibold text-[#0058c3]">${invoice.amount.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#424754] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#727785] font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3 text-right">Shipping</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f8f9ff]">
                    <td className="py-3 px-3 font-semibold text-[#0058c3]">{o.id}</td>
                    <td className="py-3 px-3 font-medium text-[#0b1c30]">{o.orderName}</td>
                    <td className="py-3 px-2 text-center">{o.qty}</td>
                    <td className="py-3 px-3 text-[#727785]">{o.paymentGateway}</td>
                    <td className="py-3 px-3 text-right">${o.shippingFee.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">${o.tax.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-[#0b1c30]">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#f8f9ff] p-4 rounded-lg border border-[#e2e8f0] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-[#727785]">
              <Calendar className="w-4 h-4" />
              <span>Paid on {invoice.date}</span>
            </div>
            <div className="flex items-center gap-2 text-[#727785]">
              <Truck className="w-4 h-4" />
              <span>Fulfilled by Fastway Express</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e2e8f0] bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-[#e2e8f0] hover:bg-[#f8f9ff] text-[12px] font-medium text-[#424754] cursor-pointer"
            type="button"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenInvoicePreview();
            }}
            className="h-8 px-4 rounded-lg bg-[#1e70eb] hover:bg-[#0058c3] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            type="button"
          >
            <span>View Full Invoice Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
