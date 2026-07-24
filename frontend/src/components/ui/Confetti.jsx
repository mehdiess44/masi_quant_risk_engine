import React, { useEffect, useRef } from 'react';

export default function Confetti({ trigger, duration = 2000, particleCount = 50 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = [
      getComputedStyle(document.documentElement).getPropertyValue('--neon-profit').trim() || '#00FFA3',
      getComputedStyle(document.documentElement).getPropertyValue('--neon-cyan').trim() || '#00D4FF',
      getComputedStyle(document.documentElement).getPropertyValue('--neon-accent').trim() || '#2D7CFF',
      getComputedStyle(document.documentElement).getPropertyValue('--neon-warning').trim() || '#FFB020'
    ];
    
    let particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.3 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 1) * 10 - 5,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        type: Math.random() > 0.5 ? 'circle' : 'rect',
        opacity: 1
      });
    }
    
    let animationId;
    const startTime = Date.now();
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = 1 - progress;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        
        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size, -p.size/2, p.size * 2, p.size);
        }
        ctx.restore();
      });
      
      if (progress < 1) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    render();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [trigger, duration, particleCount]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100
      }}
    />
  );
}
