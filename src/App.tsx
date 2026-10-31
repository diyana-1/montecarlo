import React, { useState, useEffect, useTransition } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { VerificationBanner } from './components/VerificationBanner';
import { PathChart } from './components/PathChart';
import { DistributionChart } from './components/DistributionChart';
import { StatsTable } from './components/StatsTable';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { TheorySection } from './components/TheorySection';
import {
  SimulationConfig,
  SimulationResults,
  runSimulation,
} from './utils/math';
import { generateStandaloneHtml } from './utils/exportHtml';
import { Download, FileSpreadsheet, Sparkles, BookOpen } from 'lucide-react';

const DEFAULT_CONFIG: SimulationConfig = {
  s0: 50.0,
  mu: 0.12,
  sigma: 0.25,
  deltaT: 1 / 12, // 0.0833333333
  steps: 6,
  numPaths: 1000,
  seed: null,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<SimulationResults>(() => runSimulation(DEFAULT_CONFIG));
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<string>('overview');

  const handleRunSimulation = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    startTransition(() => {
      const res = runSimulation(newConfig);
      setResults(res);
    });
  };

  const handleLoadBenchmarkExcel = () => {
    // Jump straight to the spreadsheet tab / section and highlight it
    setActiveSection('spreadsheet');
    const el = document.getElementById('section-spreadsheet');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExportHtml = () => {
    const htmlString = generateStandaloneHtml(config);
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'monte_carlo_stock_simulator.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllCsv = () => {
    let csv = 'Path_Index,Terminal_Price_S_T,Absolute_Return_Dollars,Return_Percentage\n';
    results.paths.forEach((p) => {
      const retDollars = p.terminalPrice - config.s0;
      const retPct = (retDollars / config.s0) * 100;
      csv += `${p.pathIndex},${p.terminalPrice.toFixed(6)},${retDollars.toFixed(6)},${retPct.toFixed(4)}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monte_carlo_terminal_prices_N${config.numPaths}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onExportHtml={handleExportHtml}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Editorial Subtitle & Context Banner */}
        <section id="section-overview" className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <span>Financial Mathematics II</span>
                <span aria-hidden="true">·</span>
                <span>Geometric Brownian Motion</span>
                <span aria-hidden="true">·</span>
                <span>Box-Muller Algorithm</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Discrete Monte Carlo Stock Price Simulator
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Simulate stock price trajectories using the discrete Euler-Maruyama formulation modeled in the course exercise spreadsheet:
                <span className="font-mono font-semibold text-slate-800 ml-1">
                  ΔS_t = S_t · [μ · Δt + σ · √Δt · Z]
                </span>, where <span className="font-mono text-slate-700">Z ~ N(0, 1)</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportAllCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Export all simulated terminal prices as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Terminal CSV</span>
              </button>
            </div>
          </div>
        </section>

        {/* Verification Summary Banner */}
        <VerificationBanner results={results} />

        {/* 2-Column Split: Controls + Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Parameter Deck (4 of 12 cols on desktop) */}
          <div className="lg:col-span-4 sticky top-20">
            <InputPanel
              config={config}
              onRunSimulation={handleRunSimulation}
              onLoadBenchmarkExcel={handleLoadBenchmarkExcel}
              isRunning={isPending}
            />
          </div>

          {/* Right Column: Interactive Charts & Analytics (8 of 12 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chart 1: Trajectories */}
            <section id="section-paths">
              <PathChart results={results} />
            </section>

            {/* Chart 2: Histogram Distribution */}
            <section id="section-distribution">
              <DistributionChart results={results} />
            </section>

            {/* Summary Statistics Dashboard Table */}
            <section id="section-stats">
              <StatsTable results={results} />
            </section>

            {/* Course Curriculum Spreadsheet Step-by-Step Breakdown */}
            <section id="section-spreadsheet">
              <SpreadsheetTable results={results} />
            </section>

            {/* Theory & Mathematical Derivations */}
            <section id="section-theory">
              <TheorySection />
            </section>
          </div>
        </div>
      </main>

      {/* Clean Academic Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Financial Mathematics II</span>
            <span>·</span>
            <span>Discrete Monte Carlo Simulation Laboratory</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Formula: S_(t+Δt) = S_t + S_t[μΔt + σ√Δt Z] · Box-Muller Z ~ N(0,1)
          </div>
        </div>
      </footer>
    </div>
  );
}
