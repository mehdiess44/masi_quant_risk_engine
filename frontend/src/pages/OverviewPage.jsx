import React, { useEffect, useState } from 'react';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import StatusChip from '../components/ui/StatusChip';
import NeonGauge from '../components/ui/NeonGauge';
import LEDStack from '../components/ui/LEDStack';
import { useMode } from '../context/ModeContext';
import { fetchMasiSummary, fetchBacktestingComparison, fetchTrafficLight } from '../services/api';

export default function OverviewPage() {
  const { isAdvanced } = useMode();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    comparison: null,
    mcTraffic: null,
    mlTraffic: null
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [summary, comparison, mcTraffic, mlTraffic] = await Promise.all([
          fetchMasiSummary(),
          fetchBacktestingComparison(0.05),
          fetchTrafficLight('mc'),
          fetchTrafficLight('ml')
        ]);
        setData({ summary, comparison, mcTraffic, mlTraffic });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-[var(--surface-raised)]" />)}
        </div>
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-raised)] animate-pulse" />
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 rounded-[var(--radius-lg)] bg-[var(--surface-raised)]" />
          <div className="h-32 rounded-[var(--radius-lg)] bg-[var(--surface-raised)]" />
        </div>
      </div>
    );
  }

  const { summary, comparison, mcTraffic, mlTraffic } = data;

  const getZoneScore = (zone) => zone === 'VERTE' ? 10 : zone === 'JAUNE' ? 5 : 0;
  const mcZoneScore = getZoneScore(mcTraffic?.result?.zone);
  const mlZoneScore = getZoneScore(mlTraffic?.result?.zone);
  const mcKupiecScore = comparison?.mc?.reject_H0 ? 0 : 10;
  const mlKupiecScore = comparison?.ml?.reject_H0 ? 0 : 10;
  
  const rawScore = (mcZoneScore + mlZoneScore + mcKupiecScore + mlKupiecScore) / 4;
  const weatherScore = Math.min(Math.max(rawScore, 0), 10);
  
  let weatherLabel = '🌩️ Tempête en Vue';
  if (weatherScore >= 8) weatherLabel = '☀️ Ciel Dégagé';
  else if (weatherScore >= 5) weatherLabel = '⛅ Nuages à l\'Horizon';

  return (
    <div className="space-y-8 pb-8">
      <div className="grid grid-cols-4 gap-4">
        <GlassPanel hover glow>
          <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">MASI Last Close</div>
          <div className="text-2xl font-['JetBrains_Mono']">{summary?.last_close?.toLocaleString()}</div>
        </GlassPanel>
        <GlassPanel hover glow>
          <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">Annual Return</div>
          <div className={`text-2xl font-['JetBrains_Mono'] ${(summary?.annualized_return || 0) >= 0 ? 'text-[var(--neon-profit)]' : 'text-[var(--neon-loss)]'}`}>
            {(summary?.annualized_return * 100).toFixed(2)}%
          </div>
        </GlassPanel>
        <GlassPanel hover glow>
          <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">
            <TermTooltip term="Max Drawdown">Max Drawdown</TermTooltip>
          </div>
          <div className="text-2xl font-['JetBrains_Mono'] text-[var(--neon-loss)]">
            {(summary?.max_drawdown * 100).toFixed(2)}%
          </div>
        </GlassPanel>
        <GlassPanel hover glow>
          <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">
            <TermTooltip term="Volatility 20d">Volatility 20d</TermTooltip>
          </div>
          <div className="text-2xl font-['JetBrains_Mono']">
            {(summary?.volatilities?.['20d'] * 100).toFixed(2)}%
          </div>
        </GlassPanel>
      </div>

      <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[var(--radius-lg)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-hover)] to-transparent opacity-50"></div>
        <h2 className="text-xl font-medium mb-8 z-10 flex items-center gap-2">
          <TermTooltip term="Météo du Risque">Météo du Risque</TermTooltip>
        </h2>
        <div className="z-10">
          <NeonGauge value={weatherScore} size="xl" label={weatherLabel} />
        </div>
        <p className="mt-6 text-[var(--text-secondary)] z-10 text-center max-w-md">
          {weatherScore >= 8 ? 'Les modèles indiquent un niveau de risque sous contrôle.' : weatherScore >= 5 ? 'Vigilance requise sur certains indicateurs de marché.' : 'Risque élevé, réévaluation des modèles recommandée.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassPanel hover>
          <h3 className="text-lg font-medium mb-4">Monte Carlo</h3>
          <div className="flex items-center justify-between">
            <LEDStack zone={mcTraffic?.result?.zone} label="MC" size="md" />
            <StatusChip variant={mcTraffic?.result?.zone === 'VERTE' ? 'success' : mcTraffic?.result?.zone === 'JAUNE' ? 'warning' : 'danger'} pulse={mcTraffic?.result?.zone === 'ROUGE'}>
              {mcTraffic?.result?.zone}
            </StatusChip>
          </div>
          {isAdvanced && comparison?.mc && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-4 gap-2 text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)]">
              <div>LR: {comparison.mc.LR_statistic?.toFixed(2)}</div>
              <div>P: {comparison.mc.p_value?.toFixed(3)}</div>
              <div>N: {comparison.mc.N}</div>
              <div>x: {comparison.mc.x}</div>
            </div>
          )}
        </GlassPanel>
        
        <GlassPanel hover>
          <h3 className="text-lg font-medium mb-4">Machine Learning</h3>
          <div className="flex items-center justify-between">
            <LEDStack zone={mlTraffic?.result?.zone} label="ML" size="md" />
            <StatusChip variant={mlTraffic?.result?.zone === 'VERTE' ? 'success' : mlTraffic?.result?.zone === 'JAUNE' ? 'warning' : 'danger'} pulse={mlTraffic?.result?.zone === 'ROUGE'}>
              {mlTraffic?.result?.zone}
            </StatusChip>
          </div>
          {isAdvanced && comparison?.ml && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-4 gap-2 text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)]">
              <div>LR: {comparison.ml.LR_statistic?.toFixed(2)}</div>
              <div>P: {comparison.ml.p_value?.toFixed(3)}</div>
              <div>N: {comparison.ml.N}</div>
              <div>x: {comparison.ml.x}</div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
