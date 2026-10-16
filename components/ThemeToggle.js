import React from 'react';
import { useTheme } from '../lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-alt)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        width: '100%',
        maxWidth: '220px',
      }}
    >
      {options.map((opt) => {
        const isSelected = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(opt.value)}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '5px 8px',
              fontSize: '12px',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
              background: isSelected ? 'var(--bg-surface)' : 'transparent',
              border: isSelected ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
