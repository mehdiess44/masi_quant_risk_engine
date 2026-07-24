import React from 'react';

export default function LEDStack({ zone = 'VERTE', label, size = 'md' }) {
  const widths = { md: 60, lg: 80 };
  const w = widths[size] || 60;
  const h = w * 2.5;
  const r = w * 0.3;

  const leds = [
    { type: 'ROUGE', color: 'var(--neon-loss)', cy: w * 0.5 },
    { type: 'JAUNE', color: 'var(--neon-warning)', cy: w * 1.25 },
    { type: 'VERTE', color: 'var(--neon-profit)', cy: w * 2.0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <filter id="led-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {leds.map((led, i) => (
            <radialGradient key={i} id={`grad-${led.type}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="40%" stopColor={led.color} />
              <stop offset="100%" stopColor="var(--surface-void)" />
            </radialGradient>
          ))}
        </defs>
        
        <rect x="0" y="0" width={w} height={h} rx={w * 0.25} fill="var(--surface-raised)" stroke="var(--border-visible)" strokeWidth="2" />
        
        {leds.map(led => {
          const isActive = zone === led.type;
          return (
            <g key={led.type}>
              {isActive && (
                <circle 
                  cx={w / 2} cy={led.cy} r={r} 
                  fill={led.color} 
                  filter="url(#led-glow)" 
                  style={{ animation: 'ledPulse 2s infinite' }}
                />
              )}
              <circle 
                cx={w / 2} cy={led.cy} r={r} 
                fill={`url(#grad-${led.type})`}
                opacity={isActive ? 1 : 0.15}
                stroke={isActive ? 'none' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
      {label && (
        <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      )}
      <style>{`
        @keyframes ledPulse {
          0%, 100% { transform: scale(1); transform-origin: center; opacity: 1; }
          50% { transform: scale(1.1); transform-origin: center; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
