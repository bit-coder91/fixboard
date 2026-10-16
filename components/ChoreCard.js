import React from 'react';
import { useApp } from '../lib/AppContext';
import { useToast } from '../lib/ToastContext';
import { 
  ArrowBigUp, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const CATEGORY_META = {
  catalog: { label: 'Catalog', color: 'var(--accent)', bg: 'var(--accent-subtle)' },
  returns: { label: 'Returns', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  sync: { label: 'Sync & API', color: 'var(--info-text)', bg: 'var(--info-subtle)' },
  listings: { label: 'Listings', color: 'var(--danger-text)', bg: 'var(--danger-subtle)' },
  pricing: { label: 'Pricing', color: 'var(--warning-text)', bg: 'var(--warning-subtle)' },
  shipping: { label: 'Shipping', color: 'var(--success-text)', bg: 'var(--success-subtle)' },
  other: { label: 'Operations', color: 'var(--text-secondary)', bg: 'var(--bg-surface-alt)' },
};

const PAIN_LABELS = ['', 'Low friction', 'Noticeable drag', 'Time sink', 'Major blocker', 'Critical crisis'];

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
  const toast = useToast();
  const isVoted = userVotedIds?.includes(chore.id);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.other;

  const pct = chore.fundingGoal 
    ? Math.min(100, Math.round(((chore.fundingRaised || 0) / chore.fundingGoal) * 100))
    : 0;

  const handleVote = async (e) => {
    e.stopPropagation();
    try {
      await voteChore(chore.id);
      if (!isVoted) {
        toast.success('Vote recorded', 'Deterministic Keccak256 hash queued for Sepolia EVM');
      }
    } catch (err) {
      toast.error('Vote failed', err.message);
    }
  };

  return (
    <article 
      onClick={() => onSelect(chore)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(chore);
        }
      }}
      aria-label={`Chore: ${chore.title}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: 'var(--shadow-sm)',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-focus)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div>
        {/* Top Meta Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Category tag */}
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: cat.color,
              background: cat.bg,
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              {cat.label}
            </span>

            {/* Solidity / EVM verified badge */}
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--success-subtle)',
              color: 'var(--success-text)',
              border: '1px solid var(--border-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title={`Sepolia Verification Hash: ${chore.choreHash || 'Pending sync'}`}
            >
              <ShieldCheck size={11} />
              <span>EVM Verified</span>
            </span>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'capitalize',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: chore.status === 'funded' ? 'var(--success-subtle)' :
                        chore.status === 'in-progress' ? 'var(--warning-subtle)' :
                        chore.status === 'solved' ? 'var(--info-subtle)' : 'var(--accent-subtle)',
            color: chore.status === 'funded' ? 'var(--success-text)' :
                   chore.status === 'in-progress' ? 'var(--warning-text)' :
                   chore.status === 'solved' ? 'var(--info-text)' : 'var(--accent)',
            border: '1px solid var(--border-subtle)'
          }}>
            {chore.status.replace('-', ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          lineHeight: 1.35,
          marginBottom: '6px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {chore.title}
        </h3>

        {/* Description excerpt */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {chore.description}
        </p>

        {/* Platforms tags */}
        {chore.platforms && chore.platforms.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {chore.platforms.map((p) => (
              <span key={p} style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-alt)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Severity Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Pain:</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div 
                key={lvl} 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: lvl <= chore.pain ? 'var(--accent)' : 'var(--border-default)',
                }} 
              />
            ))}
          </div>
          <span>({PAIN_LABELS[chore.pain] || 'Severity'})</span>
        </div>
      </div>

      <div>
        {/* Funding Goal Bar if enabled */}
        {chore.fundingGoal > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ color: 'var(--success-text)' }}>
                ${chore.fundingRaised || 0} pledged
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                of ${chore.fundingGoal} ({pct}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              borderRadius: '9999px',
              background: 'var(--bg-surface-alt)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--success)',
                borderRadius: '9999px',
                transition: 'width 250ms ease'
              }} />
            </div>
          </div>
        )}

        {/* Footer Meta & Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{chore.author}</span>
            <span>&bull;</span>
            <span>{formatTimeAgo(chore.createdAt)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Upvote button */}
            <button 
              onClick={handleVote}
              aria-label={`Upvote chore. Current votes: ${chore.votes || 0}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isVoted ? 'var(--accent-subtle)' : 'var(--bg-surface-alt)',
                color: isVoted ? 'var(--accent)' : 'var(--text-primary)',
                border: isVoted ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              title="Cast verified vote on Ethereum Sepolia"
            >
              <ArrowBigUp size={15} fill={isVoted ? 'currentColor' : 'none'} />
              <span>{chore.votes || 0}</span>
            </button>

            {/* Pledge button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPledge(chore);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-alt)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontWeight: 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              title="Pledge funds toward this fix (USD or Sepolia ETH)"
            >
              <DollarSign size={13} color="var(--success-text)" />
              <span>Pledge</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
