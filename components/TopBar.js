import React from 'react';
import { Plus, ShieldCheck, Search, Menu } from 'lucide-react';

export default function TopBar({
  title = 'Chore Board',
  subtitle = 'Community voting & Solidity audit trail',
  searchQuery = '',
  onSearchChange = () => {},
  onOpenNewModal = () => {},
  onOpenAudit = () => {},
  auditCount = 0,
  onToggleMobileMenu = () => {},
}) {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile hamburger & Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Menu"
          className="mobile-only-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'none',
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Search input */}
      <div
        style={{
          flex: 1,
          maxWidth: '420px',
          position: 'relative',
        }}
      >
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="search"
          placeholder="Filter chores by title, tag, or creator..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '34px',
            paddingLeft: '32px',
            paddingRight: '12px',
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 120ms ease, box-shadow 120ms ease',
          }}
        />
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenAudit}
          className="btn-secondary"
          style={{
            height: '34px',
            padding: '0 12px',
            fontSize: '12px',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
          title="Open Blockchain Audit Ledger"
        >
          <ShieldCheck size={15} color="var(--success)" />
          <span className="hide-on-mobile">Audit Trail</span>
          {auditCount > 0 && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                background: 'var(--success-subtle)',
                color: 'var(--success-text)',
                padding: '1px 5px',
                borderRadius: '9999px',
              }}
            >
              {auditCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNewModal}
          className="btn-primary"
          style={{
            height: '34px',
            padding: '0 14px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          <span>Post Chore</span>
        </button>
      </div>
    </header>
  );
}
