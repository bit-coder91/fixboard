import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WalletModal from './WalletModal';
import AuditTrailModal from './AuditTrailModal';
import NewChoreModal from './NewChoreModal';
import { useApp } from '../lib/AppContext';
import { Layers, ShieldCheck, Wallet, Plus, BarChart3 } from 'lucide-react';

export default function AppShell({
  children,
  title = 'Chore Board',
  subtitle = 'Community voting & Solidity audit trail',
  searchQuery = '',
  onSearchChange = () => {},
  activeTab = 'board',
  setActiveTab = () => {},
}) {
  const router = useRouter();
  const { auditTrail } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Desktop / Tablet Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            zIndex: 90,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '260px',
              height: '100%',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileMenuOpen(false)}
              onOpenWallet={() => {
                setIsWalletOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onOpenAudit={() => {
                setIsAuditOpen(true);
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          paddingBottom: '60px', // padding for mobile bottom bar
        }}
      >
        <TopBar
          title={title}
          subtitle={subtitle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenNewModal={() => setIsNewOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          auditCount={auditTrail?.length || 0}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (<720px) */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-default)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          padding: '0 8px',
        }}
      >
        <button
          onClick={() => {
            if (router.pathname !== '/') router.push('/');
            else setActiveTab('board');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'board' && router.pathname === '/' ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '10px',
            gap: '2px',
            cursor: 'pointer',
          }}
        >
          <Layers size={18} />
          <span>Chores</span>
        </button>

        <button
          onClick={() => setIsAuditOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: router.pathname === '/audit' ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '10px',
            gap: '2px',
            cursor: 'pointer',
          }}
        >
          <ShieldCheck size={18} />
          <span>Audit</span>
        </button>

        <button
          onClick={() => setIsNewOpen(true)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'var(--text-inverse)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            cursor: 'pointer',
          }}
          aria-label="Create Chore"
        >
          <Plus size={20} />
        </button>

        <button
          onClick={() => {
            if (router.pathname !== '/') router.push('/?tab=analytics');
            else setActiveTab('analytics');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '10px',
            gap: '2px',
            cursor: 'pointer',
          }}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setIsWalletOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '10px',
            gap: '2px',
            cursor: 'pointer',
          }}
        >
          <Wallet size={18} />
          <span>Wallet</span>
        </button>
      </nav>

      {/* Global Shared Modals */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <AuditTrailModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
      <NewChoreModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} />
    </div>
  );
}
