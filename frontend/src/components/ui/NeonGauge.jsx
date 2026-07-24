import React, { useEffect, useState } from 'react';

export default function NeonGauge({ value = 0, size = 'xl', label, icon, className = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1000;
    const startValue = displayValue;
    let animationId;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(startValue + (value - startValue) * easeOutQuart);
      if (progress < 1) {
        animationId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    animationId = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [value]);

  const sizes = {
    sm: { width: 80, stroke: 8, fontSize: '16px' },
    md: { width: 120, stroke: 10, fontSize: '24px' },
    xl: { width: 240, stroke: 12, fontSize: '48px' }
  };
  const config = sizes[size] || sizes.xl;
  
  let startColor = 'var(--neon-profit)';
  let endColor = '#00B371';
  if (value <= 3) {
    startColor = 'var(--neon-loss)';
    endColor = '#CC0033';
  } else if (value <= 7) {
    // Robotter AI gradient for neutral/warning
    startColor = 'var(--neon-cyan)';
    endColor = '#B000FF'; // Cyberpunk Magenta
  }

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  // Span 240 degrees out of 360 = 2/3 of circumference
  const arcLength = circumference * (240 / 360);
  const strokeDasharray = `${arcLength} ${circumference}`;
  
  // Calculate offset based on value (0-10)
  const normalizedValue = Math.max(0, Math.min(10, value));
  const progress = normalizedValue / 10;
  const strokeDashoffset = arcLength * (1 - progress);

  return (
    <div className={className} style={{ width: config.width, height: config.width, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={config.width} height={config.width} viewBox="0 0 200 200" style={{ position: 'absolute', transform: 'rotate(150deg)' }}>
        <defs>
          <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        
        {/* Track */}
        <circle 
          cx="100" cy="100" r={radius} 
          fill="none" 
          stroke="var(--surface-active)" 
          strokeWidth={config.stroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
        
        {/* Arc */}
        <circle 
          cx="100" cy="100" r={radius} 
          fill="none" 
          stroke={`url(#gradient-${size})`}
          strokeWidth={config.stroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#glow-${size})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease-out' }}
        />
      </svg>
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10%' }}>
        <span className="font-mono-data" style={{ fontWeight: 'bold', fontSize: config.fontSize, color: 'var(--text-primary)', lineHeight: 1 }}>
          {displayValue.toFixed(1)}
        </span>
        {icon && <span style={{ marginTop: '4px', fontSize: size === 'xl' ? '24px' : '16px' }}>{icon}</span>}
        {label && <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-secondary)', fontSize: size === 'xl' ? '14px' : '10px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>}
      </div>
    </div>
  );
}
