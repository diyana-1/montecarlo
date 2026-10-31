import React from 'react';
import { SimulationResults } from '../utils/math';
import { Calculator } from 'lucide-react';

interface StatsTableProps {
  results: SimulationResults;
}

export const StatsTable: React.FC<StatsTableProps> = ({ results }) => {
  const {
    mcMean,
    theoreticalMeanDiscrete,
    theoreticalMeanContinuous,
    absoluteError,
    percentError,
    median,
    stdDev,
    variance,
    minPrice,
    maxPrice,
    p5,
    p95,
    iqr,
    probProfit,
    config,
  } = results;

  const stats = [
    {
      name: 'Monte Carlo Sample Mean (S̄_T)',
      formula: '(1 / N) ∑ S_T^{(i)}',
      value: `$${mcMean.toFixed(2)}`,
      interpretation: `Sample expectation across ${config.numPaths.toLocaleString()} simulated paths`,
      category: 'central',
    },
    {
      name: 'Theoretical Discrete Expected Price E[S_T]',
      formula: 'S₀ · (1 + μΔt)^N',
      value: `$${theoreticalMeanDiscrete.toFixed(2)}`,
      interpretation: 'Exact analytical expected value under discrete time compounding',
      category: 'central',
    },
    {
      name: 'Theoretical Continuous Limit E[S_T]',
      formula: 'S₀ · exp(μ · T)',
      value: `$${theoreticalMeanContinuous.toFixed(2)}`,
      interpretation: `Continuous Geometric Brownian Motion benchmark (T = ${(config.steps * config.deltaT).toFixed(2)} yr)`,
      category: 'central',
    },
    {
      name: 'Absolute Error',
      formula: '|S̄_T - E[S_T]|',
      value: `$${absoluteError.toFixed(4)}`,
      interpretation: 'Deviation of Monte Carlo empirical estimate from theoretical mean',
      category: 'error',
    },
    {
      name: 'Relative Error (%)',
      formula: '(|Error| / E[S_T]) × 100%',
      value: `${percentError.toFixed(3)}%`,
      interpretation: 'Approaches 0 as N_paths → ∞ per the Central Limit Theorem (rate ~ 1/√N)',
      category: 'error',
    },
    {
      name: 'Median Terminal Price',
      formula: 'P₅₀ (50th Percentile)',
      value: `$${median.toFixed(2)}`,
      interpretation: 'Middle price in sorted distribution; robust against heavy right-tail skewness',
      category: 'percentiles',
    },
    {
      name: 'Sample Standard Deviation (s)',
      formula: '√[ ∑ (S_T - S̄)² / (N - 1) ]',
      value: `$${stdDev.toFixed(2)}`,
      interpretation: 'Dispersion / simulated pricing volatility at horizon T',
      category: 'dispersion',
    },
    {
      name: 'Sample Variance (s²)',
      formula: 's²',
      value: `${variance.toFixed(2)}`,
      interpretation: 'Second central sample moment of terminal stock prices',
      category: 'dispersion',
    },
    {
      name: '5th Percentile (P₅)',
      formula: 'Empirical 5% Quantile',
      value: `$${p5.toFixed(2)}`,
      interpretation: 'Financial Mathematics: 95% 1-tail empirical Value-at-Risk (VaR) lower floor',
      category: 'percentiles',
    },
    {
      name: '95th Percentile (P₉₅)',
      formula: 'Empirical 95% Quantile',
      value: `$${p95.toFixed(2)}`,
      interpretation: '95% of paths terminate at or below this value; 5% upside tail',
      category: 'percentiles',
    },
    {
      name: 'Interquartile Range (IQR)',
      formula: 'P₇₅ - P₂₅',
      value: `$${iqr.toFixed(2)}`,
      interpretation: 'Spread of the central 50% of the simulated distribution',
      category: 'dispersion',
    },
    {
      name: 'Minimum Simulated Price (Min)',
      formula: 'min(S_T)',
      value: `$${minPrice.toFixed(2)}`,
      interpretation: 'Worst recorded terminal price outcome in this batch',
      category: 'range',
    },
    {
      name: 'Maximum Simulated Price (Max)',
      formula: 'max(S_T)',
      value: `$${maxPrice.toFixed(2)}`,
      interpretation: 'Best recorded terminal price outcome in this batch',
      category: 'range',
    },
    {
      name: 'Empirical Probability of Profit',
      formula: 'P(S_T ≥ S₀)',
      value: `${probProfit.toFixed(1)}%`,
      interpretation: `Fraction of paths that concluded above initial purchase price $${config.s0.toFixed(2)}`,
      category: 'risk',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Summary Statistics Dashboard Table
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Empirical moments, quantiles, and errors for N = {config.numPaths.toLocaleString()} paths over {config.steps} steps
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Statistical Metric</th>
              <th className="py-2.5 px-3 font-mono">Mathematical Formula</th>
              <th className="py-2.5 px-3 text-right font-mono">Simulated Value</th>
              <th className="py-2.5 px-3">Curriculum Meaning & Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  {row.name}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                  {row.formula}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                  {row.value}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {row.interpretation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
