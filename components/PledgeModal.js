import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { useToast } from '../lib/ToastContext';
import { formatAddress } from '../lib/web3';
import { X, DollarSign, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

export default function PledgeModal({ chore, onClose }) {
  const { pledgeChore, wallet } = useApp();
  const toast = useToast();
  const [pledgeMode, setPledgeMode] = useState('crypto'); // 'crypto' | 'usd'
  const [amountUSD, setAmountUSD] = useState(50);
  const [amountETH, setAmountETH] = useState('0.10');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [txDetails, setTxDetails] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (chore) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chore, onClose]);

  if (!chore) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveUSD = pledgeMode === 'crypto' ? Math.round(parseFloat(amountETH || 0) * 500) : Number(amountUSD || 0);
    const effectiveETH = pledgeMode === 'crypto' ? amountETH : (Number(amountUSD || 0) / 500).toFixed(4);

    pledgeChore(chore.id, effectiveUSD, name.trim() || 'Seller Community', effectiveETH);
    setTxDetails({
      eth: effectiveETH,
      usd: effectiveUSD,
      actor: wallet.address,
    });
    setSubmitted(true);
    toast.success('Pledge escrowed', `Pledged ${effectiveETH} SEP ETH (~$${effectiveUSD}) to contract`);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="pledge-modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="var(--success-text)" />
            <h3 id="pledge-modal-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Pledge Escrow Funds
            </h3>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <CheckCircle2 size={40} color="var(--success-text)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              On-Chain Pledge Confirmed
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
              Escrowed {txDetails?.eth} SEP ETH (~${txDetails?.usd}) to FixBoard Solidity contract.
            </p>
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--success-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--success-text)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} />
              <span>Immutable transaction logged to Ethereum Sepolia Ledger</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Backing chore: <strong style={{ color: 'var(--text-primary)' }}>"{chore.title}"</strong>
            </p>

            {/* Mode Selector */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface-alt)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              marginBottom: '16px'
            }}>
              <button
                type="button"
                onClick={() => setPledgeMode('crypto')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: pledgeMode === 'crypto' ? 'var(--bg-surface)' : 'transparent',
                  color: pledgeMode === 'crypto' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: pledgeMode === 'crypto' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: pledgeMode === 'crypto' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 120ms ease',
                }}
              >
                Ethereum Sepolia (ETH)
              </button>
              <button
                type="button"
                onClick={() => setPledgeMode('usd')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: pledgeMode === 'usd' ? 'var(--bg-surface)' : 'transparent',
                  color: pledgeMode === 'usd' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: pledgeMode === 'usd' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: pledgeMode === 'usd' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 120ms ease',
                }}
              >
                USD Equivalence ($)
              </button>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {pledgeMode === 'crypto' ? 'Pledge Amount in Sepolia ETH' : 'Pledge Amount in USD ($)'}
              </label>

              {pledgeMode === 'crypto' ? (
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-field"
                    value={amountETH}
                    onChange={(e) => setAmountETH(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {['0.05', '0.10', '0.25', '0.50'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountETH(amt)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: amountETH === amt ? 'var(--accent-subtle)' : 'var(--bg-surface-alt)',
                          border: amountETH === amt ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                          color: amountETH === amt ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {amt} SEP
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    className="input-field"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {[25, 50, 100, 250].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountUSD(amt)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: amountUSD === amt ? 'var(--accent-subtle)' : 'var(--bg-surface-alt)',
                          border: amountUSD === amt ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                          color: amountUSD === amt ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Backer name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Your Name / Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ApexBrands or Seller_88"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Wallet footer info */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={14} color="var(--accent)" />
                <span style={{ color: 'var(--text-secondary)' }}>Signer:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {wallet.address ? formatAddress(wallet.address) : 'Demo Relayer'}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>
                Balance: {wallet.balance} SEP
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Confirm Escrow Pledge
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
