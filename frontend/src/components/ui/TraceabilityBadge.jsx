import React, { useState, useRef, useEffect } from 'react';
import { getTraceability } from '../../services/traceability_catalog';

export default function TraceabilityBadge({ metricId, variant = 'full' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const info = getTraceability(metricId);

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

      setPos({ top, left });
    }
  }, [isVisible]);

  return (
    <span className="inline-block ml-2 align-middle">
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-data font-medium bg-[var(--surface-raised)] border border-[var(--border-visible)] text-[var(--text-secondary)] hover:text-[var(--neon-accent)] hover:border-[var(--neon-accent)] transition-all cursor-help shadow-sm"
        title="Traçabilité R&D et Bâle III"
      >
        <span className="text-[var(--neon-accent)]">📜</span>
        {variant === 'full' ? (
          <span>{info.notebook.split('_')[0]} • {info.cell.split(' ')[0]} {info.cell.split(' ')[1]}</span>
        ) : (
          <span>R&D</span>
        )}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            width: '320px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--neon-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.15)',
            color: 'var(--text-primary)',
            fontFamily: 'Outfit, sans-serif',
            textAlign: 'left',
            animation: 'fadeIn 150ms ease-out',
            pointerEvents: 'none'
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-visible)]">
            <span className="text-xs font-bold text-[var(--neon-accent)] uppercase tracking-wider flex items-center gap-1">
              <span>🔍 Traçabilité R&D</span>
            </span>
            <span className="text-[10px] font-mono-data px-1.5 py-0.2 bg-[var(--surface-raised)] rounded text-[var(--text-secondary)]">
              Source de Vérité
            </span>
          </div>

          <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {info.label}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
            {info.description}
          </p>

          <div className="space-y-2 text-xs bg-[var(--surface-raised)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] font-mono-data">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[var(--text-muted)]">Notebook & Cellule :</span>
              <span className="text-[var(--neon-profit)] font-medium break-all">{info.notebook}</span>
              <span className="text-[var(--text-primary)] text-[11px]">{info.cell}</span>
            </div>

            <div className="flex flex-col gap-0.5 pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)]">Formule Mathématique :</span>
              <span className="text-[var(--neon-warning)] font-bold text-[11px] tracking-wide">{info.formula}</span>
            </div>

            <div className="flex flex-col gap-0.5 pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)]">Conformité / Réglementation :</span>
              <span className="text-[var(--neon-accent)] text-[11px]">{info.regulation}</span>
            </div>
          </div>
        </div>
      )}
    </span >
  );
}
