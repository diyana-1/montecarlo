import React, { useState } from 'react';
import { SimulationConfig } from '../utils/math';
import { Play, RotateCcw, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

interface InputPanelProps {
  config: SimulationConfig;
  onRunSimulation: (newConfig: SimulationConfig) => void;
  onLoadBenchmarkExcel: () => void;
  isRunning?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  config,
  onRunSimulation,
  onLoadBenchmarkExcel,
  isRunning = false,
}) => {
  const [s0, setS0] = useState<number>(config.s0);
  const [muPercent, setMuPercent] = useState<number>(config.mu * 100);
  const [sigmaPercent, setSigmaPercent] = useState<number>(config.sigma * 100);
  const [intervalType, setIntervalType] = useState<string>('monthly');
  const [customDeltaT, setCustomDeltaT] = useState<number>(config.deltaT);
  const [steps, setSteps] = useState<number>(config.steps);
  const [numPaths, setNumPaths] = useState<number>(config.numPaths);
  const [seedInput, setSeedInput] = useState<string>(config.seed ? String(config.seed) : '');

  // Validation state
  const errors: string[] = [];
  if (isNaN(s0) || s0 <= 0) errors.push('Initial Stock Price (S₀) must be strictly greater than 0.');
  if (isNaN(sigmaPercent) || sigmaPercent < 0) errors.push('Volatility (σ) must be non-negative (≥ 0%).');
  if (isNaN(steps) || steps < 1) errors.push('Number of Time Steps must be an integer ≥ 1.');
  if (isNaN(numPaths) || numPaths < 1) errors.push('Number of Simulations must be an integer ≥ 1.');

  const getDeltaTValue = (): number => {
    if (intervalType === 'monthly') return 1 / 12;
    if (intervalType === 'daily') return 1 / 252;
    if (intervalType === 'quarterly') return 0.25;
    if (intervalType === 'annual') return 1.0;
    return customDeltaT > 0 ? customDeltaT : 1 / 12;
  };

  const handleRun = () => {
    if (errors.length > 0) return;
    const seedVal = seedInput.trim() !== '' ? parseInt(seedInput, 10) : null;
    const newConfig: SimulationConfig = {
      s0: Number(s0),
      mu: Number(muPercent) / 100,
      sigma: Number(sigmaPercent) / 100,
      deltaT: getDeltaTValue(),
      steps: Math.max(1, Math.floor(steps)),
      numPaths: Math.max(1, Math.floor(numPaths)),
      seed: isNaN(seedVal as number) ? null : seedVal,
    };
    onRunSimulation(newConfig);
  };

  const setPreset = (type: 'default' | 'zeroVol' | 'highVol' | 'converge') => {
    if (type === 'default') {
      setS0(50);
      setMuPercent(12);
      setSigmaPercent(25);
      setIntervalType('monthly');
      setSteps(6);
      setNumPaths(1000);
      setSeedInput('');
    } else if (type === 'zeroVol') {
      setS0(50);
      setMuPercent(12);
      setSigmaPercent(0);
      setIntervalType('monthly');
      setSteps(6);
      setNumPaths(500);
      setSeedInput('42');
    } else if (type === 'highVol') {
      setS0(50);
      setMuPercent(12);
      setSigmaPercent(60);
      setIntervalType('monthly');
      setSteps(6);
      setNumPaths(1000);
      setSeedInput('');
    } else if (type === 'converge') {
      setS0(50);
      setMuPercent(12);
      setSigmaPercent(25);
      setIntervalType('monthly');
      setSteps(6);
      setNumPaths(10000);
      setSeedInput('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Model Parameters</h2>
          <p className="text-xs text-slate-500">Discrete GBM Discretization Settings</p>
        </div>
        <button
          onClick={() => setPreset('default')}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset to Course Exercise defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
          <div className="font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Validation Errors:</span>
          </div>
          {errors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* S_0 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Initial Stock Price (S₀)
            </label>
            <span className="text-xs font-mono text-slate-500">${Number(s0).toFixed(2)}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
            <input
              type="number"
              step="1"
              min="0.01"
              value={s0}
              onChange={(e) => setS0(parseFloat(e.target.value))}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Excel default: $50.00</p>
        </div>

        {/* Expected Return μ */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Expected Return (μ, Annualized)
            </label>
            <span className="text-xs font-mono text-slate-500">{muPercent}% (μ = {(muPercent / 100).toFixed(3)})</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              value={muPercent}
              onChange={(e) => setMuPercent(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Drift rate; Excel default: 12% (0.12)</p>
        </div>

        {/* Volatility σ */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Annual Volatility (σ)
            </label>
            <span className="text-xs font-mono text-slate-500">{sigmaPercent}% (σ = {(sigmaPercent / 100).toFixed(3)})</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              value={sigmaPercent}
              onChange={(e) => setSigmaPercent(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Diffusion factor; Excel default: 25% (0.25)</p>
        </div>

        {/* Time Interval Δt */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Time Interval (Δt, in Years)
            </label>
            <span className="text-xs font-mono text-slate-500">
              Δt ≈ {getDeltaTValue().toFixed(5)}
            </span>
          </div>
          <select
            value={intervalType}
            onChange={(e) => setIntervalType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="monthly">Monthly: Δt = 1/12 ≈ 0.08333 yr (Course Default)</option>
            <option value="daily">Daily: Δt = 1/252 ≈ 0.003968 yr</option>
            <option value="quarterly">Quarterly: Δt = 1/4 = 0.25 yr</option>
            <option value="annual">Annual: Δt = 1.0 yr</option>
            <option value="custom">Custom interval</option>
          </select>
          {intervalType === 'custom' && (
            <input
              type="number"
              step="0.001"
              min="0.0001"
              value={customDeltaT}
              onChange={(e) => setCustomDeltaT(parseFloat(e.target.value))}
              className="mt-2 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
              placeholder="e.g. 0.08333"
            />
          )}
        </div>

        {/* Number of Time Steps */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Number of Time Steps
            </label>
            <span className="text-xs font-mono text-slate-500">
              T = {(steps * getDeltaTValue()).toFixed(3)} yrs
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="365"
            step="1"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-0.5">Excel default: 6 steps (6 months = 0.50 yr)</p>
        </div>

        {/* Number of Simulations N_paths */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Number of Simulations (N_paths)
            </label>
            <span className="text-xs font-mono text-slate-500">{Number(numPaths).toLocaleString()} paths</span>
          </div>
          <input
            type="number"
            min="1"
            max="50000"
            step="100"
            value={numPaths}
            onChange={(e) => setNumPaths(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-0.5">Standard: 1,000 paths (up to 50,000)</p>
        </div>

        {/* Seed */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Random Seed (Optional)
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {seedInput ? `Seed: ${seedInput}` : 'Pseudo-random'}
            </span>
          </div>
          <input
            type="number"
            placeholder="e.g. 42 (leave blank for random)"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-0.5">Enables reproducible simulation results</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRun}
          disabled={errors.length > 0 || isRunning}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRunning ? 'Simulating...' : 'Run Simulation'}</span>
        </button>

        {/* Academic Course Presets */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Curriculum Verification Presets:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setPreset('default');
                setTimeout(handleRun, 50);
              }}
              className="p-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="font-semibold">Course Default</div>
              <div className="text-[10px] text-slate-500">S₀=50, μ=12%, σ=25%</div>
            </button>

            <button
              onClick={() => {
                setPreset('zeroVol');
                setTimeout(handleRun, 50);
              }}
              className="p-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="font-semibold">Zero Volatility (σ=0%)</div>
              <div className="text-[10px] text-slate-500">Deterministic growth test</div>
            </button>

            <button
              onClick={() => {
                setPreset('highVol');
                setTimeout(handleRun, 50);
              }}
              className="p-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="font-semibold">High Volatility (σ=60%)</div>
              <div className="text-[10px] text-slate-500">Wide spread test</div>
            </button>

            <button
              onClick={() => {
                setPreset('converge');
                setTimeout(handleRun, 50);
              }}
              className="p-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="font-semibold">Convergence (10,000)</div>
              <div className="text-[10px] text-slate-500">Law of Large Numbers</div>
            </button>
          </div>
        </div>

        {/* Load course sheet benchmark */}
        <div className="pt-2">
          <button
            onClick={onLoadBenchmarkExcel}
            className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Lecture Spreadsheet Z-Sample</span>
          </button>
        </div>
      </div>
    </div>
  );
};
