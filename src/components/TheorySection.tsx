import React from 'react';
import { BookOpen, CheckCircle, HelpCircle } from 'lucide-react';

export const TheorySection: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial Mathematics II: Discrete Geometric Brownian Motion Theory
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Theoretical foundation, stochastic calculus discretization, and verification test proofs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Model derivation */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-blue-600 rounded-xs"></span>
            1. Continuous SDE to Discrete Price Step
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In continuous time, Black-Scholes-Merton models stock prices using the Geometric Brownian Motion (GBM) stochastic differential equation:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800">
            dS_t = μ · S_t · dt + σ · S_t · dW_t
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Under the discrete Euler-Maruyama scheme implemented in your classroom exercise spreadsheet:
          </p>
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg font-mono text-xs text-blue-900 space-y-1">
            <div>ΔS_t = S_t · [μ · Δt + σ · √Δt · Z]</div>
            <div>S_(t + Δt) = S_t + ΔS_t = S_t · (1 + μ · Δt + σ · √Δt · Z)</div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Where <code className="font-mono text-slate-800">Z ~ N(0, 1)</code> is a standard normal random variable. Since <code className="font-mono text-slate-800">E[Z] = 0</code>, the conditional expectation of the next step is:
          </p>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-800">
            E[S_(t + Δt) | S_t] = S_t · (1 + μ · Δt)
          </div>
          <p className="text-xs text-slate-600">
            Iterating across <code className="font-mono text-slate-800">N</code> steps yields the analytical discrete expectation:
            <strong className="font-mono ml-1 text-slate-900">E[S_T] = S₀ · (1 + μ · Δt)ᴺ</strong>.
          </p>
        </div>

        {/* Box-Muller & Random variate generation */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-xs"></span>
            2. Box-Muller Transform
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard pseudo-random number generators provide uniformly distributed variates <code className="font-mono text-slate-800">U₁, U₂ ~ Uniform(0, 1)</code>. The Box-Muller transformation converts them into independent standard normal variates:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 space-y-1">
            <div>Z = √(-2 · ln(U₁)) · cos(2 · π · U₂)</div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            By transforming Cartesian coordinates into polar coordinates under bivariate Gaussian symmetry:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
            <li><code className="font-mono">R² = -2 ln(U₁) ~ Exponential(1/2)</code> (Chi-squared with 2 d.o.f.)</li>
            <li><code className="font-mono">θ = 2π U₂ ~ Uniform(0, 2π)</code> (random angle)</li>
            <li>Yields exact standard normal variate with mean 0 and variance 1 without numerical approximation error.</li>
          </ul>
        </div>
      </div>

      {/* Curriculum Verification Tests Explained */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Curriculum Laboratory Tests & Mathematical Proofs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Test 1 */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Test 1: Zero Volatility (σ = 0%)</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              When σ = 0, the diffusion term <code className="font-mono">S_t · σ · √Δt · Z</code> vanishes identically.
            </p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 mb-2">
              ΔS_t = S_t · μ · Δt (Deterministic)
            </div>
            <p className="text-slate-500 text-[11px]">
              Every path is identical and perfectly matches the theoretical line: S_T = 50 · (1 + 0.12 · 1/12)⁶ = $53.076.
            </p>
          </div>

          {/* Test 2 */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Test 2: Volatility Sensitivity</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Comparing σ = 25% vs σ = 60%: higher volatility increases diffusion variance directly proportional to σ².
            </p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 mb-2">
              Var(ΔS_t | S_t) = S_t² · σ² · Δt
            </div>
            <p className="text-slate-500 text-[11px]">
              The terminal price histogram widens substantially, showing higher dispersion, fatter tails, and wider 5%-95% VaR bounds.
            </p>
          </div>

          {/* Test 3 */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Test 3: Monte Carlo Convergence</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              By the Central Limit Theorem, the standard error of the Monte Carlo mean scales with sample size:
            </p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 mb-2">
              Standard Error = σ_terminal / √N_paths
            </div>
            <p className="text-slate-500 text-[11px]">
              Increasing N from 10 to 10,000 cuts sampling error by a factor of ~31.6, driving Monte Carlo mean to theoretical E[S_T].
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
