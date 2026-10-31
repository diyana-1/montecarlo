/**
 * Mathematical utilities for Monte Carlo Discrete Geometric Brownian Motion
 * Application: Financial Mathematics II
 * 
 * Formula:
 *   ΔS_t = S_t * [μ * Δt + σ * sqrt(Δt) * Z]
 *   S_(t + Δt) = S_t + ΔS_t
 *   Z ~ N(0, 1) generated via Box-Muller transform
 */

export interface SimulationConfig {
  s0: number;          // Initial Stock Price (S₀)
  mu: number;          // Expected Return (μ) as decimal (e.g. 0.12)
  sigma: number;       // Annual Volatility (σ) as decimal (e.g. 0.25)
  deltaT: number;      // Time Interval Δt in years (e.g. 1/12)
  steps: number;       // Number of time steps (e.g. 6)
  numPaths: number;    // Number of simulated paths (e.g. 1000)
  seed?: number | null;// Optional seed for reproducibility
}

export interface StepDetail {
  step: number;
  time: number;
  sStart: number;
  z: number;
  drift: number;
  diffusion: number;
  deltaS: number;
  sEnd: number;
}

export interface PathResult {
  pathIndex: number;
  prices: number[];
  steps: StepDetail[];
  terminalPrice: number;
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  binMid: number;
  count: number;
  percentage: number;
}

export interface SimulationResults {
  config: SimulationConfig;
  paths: PathResult[];
  terminalPrices: number[];
  samplePaths: PathResult[]; // subset limited to e.g. 50 paths for chart rendering
  
  // Theoretical calculations
  theoreticalMeanDiscrete: number;   // S₀ * (1 + μ * Δt)^steps
  theoreticalMeanContinuous: number; // S₀ * exp(μ * T)
  
  // Monte Carlo summary statistics
  mcMean: number;
  absoluteError: number;
  percentError: number;
  median: number;
  stdDev: number;
  variance: number;
  minPrice: number;
  maxPrice: number;
  p5: number;
  p95: number;
  iqr: number;
  probProfit: number; // P(S_T >= S₀)
  
  // Histogram distribution
  histogram: HistogramBin[];
  
  // Time array for X-axis
  timeLabels: string[];
  stepLabels: number[];
  
  // Expected path array across time
  theoreticalTrajectory: number[];
  mcMeanTrajectory: number[];
}

/**
 * Pseudo-random generator (Mulberry32) for reproducible simulation
 */
export function createRNG(seed?: number | null): () => number {
  if (seed === undefined || seed === null || isNaN(seed)) {
    return () => Math.random();
  }
  let a = (Math.abs(Math.floor(seed)) + 1) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform to generate standard normal variate Z ~ N(0, 1)
 * Z = sqrt(-2 * ln(U1)) * cos(2 * π * U2)
 */
export function generateStandardNormal(rng: () => number): number {
  let u1 = rng();
  let u2 = rng();
  
  // Prevent ln(0)
  while (u1 <= 1e-15) {
    u1 = rng();
  }
  while (u2 <= 1e-15) {
    u2 = rng();
  }
  
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0;
}

/**
 * Runs the Monte Carlo simulation
 */
export function runSimulation(config: SimulationConfig, maxChartPaths = 50): SimulationResults {
  const { s0, mu, sigma, deltaT, steps, numPaths, seed } = config;
  const rng = createRNG(seed);
  const sqrtDeltaT = Math.sqrt(deltaT);
  
  const paths: PathResult[] = [];
  const terminalPrices: number[] = new Array(numPaths);
  const sumTrajectory: number[] = new Array(steps + 1).fill(0);
  sumTrajectory[0] = s0 * numPaths;

  for (let i = 0; i < numPaths; i++) {
    const prices: number[] = new Array(steps + 1);
    prices[0] = s0;
    
    // We only need full step detail records for the first few paths (for display / table inspection)
    const recordDetails = i < Math.max(50, maxChartPaths);
    const stepDetails: StepDetail[] = [];
    
    let currentS = s0;
    for (let t = 1; t <= steps; t++) {
      const z = sigma === 0 ? 0 : generateStandardNormal(rng);
      
      const drift = currentS * (mu * deltaT);
      const diffusion = currentS * (sigma * sqrtDeltaT * z);
      const deltaS = drift + diffusion;
      const nextS = currentS + deltaS;
      
      // Stock prices in discrete models can theoretically hit ≤ 0 if variance is huge;
      // floor at 0 for financial reality
      const boundedNextS = Math.max(0, nextS);
      prices[t] = boundedNextS;
      sumTrajectory[t] += boundedNextS;
      
      if (recordDetails) {
        stepDetails.push({
          step: t,
          time: t * deltaT,
          sStart: currentS,
          z,
          drift,
          diffusion,
          deltaS,
          sEnd: boundedNextS,
        });
      }
      
      currentS = boundedNextS;
    }
    
    const terminalPrice = prices[steps];
    terminalPrices[i] = terminalPrice;
    
    paths.push({
      pathIndex: i + 1,
      prices,
      steps: stepDetails,
      terminalPrice,
    });
  }

  // Summary statistics
  const sortedTerminal = [...terminalPrices].sort((a, b) => a - b);
  const sum = sortedTerminal.reduce((acc, v) => acc + v, 0);
  const mcMean = sum / numPaths;
  
  // Median
  const mid = Math.floor(numPaths / 2);
  const median = numPaths % 2 === 0
    ? (sortedTerminal[mid - 1] + sortedTerminal[mid]) / 2
    : sortedTerminal[mid];
    
  // Standard Deviation
  let sumSqDiff = 0;
  for (let i = 0; i < numPaths; i++) {
    const diff = terminalPrices[i] - mcMean;
    sumSqDiff += diff * diff;
  }
  const variance = numPaths > 1 ? sumSqDiff / (numPaths - 1) : 0;
  const stdDev = Math.sqrt(variance);
  
  // Percentiles
  const p5Index = Math.max(0, Math.floor(numPaths * 0.05));
  const p95Index = Math.min(numPaths - 1, Math.floor(numPaths * 0.95));
  const p25Index = Math.max(0, Math.floor(numPaths * 0.25));
  const p75Index = Math.min(numPaths - 1, Math.floor(numPaths * 0.75));
  
  const p5 = sortedTerminal[p5Index];
  const p95 = sortedTerminal[p95Index];
  const iqr = sortedTerminal[p75Index] - sortedTerminal[p25Index];
  const minPrice = sortedTerminal[0];
  const maxPrice = sortedTerminal[numPaths - 1];
  
  const profitableCount = sortedTerminal.filter(p => p >= s0).length;
  const probProfit = (profitableCount / numPaths) * 100;
  
  // Theoretical Means
  // Discrete: E[S_T] = S_0 * (1 + μ * Δt)^steps
  const theoreticalMeanDiscrete = s0 * Math.pow(1 + mu * deltaT, steps);
  const theoreticalMeanContinuous = s0 * Math.exp(mu * (steps * deltaT));
  
  const absoluteError = Math.abs(mcMean - theoreticalMeanDiscrete);
  const percentError = (absoluteError / theoreticalMeanDiscrete) * 100;
  
  // Trajectories
  const theoreticalTrajectory: number[] = [];
  const mcMeanTrajectory: number[] = [];
  for (let t = 0; t <= steps; t++) {
    theoreticalTrajectory.push(s0 * Math.pow(1 + mu * deltaT, t));
    mcMeanTrajectory.push(sumTrajectory[t] / numPaths);
  }
  
  // Time and Step labels
  const timeLabels: string[] = [];
  const stepLabels: number[] = [];
  for (let t = 0; t <= steps; t++) {
    stepLabels.push(t);
    const yrs = (t * deltaT).toFixed(3);
    timeLabels.push(`Step ${t} (${yrs}y)`);
  }
  
  // Build histogram for distribution chart (20 to 30 bins)
  const numBins = Math.min(30, Math.max(10, Math.round(Math.sqrt(numPaths))));
  const binMin = minPrice;
  const binMax = maxPrice;
  const binWidth = (binMax - binMin) / (numBins || 1);
  
  const histogram: HistogramBin[] = [];
  if (binWidth > 0) {
    const counts = new Array(numBins).fill(0);
    for (let i = 0; i < numPaths; i++) {
      const p = terminalPrices[i];
      let b = Math.floor((p - binMin) / binWidth);
      if (b >= numBins) b = numBins - 1;
      if (b < 0) b = 0;
      counts[b]++;
    }
    
    for (let b = 0; b < numBins; b++) {
      const bStart = binMin + b * binWidth;
      const bEnd = bStart + binWidth;
      histogram.push({
        binStart: bStart,
        binEnd: bEnd,
        binMid: (bStart + bEnd) / 2,
        count: counts[b],
        percentage: (counts[b] / numPaths) * 100,
      });
    }
  } else {
    // When sigma = 0, all prices are identical
    histogram.push({
      binStart: minPrice,
      binEnd: maxPrice,
      binMid: minPrice,
      count: numPaths,
      percentage: 100,
    });
  }

  // Slice representative sample paths for chart rendering
  const samplePaths = paths.slice(0, Math.min(paths.length, maxChartPaths));

  return {
    config,
    paths,
    terminalPrices,
    samplePaths,
    theoreticalMeanDiscrete,
    theoreticalMeanContinuous,
    mcMean,
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
    histogram,
    timeLabels,
    stepLabels,
    theoreticalTrajectory,
    mcMeanTrajectory,
  };
}

/**
 * Pre-defined Course Exercise Data for exact replication of lecture spreadsheet
 */
export const COURSE_EXCEL_BENCHMARK_Z = [
  0.860380215,   // Month 0 -> 1: S0 = 50 -> ΔS = 3.604629679 -> S1 = 53.60462968
  1.445908137,   // Month 1 -> 2: S1 = 53.6046 -> ΔS = 6.129658932 -> S2 = 59.73428861
  -0.943337816,  // Month 2 -> 3: S2 = 59.7342 -> ΔS = -3.469340168 -> S3 = 56.26494844
  1.022598433,   // Month 3 -> 4: S3 = 56.2649 -> ΔS = 4.714984961 -> S4 = 60.97993340
  -0.577137728,  // Month 4 -> 5: S4 = 60.9799 -> ΔS = -1.930095863 -> S5 = 59.04983754
  -0.662767999,  // Month 5 -> 6: S5 = 59.0498 -> ΔS = -2.233923873 -> S6 = 56.81591367
];

/**
 * Run single exact benchmark path using lecture Z numbers
 */
export function runCourseBenchmarkPath(config: SimulationConfig): PathResult {
  const { s0, mu, sigma, deltaT, steps } = config;
  const sqrtDeltaT = Math.sqrt(deltaT);
  const prices = [s0];
  const stepDetails: StepDetail[] = [];
  
  let currentS = s0;
  for (let t = 1; t <= steps; t++) {
    // Use course benchmark Z if within 6 steps, else 0
    const z = COURSE_EXCEL_BENCHMARK_Z[t - 1] ?? 0;
    const drift = currentS * (mu * deltaT);
    const diffusion = currentS * (sigma * sqrtDeltaT * z);
    const deltaS = drift + diffusion;
    const nextS = currentS + deltaS;
    prices.push(nextS);
    stepDetails.push({
      step: t,
      time: t * deltaT,
      sStart: currentS,
      z,
      drift,
      diffusion,
      deltaS,
      sEnd: nextS,
    });
    currentS = nextS;
  }
  
  return {
    pathIndex: 1,
    prices,
    steps: stepDetails,
    terminalPrice: currentS,
  };
}
