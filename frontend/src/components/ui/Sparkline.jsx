import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function Sparkline({ data = [], color = 'var(--neon-profit)', height = 40, className = '' }) {
  // Map array of numbers to recharts format if necessary
  const formattedData = data.map((val, index) => {
    return typeof val === 'number' ? { value: val, index } : val;
  });

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={true}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
