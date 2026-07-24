import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMode } from '../../context/ModeContext';

export default function Sidebar() {
  const { isAdvanced, toggleMode } = useMode();

  return (
    <div className="w-[220px] h-screen fixed left-0 top-0 flex flex-col justify-between" 
         style={{ background: 'var(--surface-void)', borderRight: '1px solid var(--border-subtle)' }}>
      <div>
        <div className="p-6 mb-4">
          <h1 className="text-3xl font-bold font-['Outfit']" style={{ color: 'var(--text-primary)' }}>MASI</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Quant Risk Engine</p>
        </div>
        <nav className="flex flex-col gap-2 px-4">
          <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-150 ${isActive ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border-l-3 border-[var(--neon-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}>
            Vue d'ensemble
          </NavLink>
          <NavLink to="/montecarlo" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-150 ${isActive ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border-l-3 border-[var(--neon-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}>
            Monte Carlo
          </NavLink>
          <NavLink to="/ml" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-150 ${isActive ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border-l-3 border-[var(--neon-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}>
            ML / Intelligence
          </NavLink>
          <NavLink to="/compliance" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-150 ${isActive ? 'bg-[var(--surface-active)] text-[var(--text-primary)] border-l-3 border-[var(--neon-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}>
            Bâle III
          </NavLink>
        </nav>
      </div>
      
      <div className="p-6 flex flex-col gap-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_var(--neon-profit)]" style={{ background: 'var(--neon-profit)' }}></div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>API Live</span>
        </div>
      </div>
    </div>
  );
}
