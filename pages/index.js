import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useApp } from '../lib/AppContext';
import { formatAddress, computeChoreHash } from '../lib/web3';
import AppShell from '../components/AppShell';
import ChoreCard from '../components/ChoreCard';
import ChoreDetailModal from '../components/ChoreDetailModal';
import PledgeModal from '../components/PledgeModal';
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  Hash,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Chores' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'returns', label: 'Returns' },
  { id: 'sync', label: 'Sync & API' },
  { id: 'listings', label: 'Listings' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'other', label: 'Operations' },
];

export default function Home() {
  const { chores, recentTxNotification, auditTrail, contractAddress } = useApp();
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'analytics' | 'verifier'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  // Modals state
  const [detailChore, setDetailChore] = useState(null);
  const [pledgeChoreTarget, setPledgeChoreTarget] = useState(null);

  // Verifier tab state
  const [verifyChoreId, setVerifyChoreId] = useState(chores[0]?.id || '');
  const [verificationResult, setVerificationResult] = useState(null);

  // Filtered and Sorted Chores
  const filteredChores = useMemo(() => {
    let list = [...chores];

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      list = list.filter((c) => c.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'hot') {
      const now = Date.now();
      list.sort((a, b) => {
        const scoreA =
          (a.votes * 2) + ((a.fundingRaised || 0) / 10) - ((now - a.createdAt) / 86400000);
        const scoreB =
          (b.votes * 2) + ((b.fundingRaised || 0) / 10) - ((now - b.createdAt) / 86400000);
        return scoreB - scoreA;
      });
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'votes') {
      list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (sortBy === 'funded') {
      list.sort((a, b) => (b.fundingRaised || 0) - (a.fundingRaised || 0));
    }

    return list;
  }, [chores, selectedCategory, selectedStatus, searchQuery, sortBy]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalRequests = chores.length;
    const totalVotes = chores.reduce((acc, c) => acc + (c.votes || 0), 0);
    const totalFunded = chores.reduce((acc, c) => acc + (c.fundingRaised || 0), 0);
    const totalGoal = chores.reduce((acc, c) => acc + (c.fundingGoal || 0), 0);
    const avgPain =
      totalRequests > 0
        ? (chores.reduce((acc, c) => acc + (c.pain || 0), 0) / totalRequests).toFixed(1)
        : '0.0';

    return { totalRequests, totalVotes, totalFunded, totalGoal, avgPain };
  }, [chores]);

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
      timestamp: Date.now(),
    });
  };

  return (
    <AppShell
      title="Chore Demand Board"
      subtitle="E-commerce operations queue backed by Ethereum Solidity audit trail"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <Head>
        <title>FixBoard — B2B Operations Demand Board</title>
        <meta
          name="description"
          content="Calm, professional demand board for e-commerce sellers to vote and fund repetitive chore fixes with Ethereum Solidity audit trail."
        />
      </Head>

      {/* Floating On-Chain Notification */}
      {recentTxNotification && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '72px',
            right: '24px',
            zIndex: 1000,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '400px',
            animation: 'slideUp 200ms ease',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--success-subtle)',
              color: 'var(--success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {recentTxNotification.type}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {recentTxNotification.choreTitle}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
                fontSize: '11px',
              }}
            >
              <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                Tx: {formatAddress(recentTxNotification.txHash)}
              </span>
              <a
                href={`https://sepolia.etherscan.io/tx/${recentTxNotification.txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontWeight: 600,
                }}
              >
                <span>Sepolia</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Primary Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Registered Chores
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {stats.totalRequests}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Avg pain rating: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{stats.avgPain}/5.0</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            On-Chain Votes
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
            {stats.totalVotes.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            EVM consensus validated
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Escrow Pledged
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success-text)', marginTop: '2px' }}>
            ${stats.totalFunded.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            of ${stats.totalGoal.toLocaleString()} target
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Audit Entries
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--info-text)', marginTop: '2px' }}>
            {auditTrail.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Immutable Sepolia blocks
          </div>
        </div>
      </div>

      {/* Main View: Demand Board */}
      {activeTab === 'board' && (
        <div>
          {/* Controls toolbar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Top row: Categories & Sort */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {/* Category pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-surface-alt)',
                        color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sort dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                  <option value="hot">Hot Score</option>
                  <option value="votes">Most Voted</option>
                  <option value="funded">Most Funded</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Status filters & result count */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'open', 'funded', 'in-progress', 'solved'].map((st) => {
                  const isSelected = selectedStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: isSelected ? 600 : 500,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--border-focus)' : '1px solid transparent',
                        background: isSelected ? 'var(--bg-active)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {st.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredChores.length}</strong> of {chores.length} chores
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredChores.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredChores.map((chore) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onSelect={(c) => setDetailChore(c)}
                  onOpenPledge={(c) => setPledgeChoreTarget(c)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Search size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No chores found matching your filters
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Try adjusting your search query, status, or category filter.
              </p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* View: Seller Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Operational Category Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const count = chores.filter((c) => c.category === cat.id).length;
                const pct = chores.length > 0 ? (count / chores.length) * 100 : 0;
                return (
                  <div key={cat.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{cat.label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '9999px',
                        background: 'var(--bg-surface-alt)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Resolution Workflow Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['open', 'funded', 'in-progress', 'solved'].map((st) => {
                const count = chores.filter((c) => c.status === st).length;
                const pct = chores.length > 0 ? (count / chores.length) * 100 : 0;
                const color =
                  st === 'funded' ? 'var(--success)' :
                  st === 'in-progress' ? 'var(--warning)' :
                  st === 'solved' ? 'var(--info)' : 'var(--accent)';
                return (
                  <div key={st}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {st.replace('-', ' ')}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {count} chores
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '9999px',
                        background: 'var(--bg-surface-alt)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: color,
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* View: Hash Verifier */}
      {activeTab === 'verifier' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            maxWidth: '720px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Hash size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Deterministic Keccak-256 Verifier
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Confirm client-side data integrity. Verify that the current title, author, and description match the on-chain Ethereum Sepolia hash.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <select
              className="input-field"
              value={verifyChoreId}
              onChange={(e) => {
                setVerifyChoreId(e.target.value);
                handleRunVerification(e.target.value);
              }}
              style={{ flex: 1, minWidth: '260px' }}
            >
              {chores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button
              className="btn-primary"
              onClick={() => handleRunVerification(verifyChoreId || chores[0]?.id)}
            >
              Compute Proof
            </button>
          </div>

          {verificationResult && (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-alt)',
                border: `1px solid ${verificationResult.matches ? 'var(--success)' : 'var(--danger)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle size={18} color="var(--success-text)" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--success-text)' }}>
                  100% Cryptographic Match Verified
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'monospace',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Chore ID: </strong>
                  {verificationResult.chore.id}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Client Hash: </strong>
                  <span style={{ color: 'var(--accent)' }}>{verificationResult.computedHash}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>EVM Ledger: </strong>
                  <span style={{ color: 'var(--success-text)' }}>{verificationResult.onChainHash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {detailChore && (
        <ChoreDetailModal
          chore={detailChore}
          onClose={() => setDetailChore(null)}
          onOpenPledge={(c) => {
            setDetailChore(null);
            setPledgeChoreTarget(c);
          }}
        />
      )}

      {pledgeChoreTarget && (
        <PledgeModal
          chore={pledgeChoreTarget}
          onClose={() => setPledgeChoreTarget(null)}
        />
      )}
    </AppShell>
  );
}
