import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import GlowSlider from '../components/ui/GlowSlider';
import TraceabilityBadge from '../components/ui/TraceabilityBadge';
import { runMonteCarlo, fetchMonteCarloCalibration } from '../services/api';

export default function MonteCarloPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [params, setParams] = useState({
    alpha: 0.05,
    n_simulations: 100000,
    horizon_days: 1,
    portfolio_value: 12.38882,
    mu: 0.00032432,
    sigma: 0.00788724,
    custom_params: false,
    seed: 42
  });

  useEffect(() => {
    const initCalibration = async () => {
      try {
        const calib = await fetchMonteCarloCalibration();
        setParams(prev => ({
          ...prev,
          alpha: calib.alpha,
          n_simulations: calib.n_simulations,
          horizon_days: calib.horizon_days,
          portfolio_value: calib.S0,
          mu: calib.mu,
          sigma: calib.sigma,
          custom_params: false,
          seed: prev.seed !== undefined ? prev.seed : 42
        }));
      } catch (err) {
        console.error("Erreur chargement calibration:", err);
      }
    };
    initCalibration();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await runMonteCarlo(params);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [params]);

  const chartData = useMemo(() => {
    if (!data?.sample_paths || data.sample_paths.length === 0) return [];
    
    // Calculate medians and percentiles per step
    const steps = data.sample_paths[0].length;
    const paths = data.sample_paths;
    const result = [];
    
    for (let i = 0; i < steps; i++) {
      const valsAtStep = paths.map(p => p[i]).sort((a, b) => a - b);
      const p5 = valsAtStep[Math.floor(valsAtStep.length * 0.05)];
      const p25 = valsAtStep[Math.floor(valsAtStep.length * 0.25)];
      const median = valsAtStep[Math.floor(valsAtStep.length * 0.5)];
      const p75 = valsAtStep[Math.floor(valsAtStep.length * 0.75)];
      const p95 = valsAtStep[Math.floor(valsAtStep.length * 0.95)];
      result.push({ step: i, p5, p25, median, p75, p95 });
    }
    return result;
  }, [data?.sample_paths]);

  const histData = useMemo(() => {
    if (!data?.distribution_bins) return [];
    return data.distribution_bins.map(b => ({
      bin: (b.bin_start + b.bin_end) / 2,
      count: b.count
    }));
  }, [data?.distribution_bins]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Outfit'] flex items-center">
          <TermTooltip term="Monte Carlo">Simulation Monte Carlo</TermTooltip>
          <TraceabilityBadge metricId="var_mc" />
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(['var', 'es', 'var_pct', 'es_pct']).map(metric => {
          const val = data?.[metric] ?? 0;
          const isPct = metric.includes('pct');
          const displayVal = isPct ? `${(val * 100).toFixed(2)}%` : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
          const titleMap = { var: 'VaR MAD', es: 'ES MAD', var_pct: 'VaR %', es_pct: 'ES %' };
          const badgeId = metric.includes('es') ? 'es_mc' : 'var_mc';
          
          return (
            <GlassPanel key={metric} hover glow>
              <div className="text-xs uppercase text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                <TermTooltip term={titleMap[metric]}>{titleMap[metric]}</TermTooltip>
                <TraceabilityBadge metricId={badgeId} variant="short" />
              </div>
              <div className={`text-2xl font-['JetBrains_Mono'] ${loading ? 'animate-pulse opacity-50' : 'text-[var(--neon-loss)]'}`}>
                {displayVal}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 space-y-6">
          <GlassPanel>
            <h3 className="text-lg font-medium mb-4">Trajectoires (Bandes de Percentiles)</h3>
            <div className="h-[400px]">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-[var(--surface-raised)] rounded-[var(--radius-sm)]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="glowArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="bandArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="step" stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-void)', borderColor: 'var(--border-visible)', borderRadius: 'var(--radius-sm)' }}
                      itemStyle={{ fontFamily: 'JetBrains Mono' }}
                    />
                    <Area type="monotone" dataKey="p95" stroke="none" fill="url(#bandArea)" />
                    <Area type="monotone" dataKey="p5" stroke="none" fill="url(#bandArea)" />
                    <Area type="monotone" dataKey="median" stroke="var(--neon-cyan)" strokeWidth={2} fill="url(#glowArea)" />
                    <ReferenceLine y={data?.S0 || 0} stroke="var(--text-muted)" strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-lg font-medium mb-4">Distribution des Rendements</h3>
            <div className="h-[250px]">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-[var(--surface-raised)] rounded-[var(--radius-sm)]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="bin" stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} tickFormatter={(val) => (val * 100).toFixed(1) + '%'} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-void)', borderColor: 'var(--border-visible)', borderRadius: 'var(--radius-sm)' }}
                      labelFormatter={(val) => `Rendement: ${(val * 100).toFixed(2)}%`}
                    />
                    <Bar dataKey="count" fill="url(#histFill)" radius={[4, 4, 0, 0]} />
                    <ReferenceLine x={data?.var_pct} stroke="var(--neon-loss)" strokeWidth={2} label={{ value: 'VaR', fill: 'var(--neon-loss)', position: 'insideTopLeft' }} />
                    <ReferenceLine x={data?.es_pct} stroke="var(--neon-warning)" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'ES', fill: 'var(--neon-warning)', position: 'insideTopRight' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="col-span-1">
          <GlassPanel>
            <h3 className="text-lg font-medium mb-6">Paramètres</h3>
            <div className="space-y-6">
              <GlowSlider 
                min={0.01} max={0.10} step={0.01} 
                value={params.alpha} 
                onChange={(val) => setParams({...params, alpha: val})} 
                label="Alpha" 
                displayValue={params.alpha.toString()} 
              />
              <GlowSlider 
                min={10000} max={500000} step={10000} 
                value={params.n_simulations} 
                onChange={(val) => setParams({...params, n_simulations: val})} 
                label="Simulations (N)" 
                displayValue={params.n_simulations.toLocaleString()} 
              />
              <GlowSlider 
                min={1} max={10} step={1} 
                value={params.horizon_days} 
                onChange={(val) => setParams({...params, horizon_days: val})} 
                label="Horizon (Jours)" 
                displayValue={params.horizon_days.toString()} 
              />
              <GlowSlider 
                min={1} max={500} step={1} 
                value={params.portfolio_value || 12.38882} 
                onChange={(val) => setParams({...params, portfolio_value: val, custom_params: true})} 
                label="Valeur Portefeuille (S₀ MAD)" 
                displayValue={(params.portfolio_value || 12.38882).toFixed(2)} 
              />
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <span>Mode Audit (Reproductible)</span>
                    <TraceabilityBadge metricId="seed_42" variant="short" />
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Graine fixe (seed=42)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setParams({...params, seed: params.seed === 42 ? null : 42})}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${params.seed === 42 ? 'bg-[var(--neon-cyan)]' : 'bg-[var(--surface-hover)] border border-[var(--border-subtle)]'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${params.seed === 42 ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </GlassPanel>

          {data && (
            <GlassPanel className="mt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
                <span>Calibration Active</span>
                <TraceabilityBadge metricId="mu_calibrated" variant="short" />
              </h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1">S₀ (Initial) <TraceabilityBadge metricId="s0_calibrated" variant="short" /></span>
                  <span className="font-mono-data text-[var(--text-primary)]">{data.S0?.toFixed(5)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">µ (Rendement jour)</span>
                  <span className="font-mono-data text-[var(--text-primary)]">{(data.mu * 100)?.toFixed(6)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1">σ (Volatilité jour) <TraceabilityBadge metricId="sigma_calibrated" variant="short" /></span>
                  <span className="font-mono-data text-[var(--text-primary)]">{(data.sigma * 100)?.toFixed(6)}%</span>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-4">Percentiles (Retours)</h3>
              <div className="space-y-2">
                {['p1', 'p5', 'p10', 'p50', 'p90', 'p95', 'p99'].map(p => (
                  <div key={p} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)] uppercase">{p}</span>
                    <span className={`font-mono-data ${data.percentiles?.[p] < 0 ? 'text-[var(--neon-loss)]' : 'text-[var(--neon-profit)]'}`}>
                      {data.percentiles?.[p] ? (data.percentiles[p] * 100).toFixed(2) + '%' : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
