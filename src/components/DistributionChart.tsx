import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SimulationResults } from '../utils/math';
import { BarChart3 } from 'lucide-react';

Chart.register(...registerables);

interface DistributionChartProps {
  results: SimulationResults;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ results }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [metricMode, setMetricMode] = useState<'count' | 'percentage'>('count');

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const { histogram, theoreticalMeanDiscrete, mcMean, p5, p95 } = results;

    const labels = histogram.map(
      (b) => `$${b.binStart.toFixed(1)}–$${b.binEnd.toFixed(1)}`
    );

    const data = histogram.map((b) =>
      metricMode === 'count' ? b.count : parseFloat(b.percentage.toFixed(2))
    );

    // Color bars: highlight bins that contain theoretical mean and MC mean
    const backgroundColors = histogram.map((b) => {
      const containsTheo = theoreticalMeanDiscrete >= b.binStart && theoreticalMeanDiscrete < b.binEnd;
      const containsMC = mcMean >= b.binStart && mcMean < b.binEnd;
      if (containsTheo && containsMC) {
        return 'rgba(16, 185, 129, 0.85)'; // Emerald
      }
      if (containsTheo) {
        return 'rgba(217, 119, 6, 0.85)'; // Amber
      }
      if (containsMC) {
        return 'rgba(37, 99, 235, 0.85)'; // Blue
      }
      return 'rgba(59, 130, 246, 0.45)'; // Default blue
    });

    const borderColors = histogram.map((b) => {
      const containsTheo = theoreticalMeanDiscrete >= b.binStart && theoreticalMeanDiscrete < b.binEnd;
      const containsMC = mcMean >= b.binStart && mcMean < b.binEnd;
      if (containsTheo || containsMC) return '#0f172a';
      return '#2563eb';
    });

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: metricMode === 'count' ? 'Path Count' : 'Frequency (%)',
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            padding: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const b = histogram[idx];
                return `Price Bin: $${b.binStart.toFixed(2)} to $${b.binEnd.toFixed(2)}`;
              },
              label: (context) => {
                const idx = context.dataIndex;
                const b = histogram[idx];
                return [
                  `Paths: ${b.count.toLocaleString()} paths`,
                  `Relative Share: ${b.percentage.toFixed(2)}%`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Terminal Stock Price S_T ($)',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
              color: '#475569',
            },
            grid: {
              display: false,
            },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 9 },
              color: '#64748b',
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 14,
            },
          },
          y: {
            title: {
              display: true,
              text: metricMode === 'count' ? 'Frequency (Number of Paths)' : 'Relative Frequency (%)',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
              color: '#475569',
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
            },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: '#64748b',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [results, metricMode]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Terminal Price Distribution (S_T)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Empirical frequency distribution of final stock prices after {results.config.steps} steps
          </p>
        </div>

        {/* Toggle Count vs % */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('count')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Count
          </button>
          <button
            onClick={() => setMetricMode('percentage')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              metricMode === 'percentage'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Percentage (%)
          </button>
        </div>
      </div>

      <div className="h-[360px] w-full relative">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block"></span>
            <span>Simulated Frequencies</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block"></span>
            <span>Theoretical E[S_T] Bin</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block"></span>
            <span>Empirical Mean Bin</span>
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-600">
          Range: [${results.minPrice.toFixed(2)}, ${results.maxPrice.toFixed(2)}] &middot; 5%-95% VaR interval: [${results.p5.toFixed(2)}, ${results.p95.toFixed(2)}]
        </div>
      </div>
    </div>
  );
};
