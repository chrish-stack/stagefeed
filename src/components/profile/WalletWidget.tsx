import { useState } from 'react';
import { DollarSign, CreditCard, ArrowDownCircle, ArrowUpCircle, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { UserPrivate } from '@/types';

interface WalletWidgetProps {
  privateData: UserPrivate;
  onUpdatePrivate: (updates: Partial<UserPrivate>) => Promise<void>;
}

export function WalletWidget({ privateData, onUpdatePrivate }: WalletWidgetProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [cashapp, setCashapp] = useState(privateData.linkedAccounts?.cashapp || '');
  const [venmo, setVenmo] = useState(privateData.linkedAccounts?.venmo || '');
  const [zelle, setZelle] = useState(privateData.linkedAccounts?.zelle || '');

  const handleSaveAccounts = async () => {
    await onUpdatePrivate({
      linkedAccounts: {
        cashapp: cashapp || undefined,
        venmo: venmo || undefined,
        zelle: zelle || undefined,
      },
    });
    setLinkOpen(false);
  };

  const linked = privateData.linkedAccounts;
  const hasLinked = linked?.cashapp || linked?.venmo || linked?.zelle;

  return (
    <>
      <div className="glass rounded-3xl p-5 glow-purple mb-4">
        {/* Balance */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Applause Received</p>
            <p className="text-4xl font-black gradient-text">${(privateData.earnings || 0).toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
            <DollarSign size={22} className="text-white" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1 gap-2">
            <ArrowDownCircle size={14} />
            Add Funds
          </Button>
          <Button
            variant={privateData.earnings > 0 ? 'gradient' : 'secondary'}
            size="sm"
            className="flex-1 gap-2"
            disabled={!privateData.earnings}
          >
            <ArrowUpCircle size={14} />
            Cash Out
          </Button>
        </div>
      </div>

      {/* Linked accounts */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white/70">Payment Accounts</p>
          <button
            onClick={() => setLinkOpen(true)}
            className="flex items-center gap-1 text-[#7A5CFF] text-xs font-semibold hover:opacity-80"
          >
            <Link size={12} />
            {hasLinked ? 'Edit' : 'Link'}
          </button>
        </div>

        {hasLinked ? (
          <div className="flex flex-col gap-2">
            {linked?.cashapp && (
              <div className="flex items-center gap-2">
                <span className="text-[#00D632] text-sm">$</span>
                <span className="text-sm text-white/70">{linked.cashapp}</span>
                <span className="text-white/30 text-xs ml-auto">Cash App</span>
              </div>
            )}
            {linked?.venmo && (
              <div className="flex items-center gap-2">
                <span className="text-[#3D95CE] text-sm">@</span>
                <span className="text-sm text-white/70">{linked.venmo}</span>
                <span className="text-white/30 text-xs ml-auto">Venmo</span>
              </div>
            )}
            {linked?.zelle && (
              <div className="flex items-center gap-2">
                <span className="text-[#6E24E8] text-sm">Z</span>
                <span className="text-sm text-white/70">{linked.zelle}</span>
                <span className="text-white/30 text-xs ml-auto">Zelle</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Link an account to receive payouts</p>
        )}
      </div>

      {/* Link accounts modal */}
      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Link Payment Accounts">
        <div className="flex flex-col gap-4">
          {[
            { label: 'Cash App', prefix: '$', value: cashapp, onChange: setCashapp, placeholder: '$cashtag' },
            { label: 'Venmo', prefix: '@', value: venmo, onChange: setVenmo, placeholder: '@username' },
            { label: 'Zelle', prefix: '', value: zelle, onChange: setZelle, placeholder: 'Phone or email' },
          ].map(({ label, prefix, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">{label}</label>
              <div className="flex items-center glass rounded-xl px-3 gap-2">
                {prefix && <span className="text-white/40 font-bold">{prefix}</span>}
                <input
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent py-3 text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>
          ))}
          <Button variant="gradient" size="lg" className="w-full mt-2 font-bold" onClick={handleSaveAccounts}>
            Save Accounts
          </Button>
        </div>
      </Modal>
    </>
  );
}
