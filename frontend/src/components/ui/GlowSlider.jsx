import React, { useRef, useEffect, useState } from 'react';

export default function GlowSlider({ min = 0, max = 100, step = 1, value = 50, onChange, label, displayValue, formatValue }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let rawValue = min + percent * (max - min);
    rawValue = Math.round(rawValue / step) * step;
    return rawValue;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    onChange(calculateValue(e.clientX));
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    onChange(calculateValue(e.touches[0].clientX));
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) onChange(calculateValue(e.clientX));
    };
    const handleTouchMove = (e) => {
      if (isDragging) onChange(calculateValue(e.touches[0].clientX));
    };
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, min, max, step, onChange]);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%', fontFamily: 'Outfit, sans-serif' }}>
      {(label || displayValue !== undefined) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
          <span>{label}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatValue ? formatValue(value) : displayValue ?? value}</span>
        </div>
      )}
      <div 
        ref={trackRef}
        style={{
          position: 'relative',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--surface-active)',
          borderRadius: 'var(--radius-full)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent}%`,
            background: 'linear-gradient(to right, var(--neon-accent), var(--neon-cyan))',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 0 8px var(--neon-accent)'
          }}></div>
        </div>
        <div style={{
          position: 'absolute',
          left: `calc(${percent}% - 10px)`,
          width: '20px',
          height: '20px',
          background: 'var(--neon-accent)',
          border: '2px solid var(--surface-void)',
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--neon-accent)',
          transition: isDragging ? 'none' : 'left 150ms ease-out'
        }}>
          {isDragging && (
            <div style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--surface-glass)',
              color: 'var(--text-primary)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border-visible)'
            }}>
              {formatValue ? formatValue(value) : value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
