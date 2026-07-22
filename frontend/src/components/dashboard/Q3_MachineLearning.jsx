import React, { useEffect, useRef, useState } from 'react';
import { fetchMLPredictions, fetchMLFeatureImportance } from '../../services/api';
import { createChart } from 'lightweight-charts';

export default function Q3_MachineLearning() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef(null);
  const [violationRate, setViolationRate] = useState(null);

  useEffect(() => {
    let active = true;
    
    Promise.all([fetchMLPredictions(), fetchMLFeatureImportance()])
      .then(([predsData, featData]) => {
        if (!active) return;
        setFeatures(featData.features.slice(0, 5));
        
        const preds = predsData.predictions.sort((a, b) => new Date(a.date) - new Date(b.date));
        const violations = preds.filter(p => p.actual_return < p.predicted_var).length;
        setViolationRate((violations / preds.length) * 100);

        if (chartContainerRef.current) {
          chartContainerRef.current.innerHTML = '';
          const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#9CA3AF' },
            grid: { vertLines: { color: '#1F2937' }, horzLines: { color: '#1F2937' } },
            rightPriceScale: { visible: false },
            leftPriceScale: { visible: true, scaleMargins: { top: 0.1, bottom: 0.1 } },
            timeScale: { visible: false },
            handleScroll: false,
            handleScale: false
          });

          const retSeries = chart.addLineSeries({ color: '#6B7280', lineWidth: 1 });
          retSeries.setData(preds.map(p => ({ time: p.date, value: p.actual_return })));

          const varSeries = chart.addLineSeries({ color: '#EF4444', lineWidth: 1 });
          varSeries.setData(preds.map(p => ({ time: p.date, value: p.predicted_var })));

          chart.timeScale().fitContent();
        }

        setLoading(false);
      })
      .catch(err => {
         if(active) setLoading(false);
         console.error(err);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="dense-panel h-full relative flex flex-col">
      <div className="font-bold text-xs text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
        <span>ML Quantile Regression</span>
        {loading && <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-gray-400">Actual Returns vs Predicted VaR</span>
        <span className="text-[10px] bg-[#1F2937] px-1.5 py-0.5 rounded text-white border border-[#374151]">
          Violation Rate: <span className={violationRate > 5 ? 'text-red-400' : 'text-green-400'}>{violationRate !== null ? violationRate.toFixed(2) + '%' : '...'}</span>
        </span>
      </div>

      <div className="flex-1 min-h-0 border border-[#1F2937] bg-[#000] mb-2 relative">
         <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      <div className="h-1/3 min-h-[80px]">
        <div className="text-[10px] text-gray-400 mb-1">Top 5 Feature Importance (Gain)</div>
        <div className="flex flex-col gap-1 h-full justify-around">
          {features.length > 0 ? features.map((f, i) => (
            <div key={i} className="flex items-center text-[10px]">
              <span className="w-24 truncate mr-2 text-gray-300" title={f.feature}>{f.feature}</span>
              <div className="flex-1 bg-[#1F2937] h-2 rounded-sm overflow-hidden border border-[#374151]">
                <div className="bg-blue-500 h-full" style={{ width: `${(f.importance / features[0].importance) * 100}%` }}></div>
              </div>
            </div>
          )) : (
            <div className="text-xs text-gray-500 text-center italic mt-4">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
