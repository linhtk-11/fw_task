import React, { useState } from 'react';
import { X, Send, DollarSign, Wallet, Building2, CheckCircle2 } from 'lucide-react';
import { PaymentGateway } from '../types/billing';

interface SentPaymentModalProps {
  currentBalance: number;
  onClose: () => void;
  onSubmitPayment: (amount: number, gateway: PaymentGateway, notes: string) => void;
}

export const SentPaymentModal: React.FC<SentPaymentModalProps> = ({
  currentBalance,
  onClose,
  onSubmitPayment,
}) => {
  const [amount, setAmount] = useState<string>('5000.00');
  const [gateway, setGateway] = useState<PaymentGateway>('Fastway Wallet');
  const [recipient, setRecipient] = useState<string>('FASTWAY LOGISTICS FULFILLMENT LLC');
  const [notes, setNotes] = useState<string>('Settlement for scheduled carrier manifests');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onSubmitPayment(num, gateway, notes);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-[3px] animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-[#e2e8f0] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0b1c30]">Send Payment</h3>
              <p className="text-[11px] text-[#727785]">Transfer ledger balance or settle carrier fees</p>
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-bold text-[#0b1c30]">Payment Sent Successfully</h4>
            <p className="text-[12px] text-[#727785]">
              ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} has been debited and processed via {gateway}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-[#eff4ff]/60 p-3 rounded-lg border border-[#c2c6d6]/40 flex items-center justify-between">
              <span className="text-[12px] text-[#424754]">Current Available Balance</span>
              <span className="text-[16px] font-bold text-[#006c49]">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1">
                Amount to Settle (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#727785] font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-9 pl-7 pr-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1">
                Source Account / Gateway
              </label>
              <select
                value={gateway}
                onChange={(e) => setGateway(e.target.value as PaymentGateway)}
                className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
              >
                <option value="Fastway Wallet">Fastway Wallet (Default)</option>
                <option value="Fastway Credit">Fastway Credit Line</option>
                <option value="Bank Wire">Bank Wire Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1">
                Beneficiary Entity
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#424754] mb-1">
                Transfer Notes / Memo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#c2c6d6]/60 text-[13px] text-[#0b1c30] bg-white focus:outline-none focus:ring-1 focus:ring-[#0058c3]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-lg border border-[#e2e8f0] text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-lg bg-[#006c49] hover:bg-[#005236] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
