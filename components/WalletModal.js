import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { useToast } from '../lib/ToastContext';
import { formatAddress } from '../lib/web3';
import { 
  X, 
  Wallet, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function WalletModal({ isOpen, onClose }) {
  const { wallet, connectWallet, disconnectWallet, contractAddress, sepoliaConfig } = useApp();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

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

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.info('Address copied', wallet.address);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchToMetaMask = async () => {
    setIsSwitching(true);
    await connectWallet('metamask');
    setIsSwitching(false);
    toast.success('Wallet Connected', 'MetaMask connected on Ethereum Sepolia');
  };

  const handleSwitchToDemo = async () => {
    setIsSwitching(true);
    await connectWallet('demo');
    setIsSwitching(false);
    toast.info('Demo Mode', 'Using zero-cost deterministic browser relayer');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="var(--accent)" />
            <h3 id="wallet-modal-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Web3 Wallet &amp; Sepolia Consensus
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

        {/* Current Active Account Box */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Connected Signer
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: wallet.type === 'metamask' ? 'var(--warning-subtle)' : 'var(--accent-subtle)',
              color: wallet.type === 'metamask' ? 'var(--warning-text)' : 'var(--accent)',
              border: '1px solid var(--border-subtle)',
              textTransform: 'capitalize'
            }}>
              {wallet.type} Signer
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {wallet.address ? formatAddress(wallet.address) : 'No address'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={copyAddress}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={12} color="var(--success-text)" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={`https://sepolia.etherscan.io/address/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Etherscan</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Balance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sepolia Balance:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
              {wallet.balance} SEP ETH
            </span>
          </div>
        </div>

        {/* Network & Contract Details */}
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Network:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Ethereum Sepolia Testnet (Chain ID: 11155111)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Solidity Contract:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{formatAddress(contractAddress)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Consensus Model:</span>
            <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>1-Wallet-1-Vote &bull; Merkle Audit Verified</span>
          </div>
        </div>

        {/* Wallet Switch Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {wallet.type !== 'metamask' ? (
            <button
              onClick={handleSwitchToMetaMask}
              disabled={isSwitching}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              <Wallet size={15} />
              <span>Connect MetaMask Extension</span>
            </button>
          ) : (
            <button
              onClick={handleSwitchToDemo}
              disabled={isSwitching}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              <RefreshCw size={14} />
              <span>Switch to Zero-Cost Demo Relayer</span>
            </button>
          )}

          <a
            href="https://sepoliafaucet.com"
            target="_blank"
            rel="noreferrer"
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '4px',
            }}
          >
            Need Sepolia testnet ETH? Get free tokens here &rarr;
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
