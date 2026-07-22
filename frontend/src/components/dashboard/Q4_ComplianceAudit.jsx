import React, { useEffect, useState } from 'react';
import { fetchBacktestingComparison, fetchTrafficLight } from '../../services/api';

const safeFormat = (val, decimals = 4, fallback = 'N/A') => {
  return (typeof val === 'number' && !isNaN(val)) ? val.toFixed(decimals) : fallback;
};

export default function Q4_ComplianceAudit({ params }) {
  const [data, setData] = useState(null);
  const [trafficLights, setTrafficLights] = useState({ mc: null, ml: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      fetchBacktestingComparison(params.alpha),
      fetchTrafficLight('mc', 250, params.alpha),
      fetchTrafficLight('ml', 250, params.alpha)
    ]).then(([comp, mcLight, mlLight]) => {
      if (!active) return;
      setData(comp);
      setTrafficLights({ mc: mcLight, ml: mlLight });
      setLoading(false);
    }).catch(err => {
      if (active) setLoading(false);
      console.error(err);
    });

    return () => { active = false; };
  }, [params.alpha]);

  const renderLight = (lightResponse) => {
    const zone = lightResponse?.result?.zone;
    let colorClass = 'bg-gray-600';
    let pulseClass = '';
    if (zone === 'VERTE') { colorClass = 'bg-[#10B981]'; pulseClass = 'shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse'; }
    if (zone === 'JAUNE') { colorClass = 'bg-[#F59E0B]'; pulseClass = 'shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse'; }
    if (zone === 'ROUGE') { colorClass = 'bg-[#EF4444]'; pulseClass = 'shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'; }
    return (
      <div className={`w-4 h-4 rounded-full ${colorClass} ${pulseClass} border border-[#1F2937]`}></div>
    );
  };

  return (
    <div className="dense-panel h-full relative flex flex-col">
      <div className="font-bold text-xs text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
        <span>Basel III Compliance</span>
        {loading && <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="dense-card p-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-bold">MC ZONE</span>
          {trafficLights.mc ? renderLight(trafficLights.mc) : <div className="w-4 h-4 rounded-full bg-gray-800"></div>}
        </div>
        <div className="dense-card p-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-bold">ML ZONE</span>
          {trafficLights.ml ? renderLight(trafficLights.ml) : <div className="w-4 h-4 rounded-full bg-gray-800"></div>}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto border border-[#1F2937] rounded-sm">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead>
            <tr className="bg-[#1F2937] text-gray-300">
              <th className="p-1.5 font-normal border-b border-r border-[#374151]">Model</th>
              <th className="p-1.5 font-normal border-b border-r border-[#374151] text-center">Exceptions</th>
              <th className="p-1.5 font-normal border-b border-r border-[#374151] text-right">LR Stat</th>
              <th className="p-1.5 font-normal border-b border-r border-[#374151] text-right">P-Value</th>
              <th className="p-1.5 font-normal border-b border-[#374151] text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {data && ['mc', 'ml'].map(model => {
              const res = data[model];
              if (!res) return null;
              
              const isBest = data.best_model === model;
              const decisionText = res.verdict || '';
              const passed = !res.reject_H0;
              
              return (
                <tr key={model} className={`border-b border-[#1F2937] ${isBest ? 'bg-[#0f1b29]' : 'bg-[#090D16]'}`}>
                  <td className="p-1.5 border-r border-[#1F2937] uppercase font-bold text-gray-200">
                    {model} {isBest && <span className="text-blue-500 ml-1">★</span>}
                  </td>
                  <td className="p-1.5 border-r border-[#1F2937] text-center">{res.x ?? 'N/A'}</td>
                  <td className="p-1.5 border-r border-[#1F2937] text-right">{safeFormat(res.LR_statistic, 2)}</td>
                  <td className="p-1.5 border-r border-[#1F2937] text-right">{safeFormat(res.p_value, 4)}</td>
                  <td className={`p-1.5 text-center font-bold ${passed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {decisionText}
                  </td>
                </tr>
              )
            })}
            {!data && (
              <tr><td colSpan="5" className="p-3 text-center text-gray-500 italic">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
