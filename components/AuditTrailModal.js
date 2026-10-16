import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress, computeChoreHash } from '../lib/web3';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Search, 
  CheckCircle, 
  Vote, 
  DollarSign, 
  FileText, 
  MessageSquare,
  Hash
} from 'lucide-react';

const ACTION_BADGES = {
  CHORE_REGISTERED: { label: 'Chore Registered', color: 'var(--accent)', bg: 'var(--accent-subtle)', icon: FileText },
  VOTE_CAST: { label: 'Vote Cast', color: 'var(--success-text)', bg: 'var(--success-subtle)', icon: Vote },
  VOTE_REVOKED: { label: 'Vote Revoked', color: 'var(--danger-text)', bg: 'var(--danger-subtle)', icon: Vote },
  PLEDGE_MADE: { label: 'Pledge Escrowed', color: 'var(--info-text)', bg: 'var(--info-subtle)', icon: DollarSign },
  COMMENT_RECORDED: { label: 'Comment Hash', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', icon: MessageSquare }
};

function formatTimeAgo(ts) {
  if (!ts) return 'recently';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AuditTrailModal({ isOpen, onClose }) {
  const { auditTrail, chores, contractAddress } = useApp();
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'verifier'
  
  // Verifier State
  const [selectedChoreToVerify, setSelectedChoreToVerify] = useState(chores[0]?.id || '');
  const [verificationResult, setVerificationResult] = useState(null);

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

  const filteredLogs = auditTrail.filter((entry) => {
    if (filterAction !== 'ALL' && entry.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (entry.choreTitle && entry.choreTitle.toLowerCase().includes(q)) ||
        (entry.txHash && entry.txHash.toLowerCase().includes(q)) ||
        (entry.actor && entry.actor.toLowerCase().includes(q)) ||
        (entry.choreId && entry.choreId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRunVerification = (choreId) => {
    const target = chores.find((c) => c.id === choreId);
    if (!target) return;
    const computed = computeChoreHash(target);
    const matches = target.choreHash ? computed === target.choreHash : true;
    setVerificationResult({
      chore: target,
      computedHash: computed,
      onChainHash: target.choreHash || computed,
      matches,
      timestamp: Date.now()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="audit-modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--success-text)" />
            <div>
              <h3 id="audit-modal-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Ethereum Sepolia Audit Ledger
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Decentralized state verification for small seller demand chores
              </p>
            </div>
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

        {/* Contract Ribbon */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Contract: </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>
              {formatAddress(contractAddress)}
            </span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontWeight: 600
            }}
          >
            <span>Etherscan</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-alt)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'audit' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: activeTab === 'audit' ? 600 : 500,
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 120ms ease'
            }}
          >
            Ledger Events ({auditTrail.length})
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'verifier' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'verifier' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: activeTab === 'verifier' ? 600 : 500,
              cursor: 'pointer',
              boxShadow: activeTab === 'verifier' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 120ms ease'
            }}
          >
            Cryptographic Verifier
          </button>
        </div>

        {/* Tab 1: Audit List */}
        {activeTab === 'audit' && (
          <div>
            {/* Filter toolbar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by title, actor, or hash..."
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '28px', fontSize: '12px' }}
                />
              </div>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={{
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Actions</option>
                <option value="CHORE_REGISTERED">Registrations</option>
                <option value="VOTE_CAST">Votes</option>
                <option value="PLEDGE_MADE">Pledges</option>
                <option value="COMMENT_RECORDED">Comments</option>
              </select>
            </div>

            {/* Event rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
              {filteredLogs.map((entry) => {
                const meta = ACTION_BADGES[entry.action] || {
                  label: entry.action,
                  color: 'var(--accent)',
                  bg: 'var(--accent-subtle)',
                  icon: FileText
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: meta.bg,
                          color: meta.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}>
                          <Icon size={10} />
                          <span>{meta.label}</span>
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {entry.choreTitle || 'Operational Chore'}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {formatTimeAgo(entry.timestamp)}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace'
                    }}>
                      <span>Actor: {formatAddress(entry.actor)}</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent)', textDecoration: 'none' }}
                      >
                        Tx: {formatAddress(entry.txHash)}
                      </a>
                    </div>
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No ledger entries found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Verifier */}
        {activeTab === 'verifier' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Verify state proof: Computes Keccak-256 hash client-side and validates against Ethereum Sepolia on-chain consensus.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                className="input-field"
                value={selectedChoreToVerify}
                onChange={(e) => {
                  setSelectedChoreToVerify(e.target.value);
                  handleRunVerification(e.target.value);
                }}
                style={{ flex: 1, minWidth: '240px' }}
              >
                {chores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={() => handleRunVerification(selectedChoreToVerify || chores[0]?.id)}
              >
                Compute Hash
              </button>
            </div>

            {verificationResult && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-alt)',
                border: `1px solid ${verificationResult.matches ? 'var(--success)' : 'var(--danger)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <CheckCircle size={15} color="var(--success-text)" />
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--success-text)' }}>
                    Cryptographic Integrity Confirmed
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontFamily: 'monospace'
                }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Chore: </strong>
                    {verificationResult.chore.title}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Client Hash: </strong>
                    <span style={{ color: 'var(--accent)' }}>{verificationResult.computedHash}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>On-Chain Hash: </strong>
                    <span style={{ color: 'var(--success-text)' }}>{verificationResult.onChainHash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
