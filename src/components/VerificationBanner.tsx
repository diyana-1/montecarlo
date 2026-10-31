import React from 'react';
import { SimulationResults } from '../utils/math';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface VerificationBannerProps {
  results: SimulationResults;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ results }) => {
  const {
    theoreticalMeanDiscrete,
    theoreticalMeanContinuous,
    mcMean,
    absoluteError,
    percentError,
    config,
  } = results;

  const isHighPrecision = percentError < 1.0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <span>Theoretical vs Simulated Verification</span>
            <span aria-hidden="true">·</span>
            <span>Geometric Brownian Motion (Discrete Discretization)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Monte Carlo Convergence & Accuracy Verification
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isHighPrecision ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>High Convergence (Error &lt; 1%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Finite Sample Variance ({percentError.toFixed(2)}% Error)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {/* Metric 1 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Theoretical E[S_T]
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${theoreticalMeanDiscrete.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            S₀(1 + μΔt)<sup>N</sup> ({config.steps} steps)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
          <div className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-1">
            Simulated MC Mean
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900">
            ${mcMean.toFixed(2)}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            N = {config.numPaths.toLocaleString()} paths sample average
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Absolute Error
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${absoluteError.toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            |MC Mean - E[S_T]|
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Relative Error
          </div>
          <div className={`text-2xl font-bold font-mono ${isHighPrecision ? 'text-emerald-700' : 'text-amber-700'}`}>
            {percentError.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Continuous limit: ${theoreticalMeanContinuous.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
