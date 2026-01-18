
import React, { useRef, useState, useEffect } from 'react';
import { soundManager } from '../utils/soundManager';

export type MetricType = 'qi' | 'load' | 'speed' | 'resources' | 'bond' | 'strategy' | 'skill' | 'luck';

interface HorseScaleProps {
  label: string;
  value: number; // 0 to 100
  onChange: (val: number) => void;
  metricType: MetricType;
  theme?: 'ink' | 'cyber';
}

export const HorseScale: React.FC<HorseScaleProps> = React.memo(({ 
  label, 
  value, 
  onChange,
  metricType,
  theme = 'ink'
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragState = useRef({
    startX: 0,
    rectWidth: 0,
    startVal: 0,
    currentVal: value,
    lastTime: 0
  });

  useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
      dragState.current.currentVal = value;
    }
  }, [value, isDragging]);

  const getDescription = (val: number) => {
    const v = Math.round(val);
    switch (metricType) {
        case 'qi': 
            if (v < 20) return '心灰 · 意冷';
            if (v < 40) return '意兴 · 阑珊';
            if (v < 60) return '平和 · 淡然';
            if (v < 80) return '跃跃 · 欲试';
            return '壮心 · 不已';
        case 'load': 
            if (v < 20) return '身心 · 轻盈';
            if (v < 40) return '略有 · 牵挂';
            if (v < 60) return '背负 · 前行';
            if (v < 80) return '步履 · 维艰';
            return '不堪 · 重负';
        case 'speed': 
            if (v < 20) return '瞻前 · 顾后';
            if (v < 40) return '且行 · 且止';
            if (v < 60) return '按部 · 就班';
            if (v < 80) return '雷厉 · 风行';
            return '势如 · 破竹';
        case 'resources': 
            if (v < 20) return '惴惴 · 不安';
            if (v < 40) return '勉力 · 支撑';
            if (v < 60) return '自给 · 自足';
            if (v < 80) return '游刃 · 有余';
            return '胸有 · 成竹';
        case 'bond': 
            if (v < 20) return '独行 · 侠客';
            if (v < 40) return '萍水 · 相逢';
            if (v < 60) return '三两 · 知己';
            if (v < 80) return '高朋 · 满座';
            return '众星 · 捧月';
        case 'strategy': 
            if (v < 20) return '云雾 · 缭绕';
            if (v < 40) return '举棋 · 不定';
            if (v < 60) return '摸着 · 石头';
            if (v < 80) return '拨云 · 见日';
            return '洞若 · 观火';
        case 'skill':
            if (v < 20) return '手足 · 无措';
            if (v < 40) return '勉强 · 应对';
            if (v < 60) return '渐入 · 佳境';
            if (v < 80) return '得心 · 应手';
            return '随心 · 所欲';
        case 'luck': 
            if (v < 20) return '逆水 · 行舟';
            if (v < 40) return '波澜 · 不惊';
            if (v < 60) return '柳暗 · 花明';
            if (v < 80) return '时来 · 运转';
            return '天命 · 所归';
        default:
            return '';
    }
  };

  const updateValueFromX = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newValue = Math.round(percent * 100);

    if (newValue !== dragState.current.currentVal) {
      setInternalValue(newValue);
      const now = Date.now();
      const dt = now - dragState.current.lastTime;
      const dx = Math.abs(newValue - dragState.current.currentVal); 
      const speed = Math.min(1, (dx / (dt + 1)) * 4); 
      soundManager.updateGallop(speed);
      dragState.current.currentVal = newValue;
      dragState.current.lastTime = now;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    soundManager.startGallop();
    const rect = trackRef.current.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      rectWidth: rect.width,
      startVal: internalValue,
      currentVal: internalValue,
      lastTime: Date.now()
    };
    updateValueFromX(e.clientX, rect);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) updateValueFromX(e.clientX, rect);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    soundManager.stopGallop();
    onChange(internalValue);
  };

  // Styles based on theme
  const isCyber = theme === 'cyber';
  const labelColor = isCyber ? 'text-gray-300' : 'text-paper-900';
  const descColor = isCyber ? (isDragging ? 'text-cyber-primary' : 'text-gray-500') : (isDragging ? 'text-cinnabar-900' : 'text-cinnabar-700');
  const trackBg = isCyber ? 'bg-gray-800' : 'bg-paper-300';
  const fillBg = isCyber ? 'bg-cyber-primary shadow-[0_0_10px_#FF2A2A]' : 'bg-cinnabar-700';
  const thumbBg = isCyber ? 'bg-black border-cyber-primary text-cyber-primary' : 'bg-white border-paper-200 text-black';
  const dotColor = isDragging ? (isCyber ? 'bg-cyber-accent' : 'bg-gold-500') : (isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700');

  return (
    <div className="w-full mb-8 select-none group touch-none" style={{ touchAction: 'none' }}>
      <div className="flex justify-between items-end mb-2 px-1">
        <label className={`${labelColor} font-serif text-sm font-bold flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full transition-transform duration-200 ${dotColor} ${isDragging ? 'scale-150' : ''}`}></span>
            {label}
        </label>
        <div className="flex flex-col items-end">
           <span className={`text-xs font-serif font-bold tracking-wide transition-all duration-200 ${descColor} ${isDragging ? 'scale-105' : ''}`}>
              {getDescription(internalValue)} <span className="opacity-50 font-mono text-[10px] ml-1">{internalValue}</span>
           </span>
        </div>
      </div>
      
      <div 
        ref={trackRef}
        className="relative h-12 flex items-center cursor-pointer touch-none py-3"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp} 
      >
        {/* Track */}
        <div className={`absolute w-full h-[2px] ${trackBg} rounded-full pointer-events-none`}></div>
        {/* Fill */}
        <div className={`absolute h-[2px] ${fillBg} rounded-full pointer-events-none transition-all duration-75 ease-out`} style={{ width: `${internalValue}%` }}></div>
        {/* Thumb */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 h-8 w-8 border rounded-full shadow-md flex items-center justify-center z-10 transform transition-transform duration-75 ease-out pointer-events-none ${thumbBg} ${isDragging ? 'scale-125 shadow-xl' : ''}`}
          style={{ left: `${internalValue}%`, transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-xs select-none mt-[1px]">🐎</span>
        </div>
      </div>
    </div>
  );
});
