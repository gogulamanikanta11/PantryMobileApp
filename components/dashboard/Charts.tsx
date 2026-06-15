import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  AreaChart, Area, LineChart, Line
} from 'recharts';

// Pie Chart Data: 100% Pass, 0% Fail
const pieData = [
  { name: 'Passed', value: 100 },
  { name: 'Failed', value: 0 }
];
const PIE_COLORS = ['#10b981', '#ef4444']; // neon green, red

// Test Coverage Data: Percentage of coverage per category
const coverageData = [
  { category: 'Auth', coverage: 98 },
  { category: 'Pantry', coverage: 96 },
  { category: 'Shopping', coverage: 95 },
  { category: 'AI', coverage: 92 },
  { category: 'Analytics', coverage: 97 },
  { category: 'Settings', coverage: 100 }
];

// Build Success Trend: Last 8 builds metrics
const buildTrendData = [
  { build: '#101', Passed: 94, Failed: 6 },
  { build: '#102', Passed: 96, Failed: 4 },
  { build: '#103', Passed: 98, Failed: 2 },
  { build: '#104', Passed: 99, Failed: 1 },
  { build: '#105', Passed: 100, Failed: 0 },
  { build: '#106', Passed: 100, Failed: 0 },
  { build: '#107', Passed: 100, Failed: 0 },
  { build: '#108', Passed: 100, Failed: 0 }
];

// Execution Timeline Data: Runtimes of the last 10 test runs (in seconds)
const timelineData = [
  { run: 'Run 1', duration: 14.2 },
  { run: 'Run 2', duration: 13.5 },
  { run: 'Run 3', duration: 12.8 },
  { run: 'Run 4', duration: 13.1 },
  { run: 'Run 5', duration: 12.2 },
  { run: 'Run 6', duration: 11.5 },
  { run: 'Run 7', duration: 11.9 },
  { run: 'Run 8', duration: 10.8 },
  { run: 'Run 9', duration: 10.5 },
  { run: 'Run 10', duration: 9.8 }
];

// Custom styled tooltips for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs font-mono font-bold" style={{ color: item.color }}>
            {item.name}: {item.value}{item.name.includes('coverage') || item.name.includes('Rate') || item.value > 90 ? '%' : 's'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Charts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* 1. Pass vs Fail Pie Chart */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
        <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pass vs Fail Ratio</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">100% PASS</span>
        </div>
        <div className="relative flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner Text overlay for the Pie Chart ring */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white font-mono leading-none">100/100</span>
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">TESTS PASSED</span>
          </div>
        </div>
      </div>

      {/* 2. Test Coverage Chart */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
        <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Code Coverage</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">96.3% AVG</span>
        </div>
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coverageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[80, 100]} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="coverage" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Coverage Rate">
                {coverageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Build Success Trend */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
        <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Build Success Trend</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">STREAK: 8</span>
        </div>
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buildTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPassed" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="build" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[90, 100]} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Passed" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPassed)" name="Pass Rate" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Execution Timeline */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
        <div className="border-b border-slate-800/40 pb-3 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Execution Speed</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">-31% DURATION</span>
        </div>
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="run" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={2.5} dot={{ stroke: '#10b981', strokeWidth: 1.5, r: 3 }} activeDot={{ r: 5 }} name="Duration" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
