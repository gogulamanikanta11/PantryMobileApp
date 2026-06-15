import React from 'react';
import { Activity, ShieldCheck, Server, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export default function Header({ onRefresh, isRefreshing, lastUpdated }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/10 border border-blue-500/25">
          <Server className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Smart Pantry Management System
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              BUILD v1.0.100
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-1 uppercase tracking-widest">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            E2E Automated QA Suite Analysis
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0">
        {lastUpdated && (
          <div className="text-right hidden lg:block">
            <p className="text-[10px] text-slate-500 font-mono">LAST RUN</p>
            <p className="text-xs text-slate-400 font-mono">{lastUpdated}</p>
          </div>
        )}
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 w-full sm:w-auto shadow-inner"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              Re-Run Suite
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl shadow-lg shadow-emerald-500/5 backdrop-blur-md w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="text-xs font-bold tracking-widest font-mono">DEPLOYABLE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
