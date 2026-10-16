import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import { X, Sparkles, ShieldCheck, Wallet } from 'lucide-react';

const CATEGORIES = [
  { id: 'catalog', label: '📦 Catalog Cleanup' },
  { id: 'returns', label: '🔄 Return Handling' },
  { id: 'sync', label: '🔗 Marketplace Sync' },
  { id: 'listings', label: '📝 Listing Errors' },
  { id: 'pricing', label: '💰 Pricing & Repricer' },
  { id: 'shipping', label: '🚚 Shipping & Carriers' },
  { id: 'other', label: '🧩 Other Operations' },
];

export default function NewChoreModal({ onClose }) {
  const { createChore, wallet } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('catalog');
  const [pain, setPain] = useState(4);
  const [fundingGoal, setFundingGoal] = useState(1500);
  const [author, setAuthor] = useState('');
  const [platforms, setPlatforms] = useState('Amazon, Shopify');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !author) return;

    createChore({
      title,
      description,
      category,
      pain: Number(pain),
      fundingGoal: Number(fundingGoal) || 0,
      author,
      platforms: platforms.split(',').map(p => p.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Post a New Chore</h2>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                Ethereum Hashed
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Surface a repetitive operational chore. Verified immutably on Ethereum Sepolia.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Creator Wallet Info */}
          <div style={{
            padding: '0.65rem 0.85rem',
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
              <Wallet size={13} color="var(--accent-primary)" />
              <span style={{ color: 'var(--text-secondary)' }}>Publishing as Web3 Creator:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatAddress(wallet.address)}</span>
            </div>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Zero Gas Fee (Free)</span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Chore Title *
            </label>
            <input 
              type="text" 
              placeholder='e.g. "Auto-generate Amazon flat files from Shopify CSV imports"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Problem Description &amp; Desired Fix *
            </label>
            <textarea 
              rows={4}
              placeholder="Describe the workflow friction, how many hours it takes you, and what the automated tool should do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          {/* Category & Pain */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Pain Severity (1-5)
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPain(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0',
                      borderRadius: '0.5rem',
                      background: pain === lvl ? 'var(--accent-rose)' : 'var(--bg-surface)',
                      color: pain === lvl ? '#FFF' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Funding Target & Marketplaces */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Funding Target ($)
              </label>
              <input 
                type="number"
                min="0"
                step="50"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Marketplaces (comma-separated)
              </label>
              <input 
                type="text" 
                placeholder="Amazon, Shopify, eBay"
                value={platforms}
                onChange={(e) => setPlatforms(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Author */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Your Name or Seller Brand *
            </label>
            <input 
              type="text"
              placeholder="e.g. Apex Merchant Group"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <ShieldCheck size={16} />
            <span>Publish &amp; Mint On-Chain Chore Demand</span>
          </button>
        </form>
      </div>
    </div>
  );
}
