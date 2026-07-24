import React from 'react';

export default function GlassPanel({ children, className = '', hover = true, glow = false }) {
  const baseStyle = {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border-visible)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    transition: 'all 200ms ease-out',
    boxShadow: glow ? '0 0 10px var(--neon-accent)' : 'none',
  };

  const hoverStyle = `
    .glass-panel-hover:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45,124,255,0.15);
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <div 
        className={`glass-panel ${hover ? 'glass-panel-hover' : ''} ${className}`}
        style={baseStyle}
      >
        {children}
      </div>
    </>
  );
}
