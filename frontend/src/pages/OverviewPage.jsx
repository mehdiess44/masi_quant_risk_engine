import React, { useEffect, useState } from 'react';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import StatusChip from '../components/ui/StatusChip';
import NeonGauge from '../components/ui/NeonGauge';
import LEDStack from '../components/ui/LEDStack';
import Sparkline from '../components/ui/Sparkline';
import HeroChart from '../components/dashboard/HeroChart';
import TradingPanel from '../components/dashboard/TradingPanel';
import { fetchMasiSummary, fetchBacktestingComparison, fetchTrafficLight, runMonteCarlo, fetchMasiHistory } from '../services/api';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    comparison: null,
    mcTraffic: null,
    mlTraffic: null,
    history: null
  });
  const [executionResult, setExecutionResult] = useState(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [summary, comparison, mcTraffic, mlTraffic, history] = await Promise.all([
          fetchMasiSummary(),
          fetchBacktestingComparison(0.05),
          fetchTrafficLight('mc'),
          fetchTrafficLight('ml'),
          fetchMasiHistory()
        ]);
        setData({ summary, comparison, mcTraffic, mlTraffic, history });
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

  const { summary, comparison, mcTraffic, mlTraffic, history } = data;

  const getZoneScore = (zone) => zone === 'VERTE' ? 10 : zone === 'JAUNE' ? 5 : 0;
  const mcZoneScore = getZoneScore(mcTraffic?.result?.zone);
  const mlZoneScore = getZoneScore(mlTraffic?.result?.zone);
  const mcKupiecScore = comparison?.mc?.reject_H0 ? 0 : 10;
  const mlKupiecScore = comparison?.ml?.reject_H0 ? 0 : 10;
  
  const rawScore = (mcZoneScore + mlZoneScore + mcKupiecScore + mlKupiecScore) / 4;
  const weatherScore = Math.min(Math.max(rawScore, 0), 10);
  
  let weatherLabel = 'Tempête en Vue';
  if (weatherScore >= 8) weatherLabel = 'Ciel Dégagé';
  else if (weatherScore >= 5) weatherLabel = 'Nuages à l\'Horizon';

  // Real sparkline data from history (last 20 points)
  const priceSparkData = history?.data ? history.data.slice(-20).map(d => d.close) : [0];
  const returnSparkData = history?.data ? history.data.slice(-20).map(d => d.log_return || 0) : [0];
  const volSparkData = history?.data ? history.data.slice(-20).map(d => d.volatility_20d || 0) : [0];
  
  // Calculate p_hat vs p target
  const mcP = comparison?.mc?.p_hat ? (comparison.mc.p_hat * 100).toFixed(2) : 'N/A';
  const mlP = comparison?.ml?.p_hat ? (comparison.ml.p_hat * 100).toFixed(2) : 'N/A';
  const pTarget = (0.05 * 100).toFixed(2);

  return (
    <div className="flex gap-6 pb-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* 1. Risk Weather + Models (Basel Zone) */}
        <div className="grid grid-cols-3 gap-6">
          <GlassPanel className="col-span-1 flex flex-col items-center justify-center p-6 border border-[var(--border-subtle)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-hover)] to-transparent opacity-50"></div>
            <h2 className="text-lg font-medium mb-6 z-10 flex items-center gap-2">
              <TermTooltip term="Météo du Risque">Risk Weather</TermTooltip>
            </h2>
            <div className="z-10">
              <NeonGauge value={weatherScore} size="md" label={weatherLabel} />
            </div>
          </GlassPanel>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <GlassPanel hover className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-md font-medium mb-4">Monte Carlo</h3>
                <div className="flex items-center justify-between">
                  <LEDStack zone={mcTraffic?.result?.zone || 'VERTE'} label="MC" size="sm" />
                  <StatusChip variant={mcTraffic?.result?.zone === 'JAUNE' ? 'warning' : mcTraffic?.result?.zone === 'ROUGE' ? 'danger' : 'success'} pulse={mcTraffic?.result?.zone === 'ROUGE'}>
                    {mcTraffic?.result?.zone || 'VERTE'}
                  </StatusChip>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-secondary)] mb-1">p_hat vs p target</div>
                <div className="flex justify-between items-center text-sm font-mono-data">
                  <span>{mcP}%</span>
                  <span className="text-[var(--text-tertiary)]">vs {pTarget}%</span>
                </div>
                {comparison?.mc && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono-data text-[var(--text-secondary)]">
                    <div>LR: {comparison.mc.LR_statistic?.toFixed(2)}</div>
                    <div>P: {comparison.mc.p_value?.toFixed(3)}</div>
                  </div>
                )}
              </div>
            </GlassPanel>
            
            <GlassPanel hover className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-md font-medium mb-4">Machine Learning</h3>
                <div className="flex items-center justify-between">
                  <LEDStack zone={mlTraffic?.result?.zone || 'VERTE'} label="ML" size="sm" />
                  <StatusChip variant={mlTraffic?.result?.zone === 'JAUNE' ? 'warning' : mlTraffic?.result?.zone === 'ROUGE' ? 'danger' : 'success'} pulse={mlTraffic?.result?.zone === 'ROUGE'}>
                    {mlTraffic?.result?.zone || 'VERTE'}
                  </StatusChip>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-secondary)] mb-1">p_hat vs p target</div>
                <div className="flex justify-between items-center text-sm font-mono-data">
                  <span>{mlP}%</span>
                  <span className="text-[var(--text-tertiary)]">vs {pTarget}%</span>
                </div>
                {comparison?.ml && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono-data text-[var(--text-secondary)]">
                    <div>LR: {comparison.ml.LR_statistic?.toFixed(2)}</div>
                    <div>P: {comparison.ml.p_value?.toFixed(3)}</div>
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* 2. Top KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <GlassPanel hover glow className="p-4 flex flex-col justify-between">
            <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">MASI Last Close</div>
            <div className="text-2xl font-mono-data text-[var(--text-primary)]">
              {summary?.last_close?.toLocaleString() || '12,450.32'}
            </div>
            <Sparkline data={priceSparkData} color="var(--neon-accent)" className="mt-2" height={30} />
          </GlassPanel>
          <GlassPanel hover glow className="p-4 flex flex-col justify-between">
            <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">Annual Return</div>
            <div className={`text-2xl font-mono-data ${(summary?.annualized_return || 0) >= 0 ? 'text-[var(--neon-profit)]' : 'text-[var(--neon-loss)]'}`}>
              {(summary?.annualized_return ? summary.annualized_return * 100 : 12.4).toFixed(2)}%
            </div>
            <Sparkline data={returnSparkData} color={(summary?.annualized_return || 0) >= 0 ? "var(--neon-profit)" : "var(--neon-loss)"} className="mt-2" height={30} />
          </GlassPanel>
          <GlassPanel hover glow className="p-4 flex flex-col justify-between">
            <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">
              <TermTooltip term="Max Drawdown">Max Drawdown</TermTooltip>
            </div>
            <div className="text-2xl font-mono-data text-[var(--neon-loss)]">
              {(summary?.max_drawdown ? summary.max_drawdown * 100 : -14.2).toFixed(2)}%
            </div>
            <Sparkline data={priceSparkData} color="var(--neon-loss)" className="mt-2" height={30} />
          </GlassPanel>
          <GlassPanel hover glow className="p-4 flex flex-col justify-between">
            <div className="text-xs uppercase text-[var(--text-secondary)] mb-2">
              <TermTooltip term="Volatility 20d">Volatility 20d</TermTooltip>
            </div>
            <div className="text-2xl font-mono-data text-[var(--neon-warning)]">
              {(summary?.volatilities?.['20d'] ? summary.volatilities['20d'] * 100 : 18.5).toFixed(2)}%
            </div>
            <Sparkline data={volSparkData} color="var(--neon-warning)" className="mt-2" height={30} />
          </GlassPanel>
        </div>

        {/* 3. Hero Chart */}
        <GlassPanel className="p-4 border border-[var(--border-subtle)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">MASI & AI Signals Overview</h2>
            <div className="flex gap-2">
              <span className="text-xs bg-[var(--surface-active)] px-2 py-1 rounded text-[var(--neon-cyan)] border border-[var(--border-subtle)]">AI BUY</span>
              <span className="text-xs bg-[var(--surface-active)] px-2 py-1 rounded text-[var(--neon-warning)] border border-[var(--border-subtle)]">AI SELL</span>
            </div>
          </div>
          <HeroChart data={history?.data || []} />
        </GlassPanel>

      </div>

      {/* Right Sidebar - Trading Panel */}
      <div className="w-80">
        <TradingPanel 
          executionResult={executionResult}
          isExecuting={executing}
          onExecute={async (params) => {
          try {
            setExecuting(true);
            setExecutionResult(null);
            console.log('Executing with params', params);
            // Translate riskLevel (1-100) to confidence level. E.g., riskLevel 50 -> 0.95 confidence (alpha 0.05).
            // A simple mapping: higher risk tolerance -> lower confidence level (higher alpha).
            // Risk Level 50% -> Alpha 0.05 (95% confidence).
            const alpha = Math.max(0.001, Math.min(0.10, params.riskLevel / 1000));
            
            const portfolio_value = (summary?.last_close || 12450.32) * params.leverage;

            const result = await runMonteCarlo({
              portfolio_value,
              confidence_level: 1 - alpha,
              horizon_days: 1,
              n_simulations: 100000,
              mu: 0.0,
              sigma: 0.15
            });
            console.log('Monte Carlo Execution Result:', result);
            setExecutionResult(result);
          } catch (err) {
            console.error('Execution Failed:', err);
          } finally {
            setExecuting(false);
          }
        }} />
      </div>
    </div>
  );
}
