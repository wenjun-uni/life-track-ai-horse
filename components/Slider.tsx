
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '../utils/soundManager';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min = 1, 
  max = 100, 
  onChange,
  lowLabel = "Low",
  highLabel = "High"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Gait Counter: Tracks the "steps" of the horse
  // 0: Heavy (Front left)
  // 1: Light (Back right)
  // 2: Light (Back left)
  // This cycle creates the "Ga-llop-ing" triplet rhythm
  const gaitStep = useRef(0);
  const lastSoundValue = useRef(value);

  // Calculate percentage for CSS width/position
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const triggerGallopSound = (newValue: number) => {
    // Distance required to trigger next step
    // Smaller number = faster running
    const stepDistance = 3; 
    
    const diff = Math.abs(newValue - lastSoundValue.current);
    
    if (diff >= stepDistance) {
      // Use the robust soundManager which adapts to theme
      soundManager.play('slider.gallop');
      
      lastSoundValue.current = newValue;
    }
  };

  const handleUpdate = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate new value based on mouse position relative to container
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newValue = Math.round(min + percent * (max - min));
    
    if (newValue !== value) {
      onChange(newValue);
      triggerGallopSound(newValue);
    }
  }, [min, max, value, onChange]);

  // Mouse Events (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleUpdate(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault(); 
        handleUpdate(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset gait slightly so next drag starts fresh or continues naturally
      // We don't fully reset to 0 to allow "pausing" the run
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleUpdate]);

  // Touch Events (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleUpdate(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleUpdate(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full mb-8 select-none touch-none">
      {/* Label Row */}
      <div className="flex justify-between items-center mb-5">
        <label className="text-stone-900 font-serif text-xl font-bold tracking-tight">
          {label}
        </label>
        <span className="text-orange-600 font-serif text-3xl font-bold tabular-nums">
          {value}
        </span>
      </div>
      
      {/* Slider Track Area */}
      <div 
        ref={containerRef}
        className="relative h-12 flex items-center cursor-pointer group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Track (Inactive part - Light) */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden shadow-inner">
           {/* We don't need a separate div for right side, the background covers it */}
        </div>

        {/* Active Track (Left side - Dark) */}
        <div 
          className="absolute h-3 bg-stone-800 rounded-l-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />

        {/* The Thumb (Horse Circle) - Removed active:scale */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-10 w-10 bg-white border-[3px] border-stone-800 rounded-full flex items-center justify-center shadow-lg transform transition-transform z-10"
          style={{ 
            left: `${percentage}%`,
            marginLeft: '-20px' // Center the 40px thumb (half width)
          }}
        >
          <span className="text-lg select-none leading-none pt-0.5">🐎</span>
        </div>
      </div>

      {/* Bottom Labels */}
      <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1 px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
};
