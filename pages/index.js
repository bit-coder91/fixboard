import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import Header from '../components/Header';
import ChoreCard from '../components/ChoreCard';
import ChoreDetailModal from '../components/ChoreDetailModal';
import PledgeModal from '../components/PledgeModal';
import NewChoreModal from '../components/NewChoreModal';
import AuditTrailModal from '../components/AuditTrailModal';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Flame, 
  Sparkles,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  ExternalLink,
  Lock,
  Wallet
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Chores' },
  { id: 'catalog', label: '📦 Catalog' },
  { id: 'returns', label: '🔄 Returns' },
  { id: 'sync', label: '🔗 Sync' },
  { id: 'listings', label: '📝 Listings' },
  { id: 'pricing', label: '💰 Pricing' },
  { id: 'shipping', label: '🚚 Shipping' },
  { id: 'other', label: '🧩 Other' }
];

export default function Home() {
  const { chores, recentTxNotification, auditTrail, contractAddress } = useApp();
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'leaderboard' | 'stats' | 'blockchain'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  // Modals state
  const [detailChore, setDetailChore] = useState(null);
  const [pledgeChoreTarget, setPledgeChoreTarget] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Filtered and Sorted Chores
  const filteredChores = useMemo(() => {
    let list = [...chores];

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      list = list.filter(c => c.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'hot') {
      const now = Date.now();
      list.sort((a, b) => {
        const scoreA = (a.votes * 2) + ((a.fundingRaised || 0) / 10) - ((now - a.createdAt) / 86400000);
        const scoreB = (b.votes * 2) + ((b.fundingRaised || 0) / 10) - ((now - b.createdAt) / 86400000);
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
    const avgPain = totalRequests > 0 
      ? (chores.reduce((acc, c) => acc + (c.pain || 0), 0) / totalRequests).toFixed(1)
      : '0.0';

    return { totalRequests, totalVotes, totalFunded, totalGoal, avgPain };
  }, [chores]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>FixBoard — Blockchain-Verified E-Commerce Seller Demand Board</title>
        <meta name="description" content="Next.js and Ethereum Solidity demand board for small e-commerce sellers to vote and fund automated fixes with cryptographic audit trail." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header onOpenNewModal={() => setIsNewModalOpen(true)} />

      {/* Floating On-Chain Transaction Toast */}
      {recentTxNotification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--accent-emerald)',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '420px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            flexShrink: 0
          }}>
            <ShieldCheck size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {recentTxNotification.type}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {recentTxNotification.choreTitle}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontSize: '0.7rem' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>Tx: {formatAddress(recentTxNotification.txHash)}</span>
              <a 
                href={`https://sepolia.etherscan.io/tx/${recentTxNotification.txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}
              >
                <span>View on Etherscan</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        padding: '3.5rem 1.5rem 2.5rem',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 65%)'
      }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem'
          }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Ethereum Sepolia Testnet &bull; Free to use &bull; Solidity Audit Trail</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Stop losing hours to repetitive chores. <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Vote and fund fixes with Ethereum certainty.
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 1.5rem'
          }}>
            Generic app stores don't solve your specific catalog messes, return disputes, or sync bugs.
            FixBoard uses <strong>Solidity smart contracts</strong> on Ethereum to guarantee 1-wallet-1-vote integrity, 
            transparent escrow pledges, and tamper-proof Keccak-256 audit trails.
          </p>

          {/* Quick Blockchain Proof Badge Banner */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '2rem',
            cursor: 'pointer'
          }}
          onClick={() => setIsAuditModalOpen(true)}
          >
            <Lock size={14} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Contract <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{formatAddress(contractAddress)}</span> &bull; {auditTrail.length} On-Chain Events Verified
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.18)',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px'
            }}>
              Inspect Ledger &rarr;
            </span>
          </div>

          {/* Quick Metrics Ribbon */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            maxWidth: '740px',
            margin: '0 auto',
            padding: '1.25rem',
            borderRadius: '1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {stats.totalRequests}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Chores Hashed
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                {stats.totalVotes.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                On-Chain Votes
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ${stats.totalFunded.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Pledged Escrow
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {auditTrail.length}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Audit Entries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', width: '100%', flex: 1 }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-surface)',
            padding: '0.3rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'board', label: 'Demand Board', icon: Layers },
              { id: 'leaderboard', label: 'Top Picks', icon: Flame },
              { id: 'stats', label: 'Analytics Pulse', icon: TrendingUp },
              { id: 'blockchain', label: 'EVM Audit Trail', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'blockchain') {
                      setIsAuditModalOpen(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? 'var(--card-shadow)' : 'none'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--accent-primary)' : undefined} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Post CTA */}
          <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
            <span>Post a Chore</span>
          </button>
        </div>

        {/* Tab 1: Demand Board */}
        {activeTab === 'board' && (
          <div>
            {/* Filter & Search Toolbar */}
            <div className="glass-panel" style={{
              padding: '1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Search by chore, marketplace, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                {/* Sort dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpDown size={16} color="var(--text-muted)" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', cursor: 'pointer' }}
                  >
                    <option value="hot">🔥 Hot Score</option>
                    <option value="votes">👍 Most Voted</option>
                    <option value="funded">💰 Most Funded</option>
                    <option value="newest">🕒 Newest</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['all', 'open', 'funded', 'in-progress', 'solved'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        border: selectedStatus === st ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: selectedStatus === st ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                        color: selectedStatus === st ? 'var(--accent-primary)' : 'var(--text-muted)'
                      }}
                    >
                      {st.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories horizontal scroll pills */}
              <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.4rem 0.95rem',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: selectedCategory === cat.id ? 'none' : '1px solid var(--border-subtle)',
                      background: selectedCategory === cat.id ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-surface)',
                      color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Chore Cards */}
            {filteredChores.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredChores.map(chore => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    onSelect={(c) => setDetailChore(c)}
                    onOpenPledge={(c) => setPledgeChoreTarget(c)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
                <Search size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  No chores found matching your filters
                </h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Try resetting your category or search query, or post this chore to the board.
                </p>
                <button className="btn-secondary" onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              🏆 Top Community Picks
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              The highest-voted chores with urgent seller demand across multiple marketplaces, verified by Ethereum consensus.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...chores].sort((a, b) => b.votes - a.votes).map((chore, idx) => (
                <div 
                  key={chore.id}
                  onClick={() => setDetailChore(chore)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    width: '36px',
                    textAlign: 'center',
                    color: idx === 0 ? '#FBBF24' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : 'var(--text-muted)'
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {chore.title}
                      </h4>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-emerald)',
                        fontWeight: 700
                      }}>
                        Verified
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Posted by {chore.author}</span>
                      <span style={{ margin: '0 0.5rem' }}>&bull;</span>
                      <span style={{ textTransform: 'capitalize' }}>{chore.category}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {chore.votes} votes
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      ${chore.fundingRaised || 0} pledged
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Analytics Pulse */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Operational Pain Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                  const count = chores.filter(c => c.category === cat.id).length;
                  const pct = chores.length > 0 ? (count / chores.length) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span>{cat.label}</span>
                        <span style={{ fontWeight: 700 }}>{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--bg-surface)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '9999px', background: 'var(--accent-primary)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Workflow Resolution Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['open', 'funded', 'in-progress', 'solved'].map(st => {
                  const count = chores.filter(c => c.status === st).length;
                  const pct = chores.length > 0 ? (count / chores.length) * 100 : 0;
                  const color = st === 'funded' ? 'var(--accent-emerald)' :
                                st === 'in-progress' ? 'var(--accent-amber)' :
                                st === 'solved' ? 'var(--accent-cyan)' : 'var(--accent-primary)';
                  return (
                    <div key={st}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{st.replace('-', ' ')}</span>
                        <span style={{ fontWeight: 700 }}>{count} chores</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--bg-surface)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '9999px', background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

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

      {isNewModalOpen && (
        <NewChoreModal 
          onClose={() => setIsNewModalOpen(false)} 
        />
      )}

      <AuditTrailModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
      />
    </div>
  );
}
