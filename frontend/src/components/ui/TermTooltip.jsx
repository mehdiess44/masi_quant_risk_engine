import React, { useState, useRef, useEffect } from 'react';
import { glossary } from '../../data/glossary';

export default function TermTooltip({ term, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const termData = glossary[term] || { fullName: term, definition: 'Definition not found.', analogy: 'No analogy available.', emoji: '❓', source: 'Unknown' };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      
      if (top < 0) {
        top = triggerRect.bottom + 8;
      }
      
      if (left < 0) {
        left = 8;
      } else if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      
      setTooltipPos({ top, left });
    }
  }, [isVisible]);

  return (
    <>
      <span 
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        style={{ borderBottom: '1px dotted var(--neon-accent)', cursor: 'help' }}
      >
        {children}
      </span>
      {isVisible && (
        <div 
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            zIndex: 50,
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-visible)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            width: 'max-content',
            maxWidth: '300px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            color: 'var(--text-primary)',
            fontFamily: 'Outfit, sans-serif',
            animation: 'fadeInUp 150ms ease-out',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {termData.emoji} {termData.fullName}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            {termData.definition}
          </div>
          <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>
            💡 {termData.analogy}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Source: {termData.source}
          </div>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: 'var(--surface-glass)',
            borderRight: '1px solid var(--border-visible)',
            borderBottom: '1px solid var(--border-visible)',
          }} />
        </div>
      )}
    </>
  );
}
