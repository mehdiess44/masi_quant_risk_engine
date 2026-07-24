import React, { useEffect, useState } from 'react';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import StatusChip from '../components/ui/StatusChip';
import NeonGauge from '../components/ui/NeonGauge';
import LEDStack from '../components/ui/LEDStack';
import Confetti from '../components/ui/Confetti';
import GlowSlider from '../components/ui/GlowSlider';
import { useMode } from '../context/ModeContext';
import { fetchBacktestingComparison, fetchTrafficLight, fetchKupiecTest } from '../services/api';

export default function CompliancePage() {
  const { isAdvanced } = useMode();
  const [alpha, setAlpha] = useState(0.05);
  const [windowSize, setWindowSize] = useState(250);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [comp, mcTraf, mlTraf, mcKup, mlKup] = await Promise.all([
          fetchBacktestingComparison(alpha),
          fetchTrafficLight('mc', windowSize, alpha),
          fetchTrafficLight('ml', windowSize, alpha),
          fetchKupiecTest('mc', alpha),
          fetchKupiecTest('ml', alpha)
        ]);
        setData({ comp, mcTraf, mlTraf, mcKup, mlKup });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [alpha, windowSize]);

  if (loading || !data) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-[var(--surface-raised)] rounded-[var(--radius-sm)]"></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-[250px] bg-[var(--surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]"></div>
          <div className="h-[250px] bg-[var(--surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]"></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-[180px] bg-[var(--surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]"></div>
          <div className="h-[180px] bg-[var(--surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]"></div>
        </div>
      </div>
    );
  }

  const { comp, mcTraf, mlTraf, mcKup, mlKup } = data || {};
  const bothPass = !comp?.mc?.reject_H0 && !comp?.ml?.reject_H0;

  const renderKupiecCard = (modelName, modelData) => {
    if (!modelData) return null;
    const passed = !modelData.reject_H0;
    // Map LR to 0-10 gauge score (lower is better, <3.84 is passing for 95% conf)
    const lrVal = modelData.LR_statistic || 0;
    let score = 10 - (lrVal * 1.5);
    score = Math.max(0, Math.min(10, score));

    return (
      <GlassPanel hover glow>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-medium">{modelName}</h3>
          {comp?.best_model?.toLowerCase().includes(modelName.toLowerCase().split(' ')[0]) && (
            <StatusChip variant="info" pulse>★ Best Model</StatusChip>
          )}
        </div>
        <div className="flex gap-8 items-center">
          <NeonGauge value={score} size="md" label="LR Stat Score" />
          <div className="flex-1">
            <div className={`text-2xl font-bold mb-4 ${passed ? 'text-[var(--neon-profit)]' : 'text-[var(--neon-loss)]'}`}>
              {passed ? 'APPROUVÉ' : 'REJETÉ'}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)] font-['JetBrains_Mono']">
              <div className="flex justify-between">
                <span><TermTooltip term="LR Statistic">LR Stat</TermTooltip></span>
                <span>{lrVal.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span><TermTooltip term="P-Value">p-value</TermTooltip></span>
                <span>{modelData.p_value?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>N (obs)</span>
                <span>{modelData.N || 1265}</span>
              </div>
              <div className="flex justify-between">
                <span>x (fails)</span>
                <span>{modelData.x || 0}</span>
              </div>
              <div className="flex justify-between">
                <span><TermTooltip term="p_hat (Observé)">p̂ (obs)</TermTooltip></span>
                <span>{modelData.p_hat ? (modelData.p_hat * 100).toFixed(2) + '%' : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span><TermTooltip term="p (Cible)">p (cible)</TermTooltip></span>
                <span>{modelData.p ? (modelData.p * 100).toFixed(2) + '%' : '5.00%'}</span>
              </div>
            </div>
            {modelData.verdict && (
              <div className="mt-4 text-xs text-[var(--text-tertiary)] italic border-t border-[var(--border-subtle)] pt-2">
                "{modelData.verdict}"
              </div>
            )}
          </div>
        </div>
      </GlassPanel>
    );
  };

  const renderHitSequence = (title, kupData) => {
    if (!kupData?.hit_sequence) return null;
    return (
      <div className="mt-8">
        <h4 className="text-md font-medium mb-3">
          <TermTooltip term="Hit Sequence">{title} Hit Sequence</TermTooltip>
        </h4>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12px, 1fr))' }}>
          {kupData.hit_sequence.map((hit, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-sm ${hit.is_violation ? 'bg-red-500' : 'bg-[#1A2235]'}`}
              title={hit.is_violation ? 'Violation' : 'Pass'}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      <Confetti trigger={bothPass} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Outfit']">
          <TermTooltip term="Bâle III">Conformité Bâle III</TermTooltip>
        </h1>
      </div>

      <GlassPanel className="p-4">
        <h3 className="text-sm font-medium mb-4 text-[var(--text-secondary)] uppercase tracking-wider">Paramètres de Backtesting</h3>
        <div className="flex gap-8">
          <div className="flex-1">
            <GlowSlider 
              min={0.01} max={0.10} step={0.01} 
              value={alpha} 
              onChange={setAlpha} 
              label="Alpha (Niveau de confiance)" 
              displayValue={alpha.toString()} 
            />
          </div>
          <div className="flex-1">
            <GlowSlider 
              min={100} max={500} step={10} 
              value={windowSize} 
              onChange={setWindowSize} 
              label="Fenêtre Glissante (Jours)" 
              displayValue={windowSize.toString()} 
            />
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 gap-6">
        <GlassPanel hover>
          <div className="flex flex-col items-center justify-center py-6">
            <h3 className="text-lg mb-6">Zone Bâle - MC</h3>
            <LEDStack zone={mcTraf?.result?.zone} label="Monte Carlo" size="md" />
            <div className="mt-6 flex flex-col items-center">
              <StatusChip variant={mcTraf?.result?.zone === 'VERTE' ? 'success' : mcTraf?.result?.zone === 'JAUNE' ? 'warning' : 'danger'}>
                {mcTraf?.result?.zone || 'N/A'}
              </StatusChip>
              {mcTraf?.result && (
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--text-secondary)] font-mono-data border border-[var(--border-subtle)] p-3 rounded bg-[var(--surface-active)]">
                  <span className="text-right">Exceptions :</span>
                  <span className="text-[var(--text-primary)]">{mcTraf.result.n_exceptions}</span>
                  <span className="text-right">Seuil Vert (≤) :</span>
                  <span className="text-[var(--neon-profit)]">{mcTraf.result.green_threshold}</span>
                  <span className="text-right">Seuil Jaune (<) :</span>
                  <span className="text-[var(--neon-warning)]">{mcTraf.result.yellow_threshold}</span>
                  <span className="text-right font-bold mt-1">Multiplicateur :</span>
                  <span className="text-[var(--text-primary)] font-bold mt-1">×{mcTraf.result.capital_multiplier?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </GlassPanel>
        <GlassPanel hover>
          <div className="flex flex-col items-center justify-center py-6">
            <h3 className="text-lg mb-6">Zone Bâle - ML</h3>
            <LEDStack zone={mlTraf?.result?.zone} label="Machine Learning" size="md" />
            <div className="mt-6 flex flex-col items-center">
              <StatusChip variant={mlTraf?.result?.zone === 'VERTE' ? 'success' : mlTraf?.result?.zone === 'JAUNE' ? 'warning' : 'danger'}>
                {mlTraf?.result?.zone || 'N/A'}
              </StatusChip>
              {mlTraf?.result && (
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--text-secondary)] font-mono-data border border-[var(--border-subtle)] p-3 rounded bg-[var(--surface-active)]">
                  <span className="text-right">Exceptions :</span>
                  <span className="text-[var(--text-primary)]">{mlTraf.result.n_exceptions}</span>
                  <span className="text-right">Seuil Vert (≤) :</span>
                  <span className="text-[var(--neon-profit)]">{mlTraf.result.green_threshold}</span>
                  <span className="text-right">Seuil Jaune (<) :</span>
                  <span className="text-[var(--neon-warning)]">{mlTraf.result.yellow_threshold}</span>
                  <span className="text-right font-bold mt-1">Multiplicateur :</span>
                  <span className="text-[var(--text-primary)] font-bold mt-1">×{mlTraf.result.capital_multiplier?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderKupiecCard('Monte Carlo', comp?.mc)}
        {renderKupiecCard('Machine Learning', comp?.ml)}
      </div>

      <GlassPanel>
        <h3 className="text-lg font-medium mb-2">Analyse Détaillée (Hit Sequences)</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-4">Répartition des dépassements de la VaR sur la période de backtesting.</p>
        {renderHitSequence('Monte Carlo', mcKup)}
        {renderHitSequence('Machine Learning', mlKup)}
      </GlassPanel>
    </div>
  );
}
