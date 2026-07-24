import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer, Scatter, ComposedChart, BarChart, Bar } from 'recharts';
import TermTooltip from '../components/ui/TermTooltip';
import GlassPanel from '../components/ui/GlassPanel';
import StatusChip from '../components/ui/StatusChip';
import NeonGauge from '../components/ui/NeonGauge';
import { useMode } from '../context/ModeContext';
import { fetchMLPredictions, fetchMLFeatureImportance } from '../services/api';

export default function MLPage() {
  const { isAdvanced } = useMode();
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
      violation_point: p.is_violation ? p.actual_return : null
    }));
  }, [data.preds]);

  const featsData = useMemo(() => {
    if (!data.feats?.features) return [];
    let feats = [...data.feats.features].sort((a, b) => b.importance - a.importance).slice(0, 8);
    if (!isAdvanced) {
      feats = feats.map(f => {
        let name = f.feature_name;
        if (name.includes('EWMA_Vol')) name = 'Volatilité récente';
        if (name.includes('return_lag')) name = 'Rendement historique';
        return { ...f, display_name: name };
      });
    } else {
      feats = feats.map(f => ({ ...f, display_name: f.feature_name }));
    }
    return feats.reverse(); // For horizontal bar chart bottom-to-top
  }, [data.feats, isAdvanced]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-void)] border border-[var(--border-visible)] p-3 rounded-[var(--radius-sm)]">
          <p className="text-[var(--text-secondary)] mb-2">{label}</p>
          {payload.map((entry, idx) => (
            entry.dataKey !== 'violation_point' && (
              <p key={idx} style={{ color: entry.color }} className="font-['JetBrains_Mono']">
                {entry.name}: {(entry.value * 100).toFixed(2)}%
              </p>
            )
          ))}
          {payload.find(p => p.dataKey === 'violation_point' && p.value !== null) && (
            <p className="text-[var(--neon-loss)] font-bold mt-1">Violation</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold font-['Outfit']">
          <TermTooltip term="Régression Quantile">ML — Régression Quantile</TermTooltip>
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <GlassPanel className="flex items-center gap-6 p-4">
          <NeonGauge value={gaugeScore} size="sm" label="Qualité" />
          <div className="flex flex-col gap-2">
            <StatusChip variant={data.preds?.violation_rate < 0.05 ? 'success' : 'danger'}>
              Taux de violation: {data.preds ? (data.preds.violation_rate * 100).toFixed(2) : '--'}%
            </StatusChip>
            <StatusChip variant="info">
              Modèle: {data.preds?.model_name || 'Loading...'}
            </StatusChip>
          </div>
        </GlassPanel>
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
                    <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 10}} minTickGap={30} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                    <RechartsTooltip content={customTooltip} />
                    
                    <Area type="monotone" dataKey="actual_return" name="Rendement" stroke="var(--text-muted)" fill="url(#retArea)" />
                    <Area type="monotone" dataKey="var_predicted" name="VaR Prédite" stroke="var(--neon-loss)" strokeWidth={1} fill="url(#varArea)" />
                    
                    <Scatter dataKey="violation_point" fill="var(--neon-loss)" className="animate-pulse" shape="circle" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="col-span-1">
          <GlassPanel>
            <h3 className="text-lg font-medium mb-4">
              <TermTooltip term="Feature Importance">Feature Importance</TermTooltip>
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
