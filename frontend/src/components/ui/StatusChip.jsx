import React from 'react';

export default function StatusChip({ children, variant = 'info', pulse = false }) {
  const variants = {
    success: { bg: 'rgba(0,255,163,0.15)', text: 'var(--neon-profit)' },
    danger: { bg: 'rgba(255,45,85,0.15)', text: 'var(--neon-loss)' },
    warning: { bg: 'rgba(255,176,32,0.15)', text: 'var(--neon-warning)' },
    info: { bg: 'rgba(45,124,255,0.15)', text: 'var(--neon-accent)' }
  };

  const currentVariant = variants[variant] || variants.info;

  const style = {
    background: currentVariant.bg,
    color: currentVariant.text,
    borderRadius: 'var(--radius-full)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 500
  };

  return (
    <div style={style}>
      {pulse && (
        <span style={{ position: 'relative', display: 'flex', height: '6px', width: '6px' }}>
          <span style={{ 
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            position: 'absolute',
            display: 'inline-flex',
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            backgroundColor: currentVariant.text,
            opacity: 0.75
          }}></span>
          <span style={{
            position: 'relative',
            display: 'inline-flex',
            borderRadius: '50%',
            height: '6px',
            width: '6px',
            backgroundColor: currentVariant.text
          }}></span>
        </span>
      )}
      {children}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
