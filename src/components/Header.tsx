import React from 'react';
import { HingeParams } from '../types/hinge';
import { PRESET_LIBRARY } from '../utils/hingePhysics';
import {
  Layers,
  Sparkles,
  BookOpen,
  RotateCcw,
  Download,
  FolderOpen,
  Box,
  Split,
  Eye,
} from 'lucide-react';

interface HeaderProps {
  params: HingeParams;
  onApplyPreset: (presetParams: any) => void;
  onReset: () => void;
  onOpenExportModal: () => void;
  onQuickExportSvg: () => void;
  onQuickExportDxf: () => void;
  onOpenBendCalc: () => void;
  onOpenGuide: () => void;
  activeView: '2d' | '3d' | 'split';
  setActiveView: (view: '2d' | '3d' | 'split') => void;
}

export const Header: React.FC<HeaderProps> = ({
  params,
  onApplyPreset,
  onReset,
  onOpenExportModal,
  onQuickExportSvg,
  onQuickExportDxf,
  onOpenBendCalc,
  onOpenGuide,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 select-none">
      {/* Brand & Preset Library */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <svg
              className="w-5 h-5 text-slate-950"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M4 6h3M11 6h2M17 6h3" />
              <path d="M4 12h2M10 12h4M18 12h2" />
              <path d="M4 18h3M11 18h2M17 18h3" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-wide text-white">KerfBend</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                CAD Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Living Hinge Laser Cut Designer</p>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative hidden md:flex items-center space-x-1 pl-3 border-l border-slate-800">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <select
            onChange={(e) => {
              const preset = PRESET_LIBRARY.find((p) => p.name === e.target.value);
              if (preset) onApplyPreset(preset.params);
            }}
            defaultValue=""
            className="bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="" disabled>
              Load Design Preset...
            </option>
            {PRESET_LIBRARY.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Viewport Switcher */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveView('2d')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === '2d'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>2D CAD</span>
        </button>
        <button
          onClick={() => setActiveView('3d')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === '3d'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Bend</span>
        </button>
        <button
          onClick={() => setActiveView('split')}
          className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === 'split'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Split className="w-3.5 h-3.5" />
          <span>Split View</span>
        </button>
      </div>

      {/* Right Tool Buttons & Export */}
      <div className="flex items-center space-x-2">
        {/* Bend Arc Calculator Modal Trigger */}
        <button
          onClick={onOpenBendCalc}
          title="Calculate Required Hinge Width for Box Bend"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hidden sm:flex items-center space-x-1 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">Bend Calc</span>
        </button>

        {/* Laser Guide */}
        <button
          onClick={onOpenGuide}
          title="Living Hinge Rules of Thumb"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center space-x-1 text-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Guide</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset Parameters to Default"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Quick SVG Download Button */}
        <button
          onClick={onQuickExportSvg}
          title="Direct Download SVG file"
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hidden sm:flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5 text-red-400" />
          <span>SVG</span>
        </button>

        {/* Quick DXF Download Button */}
        <button
          onClick={onQuickExportDxf}
          title="Direct Download AutoCAD DXF file"
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hidden sm:flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>DXF</span>
        </button>

        {/* Full Export Modal Trigger */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export File</span>
        </button>
      </div>
    </header>
  );
};
