import React, { useState } from 'react';
import { SimulationResults, PathResult, runCourseBenchmarkPath } from '../utils/math';
import { Table, Check, Copy, Download, FileSpreadsheet } from 'lucide-react';

interface SpreadsheetTableProps {
  results: SimulationResults;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({ results }) => {
  const [selectedPathIndex, setSelectedPathIndex] = useState<number>(1);
  const [useCourseBenchmark, setUseCourseBenchmark] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Determine active path
  const benchmarkPath = runCourseBenchmarkPath(results.config);
  const activePath: PathResult = useCourseBenchmark
    ? benchmarkPath
    : results.samplePaths.find((p) => p.pathIndex === selectedPathIndex) || results.samplePaths[0] || benchmarkPath;

  const handleCopyCsv = () => {
    let csv = 'Month,Stock Price at start period,Random Sample Z,Drift Component,Diffusion Component,Change in stock price,End Stock Price\n';
    activePath.steps.forEach((s) => {
      csv += `${s.step},${s.sStart.toFixed(8)},${s.z.toFixed(8)},${s.drift.toFixed(8)},${s.diffusion.toFixed(8)},${s.deltaS.toFixed(8)},${s.sEnd.toFixed(8)}\n`;
    });
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    let csv = 'Month,Stock Price at start period,Random Sample Z,Drift Component,Diffusion Component,Change in stock price,End Stock Price\n';
    activePath.steps.forEach((s) => {
      csv += `${s.step},${s.sStart.toFixed(8)},${s.z.toFixed(8)},${s.drift.toFixed(8)},${s.diffusion.toFixed(8)},${s.deltaS.toFixed(8)},${s.sEnd.toFixed(8)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monte_carlo_path_${activePath.pathIndex}_steps.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Course Exercise Spreadsheet Replicator
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Step-by-step arithmetic decomposition matching Financial Mathematics II course Excel sheet
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Toggle between lecture benchmark and simulated path */}
          <button
            onClick={() => setUseCourseBenchmark(!useCourseBenchmark)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              useCourseBenchmark
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {useCourseBenchmark ? '✓ Replicating Lecture Excel Sample' : 'Load Lecture Excel Z-Values'}
          </button>

          {!useCourseBenchmark && results.samplePaths.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
              <span className="text-slate-500 text-[11px]">Inspect Path:</span>
              <select
                value={selectedPathIndex}
                onChange={(e) => setSelectedPathIndex(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono font-medium cursor-pointer"
              >
                {results.samplePaths.slice(0, 20).map((p) => (
                  <option key={p.pathIndex} value={p.pathIndex}>
                    Path #{p.pathIndex} (Term: ${p.terminalPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleCopyCsv}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Copy CSV to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadCsv}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {useCourseBenchmark && (
        <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Curriculum Reference Mode Active:</span> This path uses the exact standard normal random variates Z from the course exercise spreadsheet:
            <span className="font-mono ml-1 text-slate-700">
              [Z₀=0.8604, Z₁=1.4459, Z₂=-0.9433, Z₃=1.0226, Z₄=-0.5771, Z₅=-0.6628]
            </span>. Observe that S₁ = $53.6046, S₂ = $59.7343, matching your classroom exercise table down to the last decimal!
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Month / Step (t)</th>
              <th className="py-2.5 px-3 text-right font-mono">Stock Price (S_t)</th>
              <th className="py-2.5 px-3 text-right font-mono">Random Sample (Z)</th>
              <th className="py-2.5 px-3 text-right font-mono">Drift: S_t · μΔt</th>
              <th className="py-2.5 px-3 text-right font-mono">Diffusion: S_t · σ√Δt · Z</th>
              <th className="py-2.5 px-3 text-right font-mono">Price Change (ΔS_t)</th>
              <th className="py-2.5 px-3 text-right font-mono">End Price (S_t+1)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {activePath.steps.map((s) => {
              const isGain = s.deltaS >= 0;
              return (
                <tr key={s.step} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                    Month {s.step}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-800">
                    ${s.sStart.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {s.z.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    ${s.drift.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    ${s.diffusion.toFixed(6)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold ${
                      isGain ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {isGain ? '+' : ''}${s.deltaS.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${s.sEnd.toFixed(6)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex flex-col md:flex-row justify-between gap-2">
        <div>
          <span className="font-semibold text-slate-800">Discrete Formulation:</span>
          <span className="font-mono text-slate-700 ml-1">
            ΔS_t = S_t · [μ · Δt + σ · √Δt · Z], where Δt = {results.config.deltaT.toFixed(5)} yr
          </span>
        </div>
        <div className="font-mono text-slate-700">
          Terminal Price (Month {results.config.steps}): <strong className="text-slate-900">${activePath.terminalPrice.toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
};
