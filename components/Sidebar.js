import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import { formatAddress } from '../lib/web3';
import ThemeToggle from './ThemeToggle';
import {
  Layers,
  ShieldCheck,
  BarChart3,
  Hash,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function Sidebar({
  activeTab = 'board',
  setActiveTab = () => {},
  isCollapsed = false,
  setIsCollapsed = () => {},
  onOpenWallet = () => {},
  onOpenAudit = () => {},
}) {
  const router = useRouter();
  const { chores, auditTrail, wallet, isFirebaseConnected } = useApp();

  const navItems = [
    {
      id: 'board',
      label: 'Chore Board',
      icon: <Layers size={18} />,
      badge: chores?.length || 0,
      href: '/',
    },
    {
      id: 'audit',
      label: 'Audit Ledger',
      icon: <ShieldCheck size={18} />,
      badge: auditTrail?.length || 0,
      href: '/audit',
    },
    {
      id: 'analytics',
      label: 'Seller Analytics',
      icon: <BarChart3 size={18} />,
      onClick: () => {
        if (router.pathname !== '/') {
          router.push('/?tab=analytics');
        } else {
          setActiveTab('analytics');
        }
      },
    },
    {
      id: 'verifier',
      label: 'Hash Verifier',
      icon: <Hash size={18} />,
      onClick: () => {
        if (router.pathname !== '/') {
          router.push('/?tab=verifier');
        } else {
          setActiveTab('verifier');
        }
      },
    },
  ];

  return (
    <aside
      className="fixboard-sidebar"
      style={{
        width: isCollapsed ? '64px' : '240px',
        minWidth: isCollapsed ? '64px' : '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
        overflowX: 'hidden',
      }}
    >
      {/* Top section: Brand & Nav */}
      <div>
        {/* Brand header */}
        <div
          style={{
            height: '56px',
            padding: isCollapsed ? '0 12px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            >
              F
            </div>
            {!isCollapsed && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    FixBoard
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Ops
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                  Seller Chores & EVM
                </div>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav aria-label="Main Navigation" style={{ padding: '12px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isCurrent =
                (item.href && router.pathname === item.href) ||
                (router.pathname === '/' && activeTab === item.id);

              const content = (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    gap: '10px',
                    padding: isCollapsed ? '10px' : '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--bg-active)' : 'transparent',
                    color: isCurrent ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: isCurrent ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    textDecoration: 'none',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isCurrent ? 'var(--accent)' : 'inherit' }}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        background: isCurrent ? 'var(--accent-subtle)' : 'var(--bg-surface-alt)',
                        color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={item.id} onClick={item.onClick}>
                  {content}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom section: Connectivity, Wallet, Theme */}
      <div style={{ padding: isCollapsed ? '12px 8px' : '16px', borderTop: '1px solid var(--border-subtle)' }}>
        {!isCollapsed && (
          <>
            {/* Quick Node/DB Health status */}
            <div
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                marginBottom: '12px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>NETWORK</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success-text)', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
                  Sepolia EVM
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>STORAGE</span>
                <span style={{ color: isFirebaseConnected ? 'var(--success-text)' : 'var(--text-secondary)' }}>
                  {isFirebaseConnected ? 'Cloud Synced' : 'Local + Offline'}
                </span>
              </div>
            </div>

            {/* Wallet Quick Access */}
            <button
              onClick={onOpenWallet}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={15} color="var(--accent)" />
                <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                  {wallet.address ? formatAddress(wallet.address) : 'Connect Web3'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  background: 'var(--accent-subtle)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {wallet.balance} SEP
              </span>
            </button>

            {/* Theme Toggle */}
            <div style={{ marginTop: '8px' }}>
              <ThemeToggle />
            </div>
          </>
        )}

        {isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenWallet}
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-default)',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--accent)',
              }}
              title="Open Wallet"
            >
              <Wallet size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
