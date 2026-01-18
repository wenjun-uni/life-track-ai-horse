
import React, { useEffect, useState } from 'react';
import { AppTheme } from '../types';

interface HudGaugeProps {
  theme: AppTheme;
}

export const HudGauge: React.FC<HudGaugeProps> = ({ theme }) => {
  const isCyber = theme === 'cyber';
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Slow rotation animation
    const interval = setInterval(() => {
      setRotation(r => (r + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const borderColor = isCyber ? 'border-cyber-primary' : 'border-cinnabar-700';
  const textColor = isCyber ? 'text-cyber-primary' : 'text-cinnabar-900';
  const subTextColor = isCyber ? 'text-cyber-dim' : 'text-paper-500';

  return (
    <div className={`relative w-64 h-64 mx-auto rounded-full border-2 ${borderColor} flex items-center justify-center p-2 transition-all duration-500 ${isCyber ? 'shadow-[0_0_15px_rgba(255,42,42,0.2)]' : ''}`}>
      {/* Rotating Ring */}
      <div 
        className={`absolute inset-0 border-2 border-dashed ${isCyber ? 'border-cyber-accent' : 'border-paper-400'} rounded-full opacity-50`}
        style={{ transform: `rotate(${rotation}deg)` }}
      ></div>

      {/* Static Inner Circle */}
      <div className={`relative w-full h-full rounded-full border ${isCyber ? 'border-gray-800 bg-gray-900/50' : 'border-paper-200 bg-white/50'} backdrop-blur-sm flex flex-col items-center justify-center`}>
         <div className={`text-xs font-mono mb-1 ${subTextColor}`}>SYSTEM.LUCK</div>
         <div className={`text-4xl font-bold font-serif ${textColor}`}>大吉</div>
         <div className={`text-[10px] mt-2 ${subTextColor} tracking-widest`}>NW / 315°</div>
         
         {/* Decorative Lines */}
         <div className={`absolute bottom-8 w-1/2 h-[1px] ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></div>
         
         {/* Blinking Dot */}
         <div className={`absolute top-4 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full ${isCyber ? 'bg-cyber-accent' : 'bg-gold-500'} animate-pulse`}></div>
      </div>
      
      {/* Ornaments */}
      <div className={`absolute -top-1 left-1/2 -translate-x-1/2 bg-paper-50 px-2 text-[9px] ${subTextColor}`}>天机</div>
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-paper-50 px-2 text-[9px] ${subTextColor}`}>EST.2026</div>
    </div>
  );
};
