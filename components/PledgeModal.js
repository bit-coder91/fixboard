import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import { X, DollarSign, CheckCircle2, ShieldCheck, Wallet, Sparkles } from 'lucide-react';

export default function PledgeModal({ chore, onClose }) {
  const { pledgeChore, wallet } = useApp();
  const [pledgeMode, setPledgeMode] = useState('crypto'); // 'crypto' | 'usd'
  const [amountUSD, setAmountUSD] = useState(25);
  const [amountETH, setAmountETH] = useState('0.05');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [txDetails, setTxDetails] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveUSD = pledgeMode === 'crypto' ? Math.round(parseFloat(amountETH) * 500) : amountUSD;
    const effectiveETH = pledgeMode === 'crypto' ? amountETH : (amountUSD / 500).toFixed(4);

    pledgeChore(chore.id, effectiveUSD, name || 'Seller Community', effectiveETH);
    setTxDetails({
      eth: effectiveETH,
      usd: effectiveUSD,
      actor: wallet.address
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}>
              <DollarSign size={16} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Pledge Funds</h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              On-Chain Pledge Confirmed!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Pledged {txDetails?.eth} SEP ETH (~${txDetails?.usd}) to FixBoard Solidity contract.
            </p>
            <div style={{
              padding: '0.65rem',
              borderRadius: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: 'var(--accent-emerald)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <ShieldCheck size={14} />
              <span>Immutable transaction logged to Ethereum Sepolia Audit Ledger</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Backing chore: <strong>"{chore.title}"</strong>
            </p>

            {/* Mode Selector */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.25rem',
              borderRadius: '0.75rem',
              background: 'var(--bg-surface)',
              marginBottom: '1.25rem'
            }}>
              <button
                type="button"
                onClick={() => setPledgeMode('crypto')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: pledgeMode === 'crypto' ? 'var(--accent-primary)' : 'transparent',
                  color: pledgeMode === 'crypto' ? '#FFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>Sepolia ETH (Free Web3)</span>
              </button>

              <button
                type="button"
                onClick={() => setPledgeMode('usd')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: pledgeMode === 'usd' ? 'var(--accent-primary)' : 'transparent',
                  color: pledgeMode === 'usd' ? '#FFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <DollarSign size={14} />
                <span>Standard USD</span>
              </button>
            </div>

            {/* Wallet Info Box */}
            <div style={{
              padding: '0.75rem',
              borderRadius: '0.65rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wallet size={14} color="var(--accent-cyan)" />
                <span style={{ color: 'var(--text-secondary)' }}>Paying from:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatAddress(wallet.address)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{wallet.balance} SEP</span>
              </div>
            </div>

            {pledgeMode === 'crypto' ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Sepolia ETH Amount (Testnet - Free)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {['0.01', '0.05', '0.10', '0.25'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountETH(val)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '0.5rem',
                        background: amountETH === val ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
                        border: amountETH === val ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        color: amountETH === val ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer'
                      }}
                    >
                      {val} SEP
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  value={amountETH}
                  onChange={(e) => setAmountETH(e.target.value)}
                  className="input-field"
                  placeholder="0.05"
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Est. Value: ~${Math.round(parseFloat(amountETH || 0) * 500)} USD</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Gas fee: 0.0000 SEP (Free)</span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Pledge Amount ($)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[15, 25, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountUSD(val)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '0.5rem',
                        background: amountUSD === val ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                        border: amountUSD === val ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                        color: amountUSD === val ? 'var(--accent-emerald)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input 
                  type="number"
                  min="1"
                  max="10000"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(Number(e.target.value))}
                  className="input-field"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Your Name / Seller Store Display
              </label>
              <input 
                type="text"
                placeholder="e.g. Apex Outlets"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <ShieldCheck size={16} />
              <span>
                {pledgeMode === 'crypto' 
                  ? `Sign & Escrow ${amountETH} SEP On-Chain` 
                  : `Confirm $${amountUSD} Pledge`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
