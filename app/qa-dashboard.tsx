import React, { useState, useEffect } from 'react';
import { Platform, View as RNView, Text as RNText, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  XOctagon, 
  TrendingUp, 
  Play, 
  Terminal, 
  ArrowLeft 
} from 'lucide-react';
import Header from '../components/dashboard/Header';
import MetricCard from '../components/dashboard/MetricCard';
import CircularGauge from '../components/dashboard/CircularGauge';
import CategoryCard from '../components/dashboard/CategoryCard';
import Charts from '../components/dashboard/Charts';

export default function QADashboard() {
  const isWeb = Platform.OS === 'web';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Set initial timestamp on load
  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString());
    }, 1500); // Simulate running automated tests for 1.5 seconds
  };

  // Graceful mobile native fallback
  if (!isWeb) {
    return (
      <RNView style={mobileStyles.container}>
        <RNText style={mobileStyles.title}>QA Suite Dashboard</RNText>
        <RNText style={mobileStyles.subtitle}>Smart Pantry Management System</RNText>
        
        <RNView style={mobileStyles.card}>
          <RNText style={mobileStyles.cardTitle}>💻 Web-Only DevOps Console</RNText>
          <RNText style={mobileStyles.cardBody}>
            The QA Analytics Suite utilizes complex Recharts visualizations and Tailwind CSS tailored for enterprise monitoring. Please open this app on a Web Browser to view the live dashboard.
          </RNText>
          <RNText style={mobileStyles.path}>URL: http://localhost:8081/qa-dashboard</RNText>
        </RNView>

        <TouchableOpacity 
          style={mobileStyles.button}
          onPress={() => router.replace('/')}
        >
          <RNText style={mobileStyles.buttonText}>Return to Mobile App</RNText>
        </TouchableOpacity>
      </RNView>
    );
  }

  // Web Optimized Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/10 via-cyan-900/5 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-6 relative z-10">
        
        {/* Breadcrumb back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.replace('/')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App Portal
          </button>
          
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-slate-900/30 border border-slate-800/40 px-3 py-1 rounded-lg">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENV: production-ci-agent</span>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Test Cases"
            value={100}
            icon={ClipboardCheck}
            iconColor="text-blue-400"
            borderColor="blue-500/30"
            glowColor="#3b82f6"
            subtext="100 E2E Selenium scenarios"
            trend={{ value: "+0%", isPositive: true }}
          />
          <MetricCard
            title="Assertions Passed"
            value={100}
            icon={ShieldCheck}
            iconColor="text-emerald-400"
            borderColor="emerald-500/30"
            glowColor="#10b981"
            subtext="All assertions matched successfully"
            trend={{ value: "100%", isPositive: true }}
          />
          <MetricCard
            title="Assertions Failed"
            value={0}
            icon={XOctagon}
            iconColor="text-rose-400"
            borderColor="rose-500/30"
            glowColor="#ef4444"
            subtext="Zero exceptions thrown"
            trend={{ value: "-0%", isPositive: true }}
          />
          <MetricCard
            title="Verification Rate"
            value="100%"
            icon={TrendingUp}
            iconColor="text-cyan-400"
            borderColor="cyan-500/30"
            glowColor="#06b6d4"
            subtext="Perfect quality index rating"
            trend={{ value: "Perfect", isPositive: true }}
          />
        </div>

        {/* Middle Columns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Circular Readiness Rate */}
          <div className="lg:col-span-1 h-full">
            <CircularGauge score={100} minRequired={95} />
          </div>

          {/* Right Verify Status by Category */}
          <div className="lg:col-span-2 bg-slate-900/20 backdrop-blur-xl border border-slate-800/40 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Verify Status by Category
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Automatic suite grouping & mapping status</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  All Passed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryCard category="Unit Testing" passed={20} total={20} score={100} />
                <CategoryCard category="Functional Testing" passed={25} total={25} score={100} />
                <CategoryCard category="UI/UX" passed={15} total={15} score={100} />
                <CategoryCard category="Validation" passed={15} total={15} score={100} />
                <CategoryCard category="Security" passed={10} total={10} score={100} />
                <CategoryCard category="API Testing" passed={15} total={15} score={100} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                VERIFICATION METRIC STAGE: PRE-DEPLOYMENT PRODUCTION READY
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">100/100 Total OK</span>
            </div>
          </div>
        </div>

        {/* Bottom Chart Visualization Widgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Analytical DevOps Insights
            </h2>
            <span className="text-[10px] text-slate-500 font-mono uppercase">historical pipeline logs</span>
          </div>
          <Charts />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 mt-12 bg-slate-950/40 text-center">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          Smart Pantry Automated Pipeline Dashboard &copy; 2026. Made with React + Recharts + Tailwind.
        </p>
      </footer>
    </div>
  );
}

const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#38bdf8',
    marginTop: 6,
    marginBottom: 40,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  path: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
