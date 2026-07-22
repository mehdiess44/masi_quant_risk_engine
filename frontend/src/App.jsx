import React, { useState, useEffect } from 'react';
import Q1_MarketParams from './components/dashboard/Q1_MarketParams';
import Q2_MonteCarlo from './components/dashboard/Q2_MonteCarlo';
import Q3_MachineLearning from './components/dashboard/Q3_MachineLearning';
import Q4_ComplianceAudit from './components/dashboard/Q4_ComplianceAudit';

export default function App() {
  // Dictionnaire d'état global pour la simulation
  const [globalParams, setGlobalParams] = useState({
    alpha: 0.05,
    n_simulations: 100000,
    horizon_days: 1,
    portfolio_value: 10000000 // 10 000 000 MAD
  });

  // Statut fictif (sera mis à jour plus tard avec un ping réel à l'API)
  const [apiConnected, setApiConnected] = useState(true);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#090D16] text-[#F9FAFB] p-2 flex flex-col gap-2 font-mono tabular-nums">

      {/* Header Compact */}
      <header className="flex items-center justify-between border-b border-[#1F2937] pb-2 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-bold text-sm tracking-widest text-white">
            MASI Quant Risk Engine
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">STATUS:</span>
          <div className="flex items-center gap-1.5 bg-[#0c111c] px-2 py-0.5 rounded-sm border border-[#1F2937]">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
            <span className={apiConnected ? 'text-green-400' : 'text-red-400'}>
              {apiConnected ? 'API CONNECTÉE' : 'HORS LIGNE'}
            </span>
          </div>
        </div>
      </header>

      {/* Grille 2x2 Principale occupante l'espace restant */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2">
        {/* Quadrant 1 : Paramètres (Haut Gauche) */}
        <section className="min-h-0">
          <Q1_MarketParams params={globalParams} setParams={setGlobalParams} />
        </section>

        {/* Quadrant 2 : Monte Carlo (Haut Droite) */}
        <section className="min-h-0">
          <Q2_MonteCarlo params={globalParams} />
        </section>

        {/* Quadrant 3 : ML (Bas Gauche) */}
        <section className="min-h-0">
          <Q3_MachineLearning />
        </section>

        {/* Quadrant 4 : Audit Backtesting/Bâle III (Bas Droite) */}
        <section className="min-h-0">
          <Q4_ComplianceAudit params={globalParams} />
        </section>
      </main>

    </div>
  );
}
