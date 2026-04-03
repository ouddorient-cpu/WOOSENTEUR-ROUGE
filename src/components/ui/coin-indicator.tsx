'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinIndicatorProps {
  amount: number | string;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export const CoinIndicator: React.FC<CoinIndicatorProps> = ({ 
  amount, 
  className, 
  label = "crédits", 
  showLabel = true 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 shadow-sm border-amber-500/20",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ 
            rotateY: [0, 180, 360],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative text-amber-500"
        >
          <Coins className="h-4 w-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </motion.div>
        
        {/* Shine effect */}
        <motion.div 
          animate={{ 
            left: ['-100%', '200%'],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 3,
            ease: "linear" 
          }}
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-20 pointer-events-none"
        />
      </div>
      
      <div className="flex items-center gap-1">
        <span className="font-bold text-amber-700 tabular-nums">
          {amount}
        </span>
        {showLabel && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600/80 mt-0.5">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
};
