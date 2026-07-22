import React, { useEffect, useRef, useState } from 'react';
import { runMonteCarlo } from '../../services/api';

export default function Q2_MonteCarlo({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const histRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    runMonteCarlo({
      n_simulations: params.n_simulations,
      horizon_days: params.horizon_days,
      confidence_level: 1 - params.alpha,
      portfolio_value: params.portfolio_value
    }).then(res => {
      if (!active) return;
      setData(res);
      setLoading(false);
    }).catch(err => {
      if (!active) return;
      console.error(err);
      setLoading(false);
    });
    return () => { active = false; };
  }, [params.n_simulations, params.horizon_days, params.alpha, params.portfolio_value]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);

    const paths = data.sample_paths;
    if (!paths || paths.length === 0) return;
    
    // Find min and max for scaling
    let minVal = Infinity, maxVal = -Infinity;
    paths.forEach(p => {
      p.forEach(v => {
        if(v < minVal) minVal = v;
        if(v > maxVal) maxVal = v;
      });
    });
    
    const range = maxVal - minVal;
    minVal -= range * 0.05;
    maxVal += range * 0.05;
    const steps = paths[0].length;
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'; // Blue semi-transparent
    
    paths.forEach(path => {
      ctx.beginPath();
      path.forEach((val, i) => {
        const x = (i / (steps - 1)) * width;
        const y = height - ((val - minVal) / (maxVal - minVal)) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [data]);

  useEffect(() => {
    if (!data || !histRef.current) return;
    const ctx = histRef.current.getContext('2d');
    const width = histRef.current.width;
    const height = histRef.current.height;
    ctx.clearRect(0, 0, width, height);

    const bins = data.distribution_bins;
    if (!bins || bins.length === 0) return;

    let maxCount = 0;
    let minPnl = Infinity;
    let maxPnl = -Infinity;
    
    bins.forEach(b => {
      if (b.count > maxCount) maxCount = b.count;
      if (b.bin_start < minPnl) minPnl = b.bin_start;
      if (b.bin_end > maxPnl) maxPnl = b.bin_end;
    });

    const scaleX = (val) => ((val - minPnl) / (maxPnl - minPnl)) * width;
    
    // Draw bars
    ctx.fillStyle = 'rgba(107, 114, 128, 0.6)'; // Gray
    bins.forEach(b => {
      const x = scaleX(b.bin_start);
      const barW = Math.max(scaleX(b.bin_end) - x - 1, 1);
      const h = (b.count / maxCount) * height * 0.9;
      const y = height - h;
      ctx.fillRect(x, y, barW, h);
    });

    // Draw VaR line
    const varX = scaleX(data.var);
    ctx.beginPath();
    ctx.strokeStyle = '#EF4444'; // Red
    ctx.lineWidth = 2;
    ctx.moveTo(varX, 0);
    ctx.lineTo(varX, height);
    ctx.stroke();

    // Draw ES line
    const esX = scaleX(data.es);
    ctx.beginPath();
    ctx.strokeStyle = '#B91C1C'; 
    ctx.setLineDash([4, 4]);
    ctx.moveTo(esX, 0);
    ctx.lineTo(esX, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [data]);

  return (
    <div className="dense-panel h-full relative flex flex-col">
      <div className="font-bold text-xs text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
        <span>Monte Carlo Simulation</span>
        {loading && <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="dense-card p-1 text-center">
          <div className="text-[9px] text-gray-500">VaR (MAD)</div>
          <div className="text-xs font-bold text-red-400">{data ? data.var.toLocaleString(undefined, {maximumFractionDigits:0}) : '...'}</div>
        </div>
        <div className="dense-card p-1 text-center">
          <div className="text-[9px] text-gray-500">ES (MAD)</div>
          <div className="text-xs font-bold text-red-500">{data ? data.es.toLocaleString(undefined, {maximumFractionDigits:0}) : '...'}</div>
        </div>
        <div className="dense-card p-1 text-center">
          <div className="text-[9px] text-gray-500">VaR (%)</div>
          <div className="text-xs font-bold text-red-400">{data ? (data.var_pct * 100).toFixed(2) + '%' : '...'}</div>
        </div>
        <div className="dense-card p-1 text-center">
          <div className="text-[9px] text-gray-500">ES (%)</div>
          <div className="text-xs font-bold text-red-500">{data ? (data.es_pct * 100).toFixed(2) + '%' : '...'}</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <div className="flex-1 relative border border-[#1F2937] bg-[#000]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={800} height={300} />
          <div className="absolute top-1 left-1 text-[9px] text-gray-500 bg-[#090D16] px-1 rounded">200 Paths</div>
        </div>
        <div className="flex-1 relative border border-[#1F2937] bg-[#000]">
          <canvas ref={histRef} className="absolute inset-0 w-full h-full" width={800} height={300} />
          <div className="absolute top-1 left-1 text-[9px] text-gray-500 bg-[#090D16] px-1 rounded">P&L Distribution</div>
          {data && (
            <div className="absolute top-1 right-1 flex gap-2">
               <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-0.5 bg-red-500"></span>VaR</span>
               <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-0.5 bg-red-700 border-dashed border-b"></span>ES</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
