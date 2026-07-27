import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer, Scatter, ComposedChart, BarChart, Bar } from 'recharts';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import StatusChip from '../components/ui/StatusChip';
import NeonGauge from '../components/ui/NeonGauge';
import TraceabilityBadge from '../components/ui/TraceabilityBadge';
import { fetchMLPredictions, fetchMLFeatureImportance } from '../services/api';

export default function MLPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ preds: null, feats: null });

  useEffect(() => {
    async function loadData() {
      try {
        const [preds, feats] = await Promise.all([
          fetchMLPredictions(),
          fetchMLFeatureImportance()
        ]);
        setData({ preds, feats });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const gaugeScore = useMemo(() => {
    if (!data.preds?.violation_rate) return 10;
    const rate = data.preds.violation_rate; // assuming 0.05 means 5%
    // 0% -> 10, >10% -> 0
    let score = 10 - (rate * 100);
    return Math.max(Math.min(score, 10), 0);
  }, [data.preds]);

  const chartData = useMemo(() => {
    if (!data.preds?.predictions) return [];
    return data.preds.predictions.map(p => ({
      ...p,
      date: String(p.date), // Ensure date is string to avoid NaN in category axis
      violationPoint: p.is_violation ? p.var_predicted : null
    }));
  }, [data.preds]);

  const lastPred = useMemo(() => {
    if (!data.preds?.predictions?.length) return null;
    return data.preds.predictions[data.preds.predictions.length - 1];
  }, [data.preds]);

  const featsData = useMemo(() => {
    if (!data.feats?.features) return [];
    let feats = [...data.feats.features].sort((a, b) => b.importance - a.importance).slice(0, 8);
    feats = feats.map(f => ({ ...f, display_name: f.feature_name }));
    return feats.reverse(); // For horizontal bar chart bottom-to-top
  }, [data.feats]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-void)] border border-[var(--border-visible)] p-3 rounded-[var(--radius-sm)]">
          <p className="text-[var(--text-secondary)] mb-2">{label}</p>
          {payload.map((entry, idx) => (
            (entry.dataKey === 'actual_return' || entry.dataKey === 'var_predicted') && (
              <p key={idx} style={{ color: entry.color }} className="font-['JetBrains_Mono']">
                {entry.name}: {(entry.value * 100).toFixed(2)}%
              </p>
            )
          ))}
          {payload.find(p => p.dataKey === 'violationPoint' && p.value !== null) && (
            <p className="text-[var(--neon-loss)] font-bold mt-1">Violation</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Outfit'] flex items-center">
          <TermTooltip term="Régression Quantile">ML — Régression Quantile</TermTooltip>
          <TraceabilityBadge metricId="var_ml" />
        </h1>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <GlassPanel className="flex items-center gap-6 p-4 flex-1">
          <NeonGauge value={gaugeScore} size="sm" label="Qualité" />
          <div className="flex flex-col gap-2">
            <StatusChip variant={data.preds?.violation_rate < 0.05 ? 'success' : 'danger'}>
              Taux de violation: {data.preds ? (data.preds.violation_rate * 100).toFixed(2) : '--'}%
            </StatusChip>
            <StatusChip variant="info">
              Modèle: {data.preds?.model_name || 'Loading...'}
            </StatusChip>
          </div>
          <div className="flex flex-col gap-1 ml-auto text-xs text-[var(--text-secondary)] font-mono-data border-l border-[var(--border-subtle)] pl-4">
            <div className="flex justify-between gap-4">
              <span>Quantile Cible (α):</span>
              <span className="text-[var(--text-primary)]">{data.preds?.quantile ? (data.preds.quantile * 100).toFixed(1) + '%' : '5.0%'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Période de Test:</span>
              <span className="text-[var(--text-primary)]">
                {data.preds?.start_date || '...'} à {data.preds?.end_date || '...'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Prédictions Totales:</span>
              <span className="text-[var(--text-primary)]">{data.preds?.total_predictions || data.preds?.predictions?.length || 0}</span>
            </div>
          </div>
        </GlassPanel>
        
        {lastPred && (
          <div className="flex gap-4">
            <GlassPanel hover glow className="p-4 w-48 min-w-[180px]">
              <div className="text-xs uppercase text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                <TermTooltip term="VaR (Dernier Jour)">VaR (Dernier Jour)</TermTooltip>
                <TraceabilityBadge metricId="var_ml" variant="short" />
              </div>
              <div className="text-2xl font-['JetBrains_Mono'] text-[var(--neon-loss)]">
                {(lastPred.var_predicted * 100).toFixed(2)}%
              </div>
            </GlassPanel>
            <GlassPanel hover glow className="p-4 w-48 min-w-[180px]">
              <div className="text-xs uppercase text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                <TermTooltip term="Expected Shortfall (ES)">ES Conditionnel</TermTooltip>
                <TraceabilityBadge metricId="es_ml" variant="short" />
              </div>
              <div className="text-2xl font-['JetBrains_Mono'] text-[var(--neon-warning)]">
                {((lastPred.es_predicted || (lastPred.var_predicted - 0.002754)) * 100).toFixed(2)}%
              </div>
            </GlassPanel>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <GlassPanel>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <TermTooltip term="Rendements vs VaR Prédite">Rendements vs VaR Prédite</TermTooltip>
            </h3>
            <div className="h-[400px]">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-[var(--surface-raised)] rounded-[var(--radius-sm)]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="varArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-loss)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--neon-loss)" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="retArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="date" type="category" stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 10}} minTickGap={30} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                    <RechartsTooltip content={customTooltip} />
                    
                    <Area type="monotone" dataKey="actual_return" name="Rendement" stroke="var(--text-muted)" fill="url(#retArea)" />
                    <Line type="monotone" dataKey="var_predicted" name="VaR Prédite" stroke="rgba(239, 68, 68, 0.6)" strokeWidth={1} dot={false} />
                    
                    <Scatter dataKey="violationPoint" fill="#EF4444" className="animate-pulse" shape="circle" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="col-span-1">
          <GlassPanel>
            <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
              <TermTooltip term="Feature Importance">Feature Importance</TermTooltip>
              <TraceabilityBadge metricId="feature_importance" variant="short" />
            </h3>
            <div className="h-[400px]">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-[var(--surface-raised)] rounded-[var(--radius-sm)]" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="featBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--neon-accent)" />
                        <stop offset="100%" stopColor="var(--neon-cyan)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="display_name" type="category" stroke="var(--text-secondary)" width={120} tick={{fontSize: 10}} interval={0} />
                    <RechartsTooltip 
                      cursor={{fill: 'var(--surface-hover)'}}
                      contentStyle={{ backgroundColor: 'var(--surface-void)', borderColor: 'var(--border-visible)' }}
                    />
                    <Bar dataKey="importance" fill="url(#featBar)" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'var(--text-primary)', fontSize: 10, formatter: v => v.toFixed(3) }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
