import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('simple'); // 'simple' | 'advanced'
  
  const toggleMode = () => setMode(m => m === 'simple' ? 'advanced' : 'simple');
  const isAdvanced = mode === 'advanced';
  
  return (
    <ModeContext.Provider value={{ mode, toggleMode, isAdvanced }}>
      {children}
    </ModeContext.Provider>
  );
}

export const useMode = () => useContext(ModeContext);

export default ModeContext;
