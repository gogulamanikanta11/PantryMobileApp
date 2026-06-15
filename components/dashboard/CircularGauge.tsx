import React from 'react';

interface CircularGaugeProps {
  score?: number; // percentage (e.g. 100)
  minRequired?: number; // e.g. 95
}

export default function CircularGauge({ score = 100, minRequired = 95 }: CircularGaugeProps) {
  // SVG circular properties
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-6 flex flex-col items-center justify-between h-full min-h-[300px]">
      <div className="w-full flex items-center justify-between border-b border-slate-800/40 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Readiness Rate
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          STABLE
        </span>
      </div>

      <div className="relative flex items-center justify-center my-6 group">
        {/* Decorative Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* SVG Circular Progress */}
        <svg className="w-44 h-44 transform -rotate-90 relative z-10">
          {/* Background Track */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Cyan/Green Gradient Progress Fill */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text Panel */}
        <div className="absolute flex flex-col items-center justify-center z-20">
          <span className="text-4xl font-extrabold text-white font-mono tracking-tighter drop-shadow-md">
            {score}%
          </span>
          <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase mt-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            PASS SCORE
          </span>
        </div>
      </div>

      <div className="w-full text-center mt-2 border-t border-slate-800/40 pt-4">
        <p className="text-xs text-slate-400 font-semibold tracking-wide">
          Requires &ge;{minRequired}% pass score to deploy.
        </p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
          E2E Automated test suite executes 100 test steps covering auth, inventory, AI recommendations, settings, and analytics.
        </p>
      </div>
    </div>
  );
}
