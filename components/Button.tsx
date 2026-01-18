
import React from 'react';
import { soundManager } from '../utils/soundManager';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  onClick,
  type = 'button', // Default to 'button' to prevent submit flash
  ...props 
}) => {
  
  // Removed active:scale to prevent layout shift/movement
  // Using active:opacity-90 for subtle visual feedback instead
  const baseStyles = "relative px-8 py-3 font-serif text-base transition-all duration-200 flex items-center justify-center group overflow-hidden active:opacity-90";
  
  const variants = {
    primary: "bg-cinnabar-700 text-white shadow-md hover:bg-cinnabar-900 rounded-lg border border-cinnabar-900",
    secondary: "bg-paper-100 border border-paper-800 text-paper-900 hover:bg-paper-200 rounded-lg",
    outline: "bg-transparent border border-paper-400 text-paper-600 hover:text-paper-900 hover:border-paper-800 rounded-lg",
    ghost: "bg-transparent text-paper-500 hover:text-cinnabar-700"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.play('ui.tap');
    if (onClick) onClick(e);
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};
