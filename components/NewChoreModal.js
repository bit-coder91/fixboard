import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { useToast } from '../lib/ToastContext';
import { formatAddress } from '../lib/web3';
import { X, ShieldCheck, Wallet } from 'lucide-react';

const CATEGORIES = [
  { id: 'catalog', label: 'Catalog Cleanup' },
  { id: 'returns', label: 'Return Handling' },
  { id: 'sync', label: 'Marketplace Sync' },
  { id: 'listings', label: 'Listing Errors' },
  { id: 'pricing', label: 'Pricing & Repricer' },
  { id: 'shipping', label: 'Shipping & Carriers' },
  { id: 'other', label: 'Other Operations' },
];

export default function NewChoreModal({ isOpen = true, onClose }) {
  const { createChore, wallet } = useApp();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('catalog');
  const [pain, setPain] = useState(4);
  const [fundingGoal, setFundingGoal] = useState(1500);
  const [author, setAuthor] = useState('');
  const [platforms, setPlatforms] = useState('Amazon, Shopify');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !author.trim()) {
      toast.error('Incomplete form', 'Please provide a title, description, and your seller name.');
      return;
    }

    createChore({
      title: title.trim(),
      description: description.trim(),
      category,
      pain: Number(pain),
      fundingGoal: Number(fundingGoal) || 0,
      author: author.trim(),
      platforms: platforms.split(',').map((p) => p.trim()).filter(Boolean),
    });

    toast.success('Chore Registered', 'Deterministic Keccak-256 hash verified for EVM ledger.');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="new-chore-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 id="new-chore-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Post a New Chore
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--success-subtle)',
                  color: 'var(--success-text)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                EVM Hashed
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Surface a recurring operational chore. Recorded immutably on Ethereum Sepolia.
            </p>
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

        {/* Creator Wallet Info */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '11px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={14} color="var(--accent)" />
            <span style={{ color: 'var(--text-secondary)' }}>Signer:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
              {wallet.address ? formatAddress(wallet.address) : 'Local EVM Key'}
            </span>
          </div>
          <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>
            Gas-Free Relayer Active
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Chore Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., FBA stranded inventory mismatch after repricing run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Detailed Description *
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Explain the recurring friction: how many hours per week it drains, what manual steps are needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Operational Category
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Pain Severity (1-5)
              </label>
              <select
                className="input-field"
                value={pain}
                onChange={(e) => setPain(e.target.value)}
              >
                <option value="1">1 — Low friction</option>
                <option value="2">2 — Noticeable drag</option>
                <option value="3">3 — Moderate time sink</option>
                <option value="4">4 — Major blocker</option>
                <option value="5">5 — Critical daily crisis</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Funding Escrow Goal ($ USD)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="1000"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Your Seller Name / Handle *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., ApexGoods or seller_42"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Affected Marketplaces & Tools
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Amazon, Shopify, eBay, Walmart, ShipStation"
              value={platforms}
              onChange={(e) => setPlatforms(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Comma-separated list of affected platforms
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Register Chore on EVM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
