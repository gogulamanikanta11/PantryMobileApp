import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CategoryCardProps {
  category: string;
  passed: number;
  total: number;
  score: number; // e.g. 100
  badgeText?: string; // e.g. "PERFECT"
}

export default function CategoryCard({
  category,
  passed,
  total,
  score,
  badgeText = "PERFECT"
}: CategoryCardProps) {
  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.max(0, (passed / total) * 100));

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-900/30 backdrop-blur-md border border-slate-800/50 p-4 transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-900/40 flex items-center justify-between"
      style={{
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`
      }}
    >
      <div className="flex-1 mr-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white tracking-wide">
            {category}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            {passed}/{total}
          </span>
        </div>
        
        {/* Progress Bar Track */}
        <div className="h-2 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-glow"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {/* PERFECT Badge Container */}
      <div className="flex flex-col items-end justify-center min-w-[90px]">
        <span className="text-sm font-extrabold text-white font-mono leading-none">
          {score}%
        </span>
        <div className="flex items-center gap-1 mt-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest font-mono uppercase">
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
