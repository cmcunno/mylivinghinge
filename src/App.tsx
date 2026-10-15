/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HingeParams } from './types/hinge';
import { generateHinge } from './utils/hingeGenerator';
import { downloadSvg } from './utils/exportSvg';
import { downloadDxf } from './utils/exportDxf';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { Hinge2DPreview } from './components/Hinge2DPreview';
import { Hinge3DPreview } from './components/Hinge3DPreview';
import { ExportModal } from './components/ExportModal';
import { BendCalculatorModal } from './components/BendCalculatorModal';
import { HingeGuideModal } from './components/HingeGuideModal';
import {
  Activity,
  Layers,
  Ruler,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

const DEFAULT_PARAMS: HingeParams = {
  hingeWidth: 45,
  hingeHeight: 120,
  cutLength: 14,
  bridgeSize: 2.0,
  lineSpacing: 2.5,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 10,
  marginBottom: 10,
  pattern: 'straight-stagger',
  cutOrientation: 'vertical',
  waveAmplitude: 1.5,
  includeOuterBorder: true,
  outerBorderCornerRadius: 4,
  includeMountingHoles: true,
  mountingHoleDiameter: 3.2,
  kerf: 0.15,
  materialId: 'plywood-3mm',
  materialThickness: 3.0,
  unit: 'mm',
};

export default function App() {
  const [params, setParams] = useState<HingeParams>(DEFAULT_PARAMS);
  const [activeView, setActiveView] = useState<'2d' | '3d' | 'split'>('2d');
  const [viewMode2D, setViewMode2D] = useState<'cad' | 'laser-cut' | 'blueprint'>('cad');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBendCalcModalOpen, setIsBendCalcModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Real-time procedural hinge geometry computation
  const hingeData = useMemo(() => {
    return generateHinge(params);
  }, [params]);

  // Quick Direct Exporters
  const handleQuickExportSvg = () => {
    downloadSvg(hingeData, params, {
      format: 'svg',
      unit: params.unit,
      colorScheme: 'red-cut',
      includeOuterBorder: params.includeOuterBorder,
      includeDimensionsLayer: false,
      hairlineWidth: 0.1,
      laserKerfCompensation: false,
    });
  };

  const handleQuickExportDxf = () => {
    downloadDxf(hingeData, params, {
      format: 'dxf',
      unit: params.unit,
      colorScheme: 'red-cut',
      includeOuterBorder: params.includeOuterBorder,
      includeDimensionsLayer: false,
      hairlineWidth: 0.1,
      laserKerfCompensation: false,
    });
  };

  const handleApplyPreset = (presetParams: Partial<HingeParams>) => {
    setParams((prev) => ({
      ...prev,
      ...presetParams,
    }));
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
  };

  // Flexibility status badge color
  const getFlexBadgeColor = () => {
    switch (hingeData.stats.flexibilityRating) {
      case 'Very Flexible':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Flexible':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Stiff':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Fragile (High Break Risk)':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header & Toolbars */}
      <Header
        params={params}
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onQuickExportSvg={handleQuickExportSvg}
        onQuickExportDxf={handleQuickExportDxf}
        onOpenBendCalc={() => setIsBendCalcModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Parameter & Sliders Panel */}
        <aside
          className={`transition-all duration-300 ease-in-out z-20 flex-shrink-0 h-full ${
            sidebarOpen ? 'w-80 md:w-96' : 'w-0'
          } overflow-hidden relative shadow-2xl`}
        >
          <div className="w-80 md:w-96 h-full">
            <ControlsPanel
              params={params}
              onChange={setParams}
              onOpenGuide={() => setIsGuideModalOpen(true)}
              onOpenBendCalc={() => setIsBendCalcModalOpen(true)}
            />
          </div>
        </aside>

        {/* Toggle Sidebar Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse Controls' : 'Expand Controls'}
          className={`absolute top-4 z-30 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-1.5 rounded-r-md shadow-xl transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'left-80 md:left-96' : 'left-0'
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Center / Right Previews Container */}
        <main className="flex-1 flex flex-col h-full overflow-hidden p-2 sm:p-3 bg-slate-950">
          <div className="flex-1 h-full w-full relative overflow-hidden rounded-xl">
            {/* View Mode 1: 2D CAD Only */}
            {activeView === '2d' && (
              <Hinge2DPreview
                data={hingeData}
                params={params}
                viewMode={viewMode2D}
                setViewMode={setViewMode2D}
                onChangeOrientation={(orientation) =>
                  setParams((prev) => ({ ...prev, cutOrientation: orientation }))
                }
              />
            )}

            {/* View Mode 2: 3D Bend Simulation Only */}
            {activeView === '3d' && (
              <Hinge3DPreview data={hingeData} params={params} />
            )}

            {/* View Mode 3: Split View (Side by Side) */}
            {activeView === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full w-full">
                <Hinge2DPreview
                  data={hingeData}
                  params={params}
                  viewMode={viewMode2D}
                  setViewMode={setViewMode2D}
                  onChangeOrientation={(orientation) =>
                    setParams((prev) => ({ ...prev, cutOrientation: orientation }))
                  }
                />
                <Hinge3DPreview data={hingeData} params={params} />
              </div>
            )}
          </div>

          {/* Bottom Precision Engineering Status Bar */}
          <footer className="mt-2 px-3 py-2 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Flexibility Rating */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 text-[11px]">Flex Rating:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center space-x-1 ${getFlexBadgeColor()}`}
                >
                  {hingeData.stats.flexibilityRating === 'Fragile (High Break Risk)' ? (
                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                  )}
                  <span>{hingeData.stats.flexibilityRating}</span>
                </span>
              </div>

              {/* Min Bend Radius */}
              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="text-slate-500">Min Bend Radius:</span>
                <span className="text-emerald-400 font-bold">
                  ~{hingeData.stats.minBendRadiusMm} mm
                </span>
              </div>

              {/* Slit Count & Total Piercings */}
              <div className="hidden sm:flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="text-slate-500">Pierces:</span>
                <span className="text-slate-200">{hingeData.stats.pierceCount}</span>
              </div>

              {/* Cut Path Length */}
              <div className="hidden md:flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="text-slate-500">Path Length:</span>
                <span className="text-indigo-300">
                  {(hingeData.stats.totalCutLengthMm / 1000).toFixed(2)} m
                </span>
              </div>

              {/* Est Laser Time */}
              <div className="hidden md:flex items-center space-x-1.5 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-500">Est. Laser Cut Time:</span>
                <span className="text-amber-400 font-bold">
                  ~{hingeData.stats.estimatedCutTimeSec}s
                </span>
              </div>
            </div>

            {/* Quick Export format actions on bottom right */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-[11px] hidden sm:inline">Export:</span>
              <button
                onClick={handleQuickExportSvg}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-semibold border border-slate-700 transition-colors"
              >
                .SVG
              </button>
              <button
                onClick={handleQuickExportDxf}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-semibold border border-slate-700 transition-colors"
              >
                .DXF
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={hingeData}
        params={params}
      />

      <BendCalculatorModal
        isOpen={isBendCalcModalOpen}
        onClose={() => setIsBendCalcModalOpen(false)}
        materialThickness={params.materialThickness}
        onApplyWidth={(width) => setParams((p) => ({ ...p, hingeWidth: width }))}
      />

      <HingeGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
