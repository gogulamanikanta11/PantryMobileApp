import React, { ElementType } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  iconColor: string;
  borderColor: string;
  glowColor: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  borderColor,
  glowColor,
  subtext,
  trend
}: MetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/60 group hover:border-${borderColor} cursor-pointer`}
      style={{
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)`
      }}
    >
      {/* Decorative Neon Glow Backlight */}
      <div 
        className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: glowColor }}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:border-slate-700/60 transition-all duration-300`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {value}
          </span>
          {subtext && (
            <p className="mt-1 text-xs text-slate-500 font-medium tracking-wide">{subtext}</p>
          )}
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
              trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
            }`}>
              {trend.value}
            </span>
            <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">vs prev run</span>
          </div>
        )}
      </div>
    </div>
  );
}
