import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import WalletModal from './WalletModal';
import AuditTrailModal from './AuditTrailModal';
import { 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Wallet,
  Activity
} from 'lucide-react';

export default function Header({ onOpenNewModal }) {
  const { theme, toggleTheme, isFirebaseConnected, wallet, auditTrail } = useApp();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  FixBoard
                </span>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  Solidity Web3
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Database size={12} color={isFirebaseConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
                  <span>{isFirebaseConnected ? 'Firebase Cloud' : 'Firebase Ready'}</span>
                </span>
                <span>&bull;</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-cyan)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block' }}></span>
                  <span>Sepolia EVM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Web3 Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Blockchain Audit Trail Button */}
            <button 
              className="btn-secondary"
              onClick={() => setIsAuditOpen(true)}
              style={{
                padding: '0.5rem 0.95rem',
                fontSize: '0.8125rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="View on-chain voting and audit ledger"
            >
              <ShieldCheck size={15} color="var(--accent-emerald)" />
              <span>Audit Trail</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent-emerald)',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {auditTrail.length}
              </span>
            </button>

            {/* Web3 Wallet Pill */}
            <button
              onClick={() => setIsWalletOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Click to view wallet details and Sepolia balance"
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: wallet.type === 'metamask' ? 'var(--accent-amber)' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}>
                <Wallet size={11} />
              </div>
              <span style={{ fontFamily: 'monospace' }}>
                {wallet.address ? formatAddress(wallet.address) : 'Connect Web3'}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                background: 'rgba(6, 182, 212, 0.12)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.35rem'
              }}>
                {wallet.balance} SEP
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#6366F1" />}
            </button>

            {/* New Chore Button */}
            <button className="btn-primary" onClick={onOpenNewModal}>
              <Plus size={16} />
              <span>Post a Chore</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <AuditTrailModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </>
  );
}
