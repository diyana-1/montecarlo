/**
 * Utility to generate a 100% self-contained, standalone single-file HTML file
 * using pure HTML5, CSS3, and Vanilla JavaScript with Chart.js loaded via CDN.
 * Enables students to download, inspect, run offline, or submit to university portals.
 */

import { SimulationConfig } from './math';

export function generateStandaloneHtml(currentConfig: SimulationConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monte Carlo Stock Price Simulator - Financial Mathematics II</title>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --amber-600: #d97706;
      --emerald-600: #059669;
      --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background-color: var(--slate-50);
      color: var(--slate-800);
      line-height: 1.5;
      padding: 1.5rem;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header {
      background: #fff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand-title { font-size: 1.25rem; font-weight: 700; color: var(--slate-900); }
    .brand-sub { font-size: 0.85rem; color: var(--slate-600); }
    .badge { font-size: 0.75rem; background: var(--slate-100); padding: 0.25rem 0.5rem; border-radius: 6px; font-weight: 600; color: var(--primary); }
    
    .grid { display: grid; grid-template-columns: 340px 1fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }
    
    .card {
      background: #fff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .card-title { font-size: 1rem; font-weight: 600; color: var(--slate-900); margin-bottom: 1rem; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.5rem; }
    
    .form-group { margin-bottom: 0.85rem; }
    label { display: block; font-size: 0.825rem; font-weight: 500; color: var(--slate-700); margin-bottom: 0.25rem; }
    input, select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      font-size: 0.875rem;
      font-family: var(--font-mono);
    }
    input:focus, select:focus { outline: none; border-color: var(--primary); }
    
    .btn {
      display: inline-block;
      width: 100%;
      padding: 0.65rem 1rem;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn:hover { background: var(--primary-hover); }
    .btn-secondary {
      background: var(--slate-100);
      color: var(--slate-700);
      margin-top: 0.5rem;
    }
    .btn-secondary:hover { background: var(--slate-200); }
    
    .preset-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; }
    .preset-btn {
      padding: 0.35rem 0.5rem;
      background: var(--slate-100);
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      text-align: center;
    }
    .preset-btn:hover { background: var(--slate-200); }
    
    .banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .banner-stat { display: flex; flex-direction: column; }
    .banner-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate-600); }
    .banner-value { font-size: 1.5rem; font-weight: 700; color: var(--slate-900); font-family: var(--font-mono); }
    .banner-desc { font-size: 0.75rem; color: var(--slate-600); margin-top: 0.2rem; }
    
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
    
    .chart-container { position: relative; height: 340px; width: 100%; }
    
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--slate-200); }
    th { font-weight: 600; color: var(--slate-600); background: var(--slate-50); }
    td.num, th.num { text-align: right; font-family: var(--font-mono); }
    
    .formula-box {
      background: #f8fafc;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--slate-700);
      margin-top: 0.75rem;
    }
    .error-msg { color: #dc2626; font-size: 0.75rem; margin-top: 0.25rem; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1 class="brand-title">Monte Carlo Stock Price Simulator</h1>
        <div class="brand-sub">Discrete Geometric Brownian Motion &middot; Financial Mathematics II</div>
      </div>
      <div>
        <span class="badge">&Delta;S_t = S_t &middot; [&mu;&Delta;t + &sigma;&radic;&Delta;t Z]</span>
      </div>
    </header>

    <div class="grid">
      <!-- Input Sidebar -->
      <aside>
        <div class="card">
          <h2 class="card-title">Model Parameters</h2>
          
          <div class="form-group">
            <label for="inp-s0">Initial Stock Price (S₀)</label>
            <input type="number" id="inp-s0" value="${currentConfig.s0}" step="1" min="0.01">
          </div>
          
          <div class="form-group">
            <label for="inp-mu">Expected Annual Return (&mu;, %)</label>
            <input type="number" id="inp-mu" value="${(currentConfig.mu * 100).toFixed(1)}" step="0.5">
          </div>
          
          <div class="form-group">
            <label for="inp-sigma">Annual Volatility (&sigma;, %)</label>
            <input type="number" id="inp-sigma" value="${(currentConfig.sigma * 100).toFixed(1)}" step="0.5" min="0">
          </div>
          
          <div class="form-group">
            <label for="inp-dt-mode">Time Interval (&Delta;t)</label>
            <select id="inp-dt-mode">
              <option value="0.0833333333" selected>Monthly (&Delta;t = 1/12 &approx; 0.0833)</option>
              <option value="0.003968254">Daily (&Delta;t = 1/252 &approx; 0.00397)</option>
              <option value="0.25">Quarterly (&Delta;t = 1/4 = 0.25)</option>
              <option value="1">Annual (&Delta;t = 1.0)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="inp-steps">Number of Time Steps</label>
            <input type="number" id="inp-steps" value="${currentConfig.steps}" step="1" min="1" max="365">
          </div>
          
          <div class="form-group">
            <label for="inp-paths">Number of Simulations (N_paths)</label>
            <input type="number" id="inp-paths" value="${currentConfig.numPaths}" step="100" min="1" max="20000">
          </div>

          <div class="form-group">
            <label for="inp-seed">Random Seed (Optional)</label>
            <input type="number" id="inp-seed" placeholder="Random (leave blank)" value="${currentConfig.seed ?? ''}">
          </div>
          
          <button id="btn-run" class="btn">Run Simulation</button>
          
          <div style="margin-top: 1rem;">
            <label style="font-weight: 600;">Course Benchmark Tests:</label>
            <div class="preset-btns">
              <button class="preset-btn" onclick="applyPreset('default')">Course Default</button>
              <button class="preset-btn" onclick="applyPreset('zeroVol')">&sigma; = 0% Test</button>
              <button class="preset-btn" onclick="applyPreset('highVol')">&sigma; = 60% Spread</button>
              <button class="preset-btn" onclick="applyPreset('converge')">N=10,000 Convergence</button>
            </div>
          </div>

          <div class="formula-box">
            <strong>Formula Reference:</strong><br>
            &Delta;S_t = S_t &middot; [&mu;&Delta;t + &sigma;&radic;&Delta;t &middot; Z]<br>
            S_{t+&Delta;t} = S_t + &Delta;S_t<br>
            Z ~ N(0,1) via Box-Muller
          </div>
        </div>
      </aside>

      <!-- Main Visuals & Stats -->
      <main>
        <!-- Verification Banner -->
        <div class="banner">
          <div class="banner-stat">
            <span class="banner-label">Theoretical E[S_T]</span>
            <span class="banner-value" id="val-theo">-</span>
            <span class="banner-desc">S₀(1 + &mu;&Delta;t)^N</span>
          </div>
          <div class="banner-stat">
            <span class="banner-label">Monte Carlo Mean</span>
            <span class="banner-value" id="val-mc">-</span>
            <span class="banner-desc" id="val-mc-paths">Across all paths</span>
          </div>
          <div class="banner-stat">
            <span class="banner-label">Absolute Error</span>
            <span class="banner-value" id="val-abs-err">-</span>
            <span class="banner-desc">|Mean - E[S_T]|</span>
          </div>
          <div class="banner-stat">
            <span class="banner-label">Percentage Error</span>
            <span class="banner-value" id="val-pct-err">-</span>
            <span class="banner-desc">Rel. error to theoretical</span>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <div class="card">
            <h2 class="card-title">Simulated Stock Price Paths (GBM)</h2>
            <div class="chart-container">
              <canvas id="chart-paths"></canvas>
            </div>
          </div>
          <div class="card">
            <h2 class="card-title">Terminal Price Distribution (S_T)</h2>
            <div class="chart-container">
              <canvas id="chart-dist"></canvas>
            </div>
          </div>
        </div>

        <!-- Summary Statistics Table -->
        <div class="card">
          <h2 class="card-title">Summary Statistics Dashboard Table</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th class="num">Simulated Value</th>
                <th>Theoretical / Interpretation</th>
              </tr>
            </thead>
            <tbody id="stats-tbody">
              <!-- populated by JS -->
            </tbody>
          </table>
        </div>

        <!-- Course Curriculum Spreadsheet Benchmark Table -->
        <div class="card">
          <h2 class="card-title">Course Exercise Spreadsheet Step-by-Step Breakdown (Path #1)</h2>
          <table>
            <thead>
              <tr>
                <th>Step (t)</th>
                <th>Stock Price at start (S_t)</th>
                <th>Random Sample (Z)</th>
                <th>Drift Component</th>
                <th>Diffusion Component</th>
                <th>Change in Price (&Delta;S_t)</th>
                <th>End Price (S_{t+1})</th>
              </tr>
            </thead>
            <tbody id="spreadsheet-tbody">
              <!-- populated by JS -->
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>

  <script>
    let pathChartInstance = null;
    let distChartInstance = null;

    function mulberry32(a) {
      return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }
    }

    function createRng(seed) {
      if (seed !== null && seed !== undefined && !isNaN(seed)) {
        return mulberry32(Math.floor(seed) >>> 0);
      }
      return Math.random;
    }

    function generateZ(rng) {
      let u1 = rng(), u2 = rng();
      while (u1 <= 1e-15) u1 = rng();
      while (u2 <= 1e-15) u2 = rng();
      return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    }

    function runSim() {
      const s0 = parseFloat(document.getElementById('inp-s0').value);
      const mu = parseFloat(document.getElementById('inp-mu').value) / 100;
      const sigma = parseFloat(document.getElementById('inp-sigma').value) / 100;
      const deltaT = parseFloat(document.getElementById('inp-dt-mode').value);
      const steps = parseInt(document.getElementById('inp-steps').value, 10);
      const numPaths = parseInt(document.getElementById('inp-paths').value, 10);
      const seedVal = document.getElementById('inp-seed').value.trim();
      const seed = seedVal ? parseInt(seedVal, 10) : null;

      if (isNaN(s0) || s0 <= 0 || isNaN(sigma) || sigma < 0 || isNaN(steps) || steps < 1 || isNaN(numPaths) || numPaths < 1) {
        alert('Please verify inputs: S0 > 0, Sigma >= 0, Steps >= 1, Paths >= 1');
        return;
      }

      const rng = createRng(seed);
      const sqrtDeltaT = Math.sqrt(deltaT);
      const maxPlotPaths = Math.min(50, numPaths);
      
      const plotPaths = [];
      const terminalPrices = new Array(numPaths);
      const sumTrajectory = new Array(steps + 1).fill(0);
      sumTrajectory[0] = s0 * numPaths;

      let firstPathSteps = [];

      for (let i = 0; i < numPaths; i++) {
        let currentS = s0;
        const prices = [s0];
        
        for (let t = 1; t <= steps; t++) {
          const z = sigma === 0 ? 0 : generateZ(rng);
          const drift = currentS * (mu * deltaT);
          const diffusion = currentS * (sigma * sqrtDeltaT * z);
          const deltaS = drift + diffusion;
          const nextS = Math.max(0, currentS + deltaS);
          
          prices.push(nextS);
          sumTrajectory[t] += nextS;

          if (i === 0) {
            firstPathSteps.push({
              step: t,
              sStart: currentS,
              z: z,
              drift: drift,
              diffusion: diffusion,
              deltaS: deltaS,
              sEnd: nextS
            });
          }
          currentS = nextS;
        }

        terminalPrices[i] = currentS;
        if (i < maxPlotPaths) {
          plotPaths.push(prices);
        }
      }

      // Theoretical calculations
      const theoMean = s0 * Math.pow(1 + mu * deltaT, steps);
      const sorted = [...terminalPrices].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mcMean = sum / numPaths;
      const absErr = Math.abs(mcMean - theoMean);
      const pctErr = (absErr / theoMean) * 100;

      // Update Banner
      document.getElementById('val-theo').textContent = '$' + theoMean.toFixed(2);
      document.getElementById('val-mc').textContent = '$' + mcMean.toFixed(2);
      document.getElementById('val-mc-paths').textContent = numPaths.toLocaleString() + ' paths simulated';
      document.getElementById('val-abs-err').textContent = '$' + absErr.toFixed(4);
      document.getElementById('val-pct-err').textContent = pctErr.toFixed(2) + '%';

      // Summary Stats
      const mid = Math.floor(numPaths / 2);
      const median = numPaths % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      let sumSq = 0;
      for (let i = 0; i < numPaths; i++) {
        const d = terminalPrices[i] - mcMean;
        sumSq += d * d;
      }
      const variance = numPaths > 1 ? sumSq / (numPaths - 1) : 0;
      const stdDev = Math.sqrt(variance);
      const minPrice = sorted[0];
      const maxPrice = sorted[sorted.length - 1];
      const p5 = sorted[Math.floor(numPaths * 0.05)];
      const p95 = sorted[Math.min(numPaths - 1, Math.floor(numPaths * 0.95))];

      // Render Stats Table
      const statsTbody = document.getElementById('stats-tbody');
      statsTbody.innerHTML = [
        ['Monte Carlo Mean Price', '$' + mcMean.toFixed(2), 'Sample average of terminal prices S_T'],
        ['Theoretical Expected Price E[S_T]', '$' + theoMean.toFixed(2), 'Discrete analytical expectation S₀(1 + &mu;&Delta;t)^N'],
        ['Absolute Difference / Error', '$' + absErr.toFixed(4), '|MC Mean - Theoretical Mean|'],
        ['Percentage Error', pctErr.toFixed(3) + '%', 'Relative error measure'],
        ['Median Terminal Price', '$' + median.toFixed(2), '50th percentile (less sensitive to heavy tails)'],
        ['Standard Deviation (&sigma;_sample)', '$' + stdDev.toFixed(2), 'Dispersion of final prices'],
        ['5th Percentile (Value-at-Risk 95%)', '$' + p5.toFixed(2), '95% of paths ended above this price'],
        ['95th Percentile', '$' + p95.toFixed(2), '5% of paths ended above this price'],
        ['Minimum Price', '$' + minPrice.toFixed(2), 'Worst-case simulated price'],
        ['Maximum Price', '$' + maxPrice.toFixed(2), 'Best-case simulated price']
      ].map(([label, val, desc]) => '<tr><td>' + label + '</td><td class="num"><strong>' + val + '</strong></td><td>' + desc + '</td></tr>').join('');

      // Render Spreadsheet Step Breakdown
      const sheetTbody = document.getElementById('spreadsheet-tbody');
      sheetTbody.innerHTML = firstPathSteps.map(s => 
        '<tr>' +
        '<td>Month ' + s.step + '</td>' +
        '<td class="num">$' + s.sStart.toFixed(4) + '</td>' +
        '<td class="num">' + s.z.toFixed(4) + '</td>' +
        '<td class="num">$' + s.drift.toFixed(4) + '</td>' +
        '<td class="num">$' + s.diffusion.toFixed(4) + '</td>' +
        '<td class="num" style="color:' + (s.deltaS >= 0 ? '#059669' : '#dc2626') + '">$' + s.deltaS.toFixed(4) + '</td>' +
        '<td class="num"><strong>$' + s.sEnd.toFixed(4) + '</strong></td>' +
        '</tr>'
      ).join('');

      // Chart 1: Paths
      const timeLabels = [];
      const theoTrajectory = [];
      const meanTrajectory = [];
      for (let t = 0; t <= steps; t++) {
        timeLabels.push('Step ' + t);
        theoTrajectory.push(s0 * Math.pow(1 + mu * deltaT, t));
        meanTrajectory.push(sumTrajectory[t] / numPaths);
      }

      const datasets = plotPaths.map((p, idx) => ({
        label: 'Path ' + (idx + 1),
        data: p,
        borderColor: 'rgba(59, 130, 246, 0.25)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }));

      // Add theoretical line
      datasets.push({
        label: 'Theoretical Mean',
        data: theoTrajectory,
        borderColor: '#d97706',
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 2,
        fill: false,
        tension: 0.1
      });

      // Add MC Mean line
      datasets.push({
        label: 'Monte Carlo Mean',
        data: meanTrajectory,
        borderColor: '#059669',
        borderWidth: 2.5,
        pointRadius: 2,
        fill: false,
        tension: 0.1
      });

      if (pathChartInstance) pathChartInstance.destroy();
      const ctxPath = document.getElementById('chart-paths').getContext('2d');
      pathChartInstance = new Chart(ctxPath, {
        type: 'line',
        data: { labels: timeLabels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                filter: item => item.text === 'Theoretical Mean' || item.text === 'Monte Carlo Mean'
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Time Step (t)' } },
            y: { title: { display: true, text: 'Stock Price ($)' } }
          }
        }
      });

      // Chart 2: Distribution
      const numBins = Math.min(25, Math.max(10, Math.round(Math.sqrt(numPaths))));
      const binWidth = (maxPrice - minPrice) / (numBins || 1);
      const binCounts = new Array(numBins).fill(0);
      const binLabels = [];
      
      if (binWidth > 0) {
        for (let i = 0; i < numPaths; i++) {
          let b = Math.floor((terminalPrices[i] - minPrice) / binWidth);
          if (b >= numBins) b = numBins - 1;
          if (b < 0) b = 0;
          binCounts[b]++;
        }
        for (let b = 0; b < numBins; b++) {
          const start = minPrice + b * binWidth;
          const end = start + binWidth;
          binLabels.push('$' + start.toFixed(1) + '-' + end.toFixed(1));
        }
      } else {
        binCounts[0] = numPaths;
        binLabels.push('$' + minPrice.toFixed(2));
      }

      if (distChartInstance) distChartInstance.destroy();
      const ctxDist = document.getElementById('chart-dist').getContext('2d');
      distChartInstance = new Chart(ctxDist, {
        type: 'bar',
        data: {
          labels: binLabels,
          datasets: [{
            label: 'Frequency of Terminal Price S_T',
            data: binCounts,
            backgroundColor: 'rgba(37, 99, 235, 0.65)',
            borderColor: '#2563eb',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Terminal Price Range ($)' }, ticks: { maxRotation: 45, minRotation: 45 } },
            y: { title: { display: true, text: 'Number of Paths' } }
          }
        }
      });
    }

    function applyPreset(type) {
      if (type === 'default') {
        document.getElementById('inp-s0').value = 50;
        document.getElementById('inp-mu').value = 12;
        document.getElementById('inp-sigma').value = 25;
        document.getElementById('inp-dt-mode').value = '0.0833333333';
        document.getElementById('inp-steps').value = 6;
        document.getElementById('inp-paths').value = 1000;
        document.getElementById('inp-seed').value = '';
      } else if (type === 'zeroVol') {
        document.getElementById('inp-s0').value = 50;
        document.getElementById('inp-mu').value = 12;
        document.getElementById('inp-sigma').value = 0;
        document.getElementById('inp-dt-mode').value = '0.0833333333';
        document.getElementById('inp-steps').value = 6;
        document.getElementById('inp-paths').value = 100;
        document.getElementById('inp-seed').value = 42;
      } else if (type === 'highVol') {
        document.getElementById('inp-s0').value = 50;
        document.getElementById('inp-mu').value = 12;
        document.getElementById('inp-sigma').value = 60;
        document.getElementById('inp-dt-mode').value = '0.0833333333';
        document.getElementById('inp-steps').value = 6;
        document.getElementById('inp-paths').value = 1000;
      } else if (type === 'converge') {
        document.getElementById('inp-s0').value = 50;
        document.getElementById('inp-mu').value = 12;
        document.getElementById('inp-sigma').value = 25;
        document.getElementById('inp-dt-mode').value = '0.0833333333';
        document.getElementById('inp-steps').value = 6;
        document.getElementById('inp-paths').value = 10000;
      }
      runSim();
    }

    document.getElementById('btn-run').addEventListener('click', runSim);
    window.addEventListener('DOMContentLoaded', runSim);
  </script>
</body>
</html>`;
}
