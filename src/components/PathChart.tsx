import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SimulationResults } from '../utils/math';
import { Eye, TrendingUp } from 'lucide-react';

Chart.register(...registerables);

interface PathChartProps {
  results: SimulationResults;
}

export const PathChart: React.FC<PathChartProps> = ({ results }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [maxDisplayPaths, setMaxDisplayPaths] = useState<number>(30);
  const [showTheoretical, setShowTheoretical] = useState<boolean>(true);
  const [showMeanPath, setShowMeanPath] = useState<boolean>(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const {
      samplePaths,
      timeLabels,
      theoreticalTrajectory,
      mcMeanTrajectory,
      config,
    } = results;

    const visiblePaths = samplePaths.slice(0, Math.min(samplePaths.length, maxDisplayPaths));

    // Colors for paths
    const pathDatasets = visiblePaths.map((p, idx) => {
      // Subtle gradient variations of blue/cyan/indigo
      const hue = 210 + (idx % 8) * 4;
      return {
        label: `Path ${p.pathIndex}`,
        data: p.prices,
        borderColor: `hsla(${hue}, 85%, 52%, 0.35)`,
        borderWidth: 1.2,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: false,
        tension: 0.15,
      };
    });

    const datasets: any[] = [...pathDatasets];

    // Theoretical trajectory line
    if (showTheoretical) {
      datasets.push({
        label: `Theoretical Mean: S₀(1+μΔt)ᵗ`,
        data: theoreticalTrajectory,
        borderColor: '#d97706', // Amber-600
        borderWidth: 2.5,
        borderDash: [5, 4],
        pointRadius: 3,
        pointBackgroundColor: '#d97706',
        pointHoverRadius: 6,
        fill: false,
        tension: 0.15,
        order: -1,
      });
    }

    // Monte Carlo Empirical Mean trajectory line
    if (showMeanPath) {
      datasets.push({
        label: `Simulated Mean (${config.numPaths} paths)`,
        data: mcMeanTrajectory,
        borderColor: '#059669', // Emerald-600
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#059669',
        pointHoverRadius: 6,
        fill: false,
        tension: 0.15,
        order: -2,
      });
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400,
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 16,
              boxHeight: 4,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
              },
              filter: (item) => {
                // Only show Theoretical and MC Mean in legend so 50 paths don't clutter the box
                return (
                  item.text?.includes('Theoretical Mean') ||
                  item.text?.includes('Simulated Mean')
                );
              },
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            padding: 10,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = (context.parsed.y as number).toFixed(2);
                return `${label}: $${val}`;
              },
            },
            // Filter tooltip items if too many
            filter: (tooltipItem) => {
              if (
                tooltipItem.dataset.label?.includes('Theoretical') ||
                tooltipItem.dataset.label?.includes('Simulated')
              ) {
                return true;
              }
              // Only show first 3 paths in tooltip to prevent overflowing screen
              return (tooltipItem.datasetIndex || 0) < 3;
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: `Time Step (Δt = ${results.config.deltaT.toFixed(4)} yr / step)`,
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
          y: {
            title: {
              display: true,
              text: 'Stock Price ($)',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
              color: '#475569',
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
            },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: '#64748b',
              callback: (val) => `$${Number(val).toFixed(1)}`,
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
  }, [results, maxDisplayPaths, showTheoretical, showMeanPath]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Simulated Price Trajectories
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Rendering {Math.min(results.samplePaths.length, maxDisplayPaths)} paths for visual clarity (computed {results.config.numPaths.toLocaleString()} paths)
          </p>
        </div>

        {/* Chart View Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <span className="text-slate-500 text-[11px] px-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Visible:</span>
            </span>
            {[10, 30, 50].map((count) => (
              <button
                key={count}
                onClick={() => setMaxDisplayPaths(count)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  maxDisplayPaths === count
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTheoretical(!showTheoretical)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showTheoretical
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Theoretical Curve
          </button>

          <button
            onClick={() => setShowMeanPath(!showMeanPath)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showMeanPath
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Simulated Mean Line
          </button>
        </div>
      </div>

      <div className="h-[360px] w-full relative">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
            <span>Individual Sample Paths</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border-t border-dashed border-amber-600 inline-block"></span>
            <span>Theoretical E[S_t]</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span>
            <span>Empirical Path Mean</span>
          </span>
        </div>
        <div className="font-mono text-[11px]">
          S₀ = ${results.config.s0.toFixed(2)} &middot; μ = {(results.config.mu * 100).toFixed(1)}% &middot; σ = {(results.config.sigma * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
