import React from 'react';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import { 
  ArrowBigUp, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  ExternalLink,
  Flame,
  ShieldCheck
} from 'lucide-react';

const CATEGORY_META = {
  catalog: { label: 'Catalog Cleanup', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
  returns: { label: 'Return Handling', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
  sync: { label: 'Marketplace Sync', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  listings: { label: 'Listing Errors', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)' },
  pricing: { label: 'Pricing Rules', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  shipping: { label: 'Shipping & Dim', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  other: { label: 'Operations', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
};

const PAIN_LABELS = ['', 'Minor issue', 'Noticeable drag', 'High time sink', 'Major blocker', 'Critical crisis'];

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

export default function ChoreCard({ chore, onSelect, onOpenPledge }) {
  const { userVotedIds, voteChore } = useApp();
  const isVoted = userVotedIds.includes(chore.id);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.other;

  const pct = chore.fundingGoal 
    ? Math.min(100, Math.round(((chore.fundingRaised || 0) / chore.fundingGoal) * 100))
    : 0;

  return (
    <article 
      className="glass-panel" 
      onClick={() => onSelect(chore)}
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
    >
      <div>
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: cat.color,
              background: cat.bg,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {cat.label}
            </span>

            {/* Ethereum Proof Badge */}
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title={`On-Chain Hash: ${chore.choreHash || 'Verified'}`}
            >
              <ShieldCheck size={11} />
              <span>Sepolia Verified</span>
            </span>
          </div>

          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.15rem 0.55rem',
            borderRadius: '9999px',
            background: chore.status === 'funded' ? 'rgba(16, 185, 129, 0.15)' :
                        chore.status === 'in-progress' ? 'rgba(245, 158, 11, 0.15)' :
                        chore.status === 'solved' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            color: chore.status === 'funded' ? 'var(--accent-emerald)' :
                   chore.status === 'in-progress' ? 'var(--accent-amber)' :
                   chore.status === 'solved' ? 'var(--accent-cyan)' : 'var(--accent-primary)'
          }}>
            {chore.status.replace('-', ' ')}
          </span>
        </div>

        {/* Title & Description */}
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          lineHeight: 1.35,
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          {chore.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {chore.description}
        </p>

        {/* Platforms */}
        {chore.platforms && chore.platforms.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {chore.platforms.map(p => (
              <span key={p} style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '0.1rem 0.45rem',
                borderRadius: '0.35rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Severity / Pain indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Pain severity:</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <div 
                key={lvl} 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: lvl <= chore.pain ? 'var(--accent-rose)' : 'var(--border-subtle)',
                  boxShadow: lvl <= chore.pain ? '0 0 6px rgba(244, 63, 94, 0.4)' : 'none'
                }} 
              />
            ))}
          </div>
          <span>({PAIN_LABELS[chore.pain] || 'Severity'})</span>
        </div>
      </div>

      <div>
        {/* Funding Progress Bar */}
        {chore.fundingGoal > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>
                ${chore.fundingRaised || 0} pledged
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                of ${chore.fundingGoal} ({pct}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              background: 'var(--bg-surface)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Footer Meta & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{chore.author}</span>
            <span style={{ margin: '0 0.35rem' }}>&bull;</span>
            <span>{formatTimeAgo(chore.createdAt)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* On-Chain Upvote Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                voteChore(chore.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.5rem',
                background: isVoted ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface)',
                color: isVoted ? 'var(--accent-primary)' : 'var(--text-primary)',
                border: isVoted ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title="Cast verified vote on Ethereum Sepolia"
            >
              <ArrowBigUp size={16} fill={isVoted ? 'currentColor' : 'none'} />
              <span>{chore.votes || 0}</span>
            </button>

            {/* Fund Pledge Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPledge(chore);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.5rem',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title="Pledge funds toward this fix (USD or Sepolia ETH)"
            >
              <DollarSign size={14} />
              <span>Pledge</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
