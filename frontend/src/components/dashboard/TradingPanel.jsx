import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import GlowSlider from '../ui/GlowSlider';
import { Button } from '../ui/button';

const PORTFOLIO_VALUE = 1000000;

export default function TradingPanel({ onExecute, executionResult, isExecuting }) {
  const [riskLevel, setRiskLevel] = useState(50);
  const [leverage, setLeverage] = useState(1);

  const handleExecute = () => {
    if (onExecute) {
      onExecute({ riskLevel, leverage });
    }
  };

  return (
    <div className="w-full h-full">
      <GlassPanel hover glow className="h-full flex flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-accent)] shadow-[0_0_8px_var(--neon-accent)] animate-pulseGlow"></span>
            System Execution
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Risk Tolerance</span>
                <span className="font-mono-data text-lg text-[var(--text-primary)]">{riskLevel}%</span>
              </div>
              <GlowSlider 
                value={riskLevel} 
                onChange={setRiskLevel} 
                min={1} 
                max={100} 
                color="var(--neon-cyan)" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Leverage</span>
                <span className="font-mono-data text-lg text-[var(--text-primary)]">{leverage}x</span>
              </div>
              <GlowSlider 
                value={leverage} 
                onChange={setLeverage} 
                min={1} 
                max={10} 
                color="var(--neon-warning)" 
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Est. Impact</span>
                <span className="font-mono-data text-xl text-[var(--neon-profit)]">
                  +{(riskLevel * leverage * 0.12).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <AnimatePresence>
            {executionResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-4 rounded-[var(--radius-md)] border border-[var(--neon-accent)] bg-[var(--surface-void)] shadow-[0_0_15px_rgba(0,255,255,0.15)]"
              >
                <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-accent)] animate-pulseGlow"></div>
                  Execution Results
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-[var(--text-secondary)]">VaR MAD</span>
                    <span className="font-mono-data text-xl text-[var(--neon-loss)] drop-shadow-[0_0_8px_rgba(255,50,50,0.5)]">
                      {(executionResult.var_pct * PORTFOLIO_VALUE).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-[var(--text-secondary)]">ES MAD</span>
                    <span className="font-mono-data text-xl text-[var(--neon-warning)] drop-shadow-[0_0_8px_rgba(255,170,0,0.5)]">
                      {(executionResult.es_pct * PORTFOLIO_VALUE).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            className="w-full h-14 text-lg font-bold uppercase tracking-wider transition-all" 
            variant="default"
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Model'}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
