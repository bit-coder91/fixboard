import React from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import { 
  X, 
  Wallet, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function WalletModal({ isOpen, onClose }) {
  const { wallet, connectWallet, disconnectWallet, contractAddress, sepoliaConfig } = useApp();
  const [copied, setCopied] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  if (!isOpen) return null;

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchToMetaMask = async () => {
    setIsSwitching(true);
    await connectWallet('metamask');
    setIsSwitching(false);
  };

  const handleSwitchToDemo = async () => {
    setIsSwitching(true);
    await connectWallet('demo');
    setIsSwitching(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}>
              <Wallet size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Web3 Ethereum Wallet</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sepolia Testnet &bull; Free to use &bull; Zero real gas costs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Account Card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Connected Account
            </span>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: wallet.type === 'metamask' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: wallet.type === 'metamask' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
              border: '1px solid var(--border-subtle)'
            }}>
              {wallet.type === 'metamask' ? 'MetaMask Injected' : 'Sepolia Sandbox (Demo)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              wordBreak: 'break-all'
            }}>
              {wallet.address || '0x...'}
            </span>
            <button 
              onClick={copyAddress}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: copied ? 'var(--accent-emerald)' : 'var(--text-muted)',
                padding: '0.4rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Copy address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Balance */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE BALANCE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {wallet.balance} <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>SEP ETH</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>NETWORK</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
                Sepolia (11155111)
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div style={{
          padding: '1rem',
          borderRadius: '0.85rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: '1.25rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} />
            <span>FixBoard Solidity Smart Contract</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
            {contractAddress}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.85rem' }}>
            <a 
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--accent-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View Contract on Etherscan</span>
              <ExternalLink size={12} />
            </a>
            <a 
              href="https://sepoliafaucet.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Get Free Sepolia Faucet ETH</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Switch Mode Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button 
            className="btn-secondary"
            onClick={handleSwitchToMetaMask}
            disabled={isSwitching}
            style={{
              justifyContent: 'center',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              fontWeight: 700
            }}
          >
            <RefreshCw size={14} className={isSwitching ? 'spin' : ''} />
            <span>Connect Browser Wallet (MetaMask / Brave / Coinbase)</span>
          </button>

          <button 
            className="btn-secondary"
            onClick={handleSwitchToDemo}
            disabled={isSwitching}
            style={{
              justifyContent: 'center',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              fontWeight: 700
            }}
          >
            <Sparkles size={14} />
            <span>Use Sepolia Sandbox Demo Wallet (Instant, No Extension Needed)</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={disconnectWallet}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-rose)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>

          <button className="btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
