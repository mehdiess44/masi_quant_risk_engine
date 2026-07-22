import React, { useEffect, useState } from 'react';
import { fetchMasiSummary } from '../../services/api';

export default function Q1_MarketParams({ params, setParams }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasiSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => {
    setParams(p => ({ ...p, [key]: Number(val) }));
  };

  return (
    <div className="dense-panel h-full relative">
      <div className="font-bold text-xs text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
        <span>Market Parameters</span>
        {loading && <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="dense-card p-2">
          <div className="text-[10px] text-gray-500">MASI LAST CLOSE</div>
          <div className="text-sm font-bold">{data?.last_close?.toFixed(2) || '...'}</div>
        </div>
        <div className="dense-card p-2">
          <div className="text-[10px] text-gray-500">ANNUAL RETURN</div>
          <div className="text-sm font-bold text-green-400">{(data?.annualized_return * 100)?.toFixed(2) || '...'}%</div>
        </div>
        <div className="dense-card p-2">
          <div className="text-[10px] text-gray-500">MAX DRAWDOWN</div>
          <div className="text-sm font-bold text-red-400">{(data?.max_drawdown * 100)?.toFixed(2) || '...'}%</div>
        </div>
        <div className="dense-card p-2">
          <div className="text-[10px] text-gray-500">VOLATILITY (20d)</div>
          <div className="text-sm font-bold">{(data?.volatilities?.['20d'] * 100)?.toFixed(2) || '...'}%</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div>
          <label className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Alpha (Confidence {((1 - params.alpha)*100).toFixed(0)}%)</span>
            <span>{(params.alpha * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" min="0.01" max="0.10" step="0.01" 
            value={params.alpha} 
            onChange={e => handleChange('alpha', e.target.value)} 
            className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        
        <div>
          <label className="flex justify-between text-xs text-gray-300 mb-1">
            <span>N Simulations</span>
            <span>{params.n_simulations.toLocaleString()}</span>
          </label>
          <input 
            type="range" min="10000" max="500000" step="10000" 
            value={params.n_simulations} 
            onChange={e => handleChange('n_simulations', e.target.value)} 
            className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        
        <div>
          <label className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Horizon (Days)</span>
            <span>{params.horizon_days}</span>
          </label>
          <input 
            type="range" min="1" max="10" step="1" 
            value={params.horizon_days} 
            onChange={e => handleChange('horizon_days', e.target.value)} 
            className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}
