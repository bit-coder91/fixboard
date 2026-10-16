/* ============================================================
   FixBoard — Java Spring Boot Powered Frontend
   ============================================================ */

// ── API Base & Endpoints ────────────────────────────────────
const API_BASE = '/api/chores';

const CATEGORY_META = {
  catalog: { emoji: '📦', label: 'Catalog Cleanup', color: '#6366F1' },
  returns: { emoji: '🔄', label: 'Return Handling', color: '#A855F7' },
  sync: { emoji: '🔗', label: 'Marketplace Sync', color: '#22D3EE' },
  listings: { emoji: '📝', label: 'Listing Errors', color: '#EC4899' },
  pricing: { emoji: '💰', label: 'Pricing', color: '#FBBF24' },
  shipping: { emoji: '🚚', label: 'Shipping', color: '#34D399' },
  other: { emoji: '🧩', label: 'Other', color: '#F87171' },
};

const PAIN_LABELS = ['', 'Minor annoyance', 'Noticeable drag', 'Significant time waste', 'Major blocker', 'Hair-on-fire crisis'];
const PAIN_EMOJIS = ['', '😐', '😕', '😣', '😤', '🤯'];

// ── Client Voting State (Track user's personal vote toggles) ─
const VOTED_KEY = 'fixboard_user_voted_ids';
let userVotedIds = loadUserVotedIds();

function loadUserVotedIds() {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUserVotedIds() {
  localStorage.setItem(VOTED_KEY, JSON.stringify(userVotedIds));
}

// ── In-Memory Cached State ──────────────────────────────────
let currentChores = [];
let currentStats = null;

// ── DOM References ──────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const boardGrid = $('#board-grid');
const boardEmpty = $('#board-empty');
const searchInput = $('#search-input');
const sortSelect = $('#sort-select');
const heroStats = {
  requests: $('#stat-requests'),
  votes: $('#stat-votes'),
  funded: $('#stat-funded'),
};

// ── Utilities ───────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return 'recently';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatCurrency(amount) {
  if (!amount) return '$0';
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k';
  return '$' + amount;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'success') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${escapeHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ── Hero Floating Particles ─────────────────────────────────
function initParticles() {
  const container = $('#hero-particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    const colors = ['#6366F1', '#A855F7', '#EC4899', '#22D3EE'];
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100 + 50}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: ${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ── Fetch & Animate Stats ───────────────────────────────────
async function fetchAndRenderHeroStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    currentStats = await res.json();
    animateCounter(heroStats.requests, currentStats.totalRequests);
    animateCounter(heroStats.votes, currentStats.totalVotes);
    animateCounter(heroStats.funded, currentStats.totalFunded, true);
  } catch (err) {
    console.warn('Hero stats error:', err);
  }
}

function animateCounter(el, target, isCurrency = false) {
  if (!el) return;
  const duration = 1000;
  const start = performance.now();
  const from = parseInt(el.textContent.replace(/[$,k]/g, '')) || 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (target - from) * eased);
    el.textContent = isCurrency ? formatCurrency(current) : current.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Card Rendering ──────────────────────────────────────────
function renderCard(req, index) {
  const cat = CATEGORY_META[req.category] || CATEGORY_META.other;
  const pct = req.fundingGoal ? Math.min(100, Math.round((req.fundingRaised / req.fundingGoal) * 100)) : 0;
  const isVoted = userVotedIds.includes(req.id);

  return `
    <article class="card" data-id="${req.id}" style="animation-delay: ${index * 0.04}s">
      <div class="card__header">
        <span class="card__category" style="color: ${cat.color}">${cat.emoji} ${cat.label}</span>
        <span class="card__status card__status--${req.status}">${req.status.replace('-', ' ')}</span>
      </div>
      <h3 class="card__title">${escapeHtml(req.title)}</h3>
      <p class="card__desc">${escapeHtml(req.description)}</p>
      <div class="card__pain">
        <span>${PAIN_EMOJIS[req.pain] || '😐'}</span>
        <div class="card__pain-dots">
          ${[1,2,3,4,5].map(i => `<div class="card__pain-dot ${i <= req.pain ? 'active' : ''}"></div>`).join('')}
        </div>
        <span>${PAIN_LABELS[req.pain] || ''}</span>
      </div>
      ${req.platforms && req.platforms.length ? `
        <div class="card__platforms">
          ${req.platforms.map(p => `<span class="card__platform-tag">${escapeHtml(p)}</span>`).join('')}
        </div>
      ` : ''}
      ${req.fundingGoal ? `
        <div class="card__funding">
          <div class="card__funding-header">
            <span class="card__funding-raised">${formatCurrency(req.fundingRaised)} raised</span>
            <span class="card__funding-goal">of ${formatCurrency(req.fundingGoal)}</span>
          </div>
          <div class="card__funding-bar">
            <div class="card__funding-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      ` : ''}
      <div class="card__footer">
        <div class="card__meta">
          <div class="card__author">
            <div class="card__avatar">${getInitials(req.author)}</div>
            <span>${escapeHtml(req.author)}</span>
          </div>
          <span>${timeAgo(req.createdAt)}</span>
        </div>
        <div class="card__actions">
          <button class="card__vote-btn ${isVoted ? 'voted' : ''}" data-action="vote" data-id="${req.id}" title="Upvote (persisted in Java backend)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isVoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 4L4 12H8V20H16V12H20L12 4Z"/></svg>
            ${req.votes}
          </button>
          <button class="card__fund-btn" data-action="fund" data-id="${req.id}" title="Pledge funds">
            💰
          </button>
        </div>
      </div>
    </article>
  `;
}

// ── Board Fetch & Render from Spring Boot API ───────────────
async function fetchAndRenderBoard() {
  const activeCategory = $('.filter-pills .pill.active')?.dataset.category || 'all';
  const activeStatus = $('.status-filter .status-pill.active')?.dataset.status || 'all';
  const query = searchInput.value.trim();
  const sort = sortSelect.value;

  const params = new URLSearchParams();
  if (activeCategory !== 'all') params.set('category', activeCategory);
  if (activeStatus !== 'all') params.set('status', activeStatus);
  if (query) params.set('search', query);
  if (sort) params.set('sort', sort);

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch from backend');
    currentChores = await res.json();

    if (currentChores.length === 0) {
      boardGrid.innerHTML = '';
      boardEmpty.classList.remove('hidden');
    } else {
      boardEmpty.classList.add('hidden');
      boardGrid.innerHTML = currentChores.map((r, i) => renderCard(r, i)).join('');
    }
  } catch (err) {
    console.error('API Error:', err);
    showToast('Failed to connect to Java backend API: ' + err.message, 'error');
  }

  fetchAndRenderHeroStats();
}

// ── Voting via Java REST API ────────────────────────────────
async function handleVote(id) {
  const numId = Number(id);
  const isCurrentlyVoted = userVotedIds.includes(numId);
  const unvote = isCurrentlyVoted;

  try {
    const res = await fetch(`${API_BASE}/${numId}/vote?unvote=${unvote}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Vote API failed');
    const updated = await res.json();

    if (unvote) {
      userVotedIds = userVotedIds.filter(v => v !== numId);
      showToast('Vote removed');
    } else {
      userVotedIds.push(numId);
      showToast(`Upvoted "${updated.title.slice(0, 35)}…"`);
    }
    saveUserVotedIds();

    // Update in-memory and re-render card
    const targetIdx = currentChores.findIndex(c => c.id === numId);
    if (targetIdx !== -1) {
      currentChores[targetIdx] = updated;
    }
    fetchAndRenderBoard();
  } catch (err) {
    showToast('Failed to record vote: ' + err.message, 'error');
  }
}

// ── View Switching ──────────────────────────────────────────
function switchView(viewName) {
  $$('.header__nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewName));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${viewName}`));

  if (viewName === 'leaderboard') renderLeaderboard();
  if (viewName === 'stats') renderStats();
}

// ── Leaderboard from Java Backend ───────────────────────────
async function renderLeaderboard() {
  const container = $('#leaderboard-list');
  container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Loading top picks from Spring Boot...</p>';

  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to load leaderboard');
    const sorted = await res.json();

    container.innerHTML = sorted.map((r, i) => {
      const cat = CATEGORY_META[r.category] || CATEGORY_META.other;
      const rankClass = i < 3 ? ` lb-rank--${i + 1}` : '';
      return `
        <div class="lb-item" data-id="${r.id}">
          <div class="lb-rank${rankClass}">${i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}</div>
          <div class="lb-content">
            <div class="lb-title">${escapeHtml(r.title)}</div>
            <div class="lb-meta">
              <span>${cat.emoji} ${cat.label}</span>
              <span>by ${escapeHtml(r.author)}</span>
              <span>${timeAgo(r.createdAt)}</span>
            </div>
          </div>
          <div class="lb-stats">
            <div class="lb-stat">
              <div class="lb-stat-num" style="color: var(--accent-indigo)">${r.votes}</div>
              <div class="lb-stat-label">Votes</div>
            </div>
            <div class="lb-stat">
              <div class="lb-stat-num" style="color: var(--accent-green)">${formatCurrency(r.fundingRaised)}</div>
              <div class="lb-stat-label">Funded</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.lb-item').forEach(item => {
      item.addEventListener('click', () => openDetail(item.dataset.id));
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--accent-red);text-align:center;">${err.message}</p>`;
  }
}

// ── Stats from Java Backend ─────────────────────────────────
async function renderStats() {
  const container = $('#stats-grid');
  container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Calculating metrics via JPA...</p>';

  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    const s = await res.json();

    const catCounts = s.categoryCounts || {};
    const maxCatCount = Math.max(...Object.values(catCounts), 1);
    const statusCounts = s.statusCounts || {};
    const painCounts = s.painCounts || {};

    const statusColors = {
      open: '#6366F1',
      funded: '#34D399',
      'in-progress': '#FBBF24',
      solved: '#22D3EE',
    };

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__title">Total Chores</div>
        <div class="stat-card__value" style="color: var(--accent-indigo)">${s.totalRequests}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">Total Votes</div>
        <div class="stat-card__value" style="color: var(--accent-purple)">${s.totalVotes.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">Total Funded</div>
        <div class="stat-card__value" style="color: var(--accent-green)">${formatCurrency(s.totalFunded)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">Avg Pain Level</div>
        <div class="stat-card__value" style="color: var(--accent-red)">${s.avgPain} ${PAIN_EMOJIS[Math.round(s.avgPain)] || '😐'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">By Category</div>
        <div class="stat-card__bar-group">
          ${Object.entries(catCounts).sort((a,b) => b[1] - a[1]).map(([cat, count]) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.other;
            return `
              <div class="stat-bar">
                <div class="stat-bar__label">${meta.emoji} ${meta.label}</div>
                <div class="stat-bar__track">
                  <div class="stat-bar__fill" style="width: ${(count/maxCatCount)*100}%; background: ${meta.color}"></div>
                </div>
                <div class="stat-bar__count">${count}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">By Status</div>
        <div class="stat-card__bar-group">
          ${Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).map(([status, count]) => `
            <div class="stat-bar">
              <div class="stat-bar__label" style="text-transform: capitalize">${status.replace('-', ' ')}</div>
              <div class="stat-bar__track">
                <div class="stat-bar__fill" style="width: s.totalRequests > 0 ? (count/s.totalRequests)*100 : 0}%; background: ${statusColors[status] || '#6366F1'}"></div>
              </div>
              <div class="stat-bar__count">${count}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">Pain Distribution</div>
        <div class="stat-card__bar-group">
          ${[5,4,3,2,1].map(level => {
            const count = painCounts[level] || 0;
            return `
              <div class="stat-bar">
                <div class="stat-bar__label">${PAIN_EMOJIS[level]} Lv ${level}</div>
                <div class="stat-bar__track">
                  <div class="stat-bar__fill" style="width: ${s.totalRequests > 0 ? (count/s.totalRequests)*100 : 0}%; background: hsl(${(5-level)*20}, 80%, 55%)"></div>
                </div>
                <div class="stat-bar__count">${count}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__title">Funding Progress</div>
        <div class="stat-card__value" style="color: var(--accent-cyan)">${s.totalGoal > 0 ? Math.round((s.totalFunded / s.totalGoal) * 100) : 0}%</div>
        <div class="stat-bar">
          <div class="stat-bar__label">Overall</div>
          <div class="stat-bar__track">
            <div class="stat-bar__fill" style="width: ${s.totalGoal > 0 ? (s.totalFunded / s.totalGoal) * 100 : 0}%; background: var(--gradient-success)"></div>
          </div>
          <div class="stat-bar__count">${formatCurrency(s.totalGoal)}</div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--accent-red);text-align:center;">${err.message}</p>`;
  }
}

// ── Detail Modal ────────────────────────────────────────────
async function openDetail(id) {
  const content = $('#detail-content');
  content.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Fetching chore details from Java backend...</p>';
  openModal('detail-overlay');

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Chore not found');
    const req = await res.json();

    const cat = CATEGORY_META[req.category] || CATEGORY_META.other;
    const pct = req.fundingGoal ? Math.min(100, Math.round((req.fundingRaised / req.fundingGoal) * 100)) : 0;
    const isVoted = userVotedIds.includes(req.id);

    content.innerHTML = `
      <div class="detail__header">
        <div class="detail__category" style="color: ${cat.color}">${cat.emoji} ${cat.label}</div>
        <h2 class="detail__title">${escapeHtml(req.title)}</h2>
        <div class="detail__meta">
          <div class="detail__meta-item">
            <div class="card__avatar" style="width:24px;height:24px;font-size:0.65rem">${getInitials(req.author)}</div>
            ${escapeHtml(req.author)}
          </div>
          <div class="detail__meta-item">🕒 ${timeAgo(req.createdAt)}</div>
          <div class="detail__meta-item">${PAIN_EMOJIS[req.pain] || '😐'} ${PAIN_LABELS[req.pain] || ''}</div>
          <div class="detail__meta-item">
            <span class="card__status card__status--${req.status}">${req.status.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      <div class="detail__body">${escapeHtml(req.description)}</div>

      ${req.platforms && req.platforms.length ? `
        <div class="detail__platforms">
          ${req.platforms.map(p => `<span class="card__platform-tag">${escapeHtml(p)}</span>`).join('')}
        </div>
      ` : ''}

      ${req.fundingGoal ? `
        <div class="detail__funding">
          <div class="detail__funding-header">
            <span style="color: var(--accent-green); font-weight: 700">${formatCurrency(req.fundingRaised)} raised</span>
            <span style="color: var(--text-muted)">of ${formatCurrency(req.fundingGoal)} goal (${pct}%)</span>
          </div>
          <div class="detail__funding-bar">
            <div class="detail__funding-fill" style="width: ${pct}%"></div>
          </div>
          <div class="detail__backers">${req.backers || 0} backers</div>
        </div>
      ` : ''}

      <div class="detail__actions">
        <button class="btn ${isVoted ? 'btn--primary' : 'btn--ghost'}" id="detail-vote-btn" data-id="${req.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isVoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 4L4 12H8V20H16V12H20L12 4Z"/></svg>
          ${isVoted ? 'Voted' : 'Upvote'} (${req.votes})
        </button>
        <button class="btn btn--ghost" id="detail-fund-btn" data-id="${req.id}">
          💰 Pledge Funds
        </button>
      </div>

      <div>
        <div class="detail__comments-title">💬 Discussion (${(req.comments || []).length})</div>
        <div class="detail__comment-form">
          <input type="text" class="detail__comment-input" id="detail-comment-input" placeholder="Add feedback or discussion…" maxlength="500" />
          <button class="btn btn--primary btn--sm" id="detail-comment-submit" data-id="${req.id}">Post</button>
        </div>
        <div class="detail__comments-list">
          ${(req.comments || []).map(c => `
            <div class="comment">
              <div class="comment__header">
                <span class="comment__author">${escapeHtml(c.author)}</span>
                <span class="comment__time">${timeAgo(c.createdAt)}</span>
              </div>
              <div class="comment__text">${escapeHtml(c.text)}</div>
            </div>
          `).join('')}
          ${(!req.comments || req.comments.length === 0) ? '<p style="color: var(--text-muted); font-size: var(--fs-sm)">No discussion yet. Start the conversation!</p>' : ''}
        </div>
      </div>
    `;

    $('#detail-vote-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await handleVote(req.id);
      openDetail(req.id);
    });

    $('#detail-fund-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal('detail-overlay');
      openPledge(req.id, req.title);
    });

    $('#detail-comment-submit').addEventListener('click', async (e) => {
      e.stopPropagation();
      const input = $('#detail-comment-input');
      const text = input.value.trim();
      if (!text) return;

      try {
        const res = await fetch(`${API_BASE}/${req.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: 'Seller Community', text })
        });
        if (!res.ok) throw new Error('Failed to post comment');
        showToast('Comment saved to database!');
        openDetail(req.id);
      } catch (err) {
        showToast('Error posting comment: ' + err.message, 'error');
      }
    });

  } catch (err) {
    content.innerHTML = `<p style="color:var(--accent-red);">${err.message}</p>`;
  }
}

// ── Pledge Modal ────────────────────────────────────────────
function openPledge(id, title) {
  $('#pledge-id').value = id;
  $('#pledge-chore-name').textContent = `Pledging toward: "${title}"`;
  $('#pledge-amount').value = '';
  $('#pledge-name').value = '';
  openModal('pledge-overlay');
}

// ── Modal Display Helpers ───────────────────────────────────
function openModal(overlayId) {
  $(`#${overlayId}`).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlayId) {
  $(`#${overlayId}`).classList.remove('open');
  document.body.style.overflow = '';
}

// ── Debounce ────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Initialization & Events ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  fetchAndRenderBoard();

  // Navigation tabs
  $$('.header__nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Modal Triggers
  $('#btn-new-request').addEventListener('click', () => openModal('modal-overlay'));
  $('#hero-cta').addEventListener('click', () => openModal('modal-overlay'));
  $('#hero-browse').addEventListener('click', () => {
    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
  });

  // Close modals
  $('#modal-close').addEventListener('click', () => closeModal('modal-overlay'));
  $('#detail-close').addEventListener('click', () => closeModal('detail-overlay'));
  $('#pledge-close').addEventListener('click', () => closeModal('pledge-overlay'));

  ['modal-overlay', 'detail-overlay', 'pledge-overlay'].forEach(id => {
    $(`#${id}`).addEventListener('click', (e) => {
      if (e.target.id === id) closeModal(id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['modal-overlay', 'detail-overlay', 'pledge-overlay'].forEach(id => closeModal(id));
    }
  });

  // Category filter pills
  $$('.filter-pills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.filter-pills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      fetchAndRenderBoard();
    });
  });

  // Status filter pills
  $$('.status-filter .status-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.status-filter .status-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      fetchAndRenderBoard();
    });
  });

  // Search input with debounce
  searchInput.addEventListener('input', debounce(fetchAndRenderBoard, 250));

  // Sort dropdown
  sortSelect.addEventListener('change', fetchAndRenderBoard);

  // Clear filters
  $('#btn-clear-filters').addEventListener('click', () => {
    searchInput.value = '';
    sortSelect.value = 'hot';
    $$('.filter-pills .pill').forEach(p => p.classList.remove('active'));
    $('.filter-pills .pill[data-category="all"]').classList.add('active');
    $$('.status-filter .status-pill').forEach(p => p.classList.remove('active'));
    $('.status-filter .status-pill[data-status="all"]').classList.add('active');
    fetchAndRenderBoard();
  });

  // Board card click delegation
  boardGrid.addEventListener('click', (e) => {
    const voteBtn = e.target.closest('[data-action="vote"]');
    if (voteBtn) {
      e.stopPropagation();
      handleVote(voteBtn.dataset.id);
      return;
    }
    const fundBtn = e.target.closest('[data-action="fund"]');
    if (fundBtn) {
      e.stopPropagation();
      const card = e.target.closest('.card');
      const title = card ? card.querySelector('.card__title').textContent : '';
      openPledge(fundBtn.dataset.id, title);
      return;
    }
    const card = e.target.closest('.card');
    if (card) {
      openDetail(card.dataset.id);
    }
  });

  // Pain Level Selector
  $$('.pain-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.pain-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $('#req-pain').value = btn.dataset.pain;
    });
  });

  // Input Character Counters
  $('#req-title').addEventListener('input', (e) => {
    $('#title-count').textContent = `${e.target.value.length}/120`;
  });
  $('#req-desc').addEventListener('input', (e) => {
    $('#desc-count').textContent = `${e.target.value.length}/1000`;
  });

  // Submit New Chore -> POST /api/chores
  $('#form-new-request').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('#req-title').value.trim();
    const desc = $('#req-desc').value.trim();
    const category = $('#req-category').value;
    const pain = parseInt($('#req-pain').value);
    const fundingGoal = parseInt($('#req-funding').value) || 0;
    const platforms = $('#req-platforms').value.split(',').map(p => p.trim()).filter(Boolean);
    const author = $('#req-author').value.trim();

    if (!title || !desc || !category || !pain || !author) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          category,
          pain,
          fundingGoal,
          platforms,
          author
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create chore');
      }

      const created = await res.json();
      userVotedIds.push(created.id);
      saveUserVotedIds();

      e.target.reset();
      $$('.pain-btn').forEach(b => b.classList.remove('active'));
      $('#req-pain').value = '';
      $('#title-count').textContent = '0/120';
      $('#desc-count').textContent = '0/1000';

      closeModal('modal-overlay');
      switchView('board');
      fetchAndRenderBoard();
      showToast(`Chore persisted in Java backend: "${title.slice(0, 35)}…"`);
    } catch (err) {
      showToast('Error creating chore: ' + err.message, 'error');
    }
  });

  // Submit Pledge -> POST /api/chores/{id}/pledge
  $('#form-pledge').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('#pledge-id').value;
    const amount = parseInt($('#pledge-amount').value);
    const name = $('#pledge-name').value.trim();

    if (!amount || amount < 1 || !name) {
      showToast('Please provide valid pledge details', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}/pledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, backerName: name })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Pledge processing failed');
      }

      const updated = await res.json();
      closeModal('pledge-overlay');
      fetchAndRenderBoard();
      showToast(`💰 $${amount} pledge received by Java backend! (Total: ${formatCurrency(updated.fundingRaised)})`);
    } catch (err) {
      showToast('Error submitting pledge: ' + err.message, 'error');
    }
  });

  // Brand Logo Click
  $('#logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('board');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
