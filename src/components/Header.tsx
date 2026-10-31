import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  onExportHtml: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportHtml,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single line, display face) */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Monte Carlo Stock Price Simulator
            </span>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('overview')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'overview' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('paths')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'paths' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Simulated Paths
            </button>
            <button
              onClick={() => onNavigate('distribution')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'distribution' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Terminal Distribution
            </button>
            <button
              onClick={() => onNavigate('spreadsheet')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'spreadsheet' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Course Excel Replicator
            </button>
            <button
              onClick={() => onNavigate('theory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'theory' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Mathematical Formulation
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExportHtml}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              title="Download 100% standalone single-file HTML containing pure HTML, CSS, Vanilla JS and Chart.js"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Single-File HTML</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
