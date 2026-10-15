import React from 'react';
import { HingeParams, MaterialPresetId, UnitType } from '../types/hinge';
import { MATERIAL_PRESETS, mmToUnit, unitToMm } from '../utils/materials';
import { PatternSelector } from './PatternSelector';
import {
  Sliders,
  Ruler,
  Maximize2,
  Layers,
  CircleDot,
  AlertTriangle,
  Flame,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ControlsPanelProps {
  params: HingeParams;
  onChange: (newParams: HingeParams) => void;
  onOpenGuide: () => void;
  onOpenBendCalc: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  params,
  onChange,
  onOpenGuide,
  onOpenBendCalc,
}) => {
  const isInch = params.unit === 'inch';
  const unitLabel = params.unit;

  const updateParam = <K extends keyof HingeParams>(key: K, value: HingeParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const handleMaterialChange = (presetId: MaterialPresetId) => {
    const preset = MATERIAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      ...params,
      materialId: presetId,
      materialThickness: preset.thickness,
      kerf: preset.defaultKerf,
    });
  };

  const toggleUnit = (newUnit: UnitType) => {
    updateParam('unit', newUnit);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 overflow-y-auto divide-y divide-slate-800 text-xs">
      {/* Header / Units Toggle */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-sm tracking-wide text-white">Laser Parameters</h2>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => toggleUnit('mm')}
            className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
              params.unit === 'mm'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            mm
          </button>
          <button
            onClick={() => toggleUnit('inch')}
            className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
              params.unit === 'inch'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            in
          </button>
        </div>
      </div>

      {/* Pattern Type Selector */}
      <div className="p-4">
        <PatternSelector
          currentPattern={params.pattern}
          onSelectPattern={(pat) => updateParam('pattern', pat)}
        />
      </div>

      {/* Cut Line Direction (Orientation) */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
            <span>Cut Line Direction</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-mono">
            {params.cutOrientation === 'horizontal' ? '↔ Horizontal' : '↕ Vertical'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateParam('cutOrientation', 'vertical')}
            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
              params.cutOrientation !== 'horizontal'
                ? 'bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/30 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs">
              <span className="text-emerald-400 font-bold">↕</span>
              <span>Vertical Cuts</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Cuts run along height. Sheet bends horizontally left/right.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateParam('cutOrientation', 'horizontal')}
            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
              params.cutOrientation === 'horizontal'
                ? 'bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/30 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs">
              <span className="text-emerald-400 font-bold">↔</span>
              <span>Horizontal Cuts</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Cuts run along width. Sheet bends vertically top/down.
            </p>
          </button>
        </div>
      </div>

      {/* Primary Cut Sliders (Requested explicitly by user) */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
            <span>Primary Cut Geometry</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-mono">Sliders & Direct Input</span>
        </div>

        {/* 1. Cut Size (Cut Length) */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Cut Size (Length)</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={isInch ? 0.1 : 3}
                max={isInch ? 2.5 : 60}
                step={isInch ? 0.05 : 0.5}
                value={mmToUnit(params.cutLength, params.unit)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    updateParam('cutLength', unitToMm(val, params.unit));
                  }
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-500 font-mono text-[11px]">{unitLabel}</span>
            </div>
          </div>
          <input
            type="range"
            min={unitToMm(4, 'mm')}
            max={unitToMm(50, 'mm')}
            step={0.5}
            value={params.cutLength}
            onChange={(e) => updateParam('cutLength', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Tight (4mm)</span>
            <span>Standard (14mm)</span>
            <span>Long (50mm)</span>
          </div>
        </div>

        {/* 2. Bridge Size (Gap between collinear cuts) */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-slate-300">Bridge Size (Gap)</span>
              {params.bridgeSize < 1.0 && (
                <span title="Bridges under 1mm risk snapping!" className="text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={isInch ? 0.02 : 0.5}
                max={isInch ? 0.5 : 12}
                step={isInch ? 0.01 : 0.1}
                value={mmToUnit(params.bridgeSize, params.unit)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    updateParam('bridgeSize', unitToMm(val, params.unit));
                  }
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-500 font-mono text-[11px]">{unitLabel}</span>
            </div>
          </div>
          <input
            type="range"
            min={0.6}
            max={8.0}
            step={0.1}
            value={params.bridgeSize}
            onChange={(e) => updateParam('bridgeSize', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Delicate (0.8mm)</span>
            <span>Recommended (2.0mm)</span>
            <span>Stiff (8mm)</span>
          </div>
        </div>

        {/* 3. Line Spacing (Pitch between adjacent cut lines) */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Line Spacing (Pitch)</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={isInch ? 0.03 : 1.0}
                max={isInch ? 0.4 : 10.0}
                step={isInch ? 0.01 : 0.1}
                value={mmToUnit(params.lineSpacing, params.unit)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    updateParam('lineSpacing', unitToMm(val, params.unit));
                  }
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-500 font-mono text-[11px]">{unitLabel}</span>
            </div>
          </div>
          <input
            type="range"
            min={1.0}
            max={8.0}
            step={0.1}
            value={params.lineSpacing}
            onChange={(e) => updateParam('lineSpacing', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Dense (1.2mm)</span>
            <span>Balanced (2.5mm)</span>
            <span>Wide (8mm)</span>
          </div>
        </div>
      </div>

      {/* Hinge Overall Dimensions & Margin Flanks */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
            <span>Hinge Area & Margins</span>
          </label>
          <button
            onClick={onOpenBendCalc}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 underline"
          >
            <Sparkles className="w-3 h-3" />
            <span>Bend Calculator</span>
          </button>
        </div>

        {/* Hinge Width & Height */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Hinge Flex Width</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={isInch ? 0.5 : 10}
                max={isInch ? 20 : 500}
                value={mmToUnit(params.hingeWidth, params.unit)}
                onChange={(e) => updateParam('hingeWidth', unitToMm(parseFloat(e.target.value) || 10, params.unit))}
                className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-200"
              />
              <span className="text-slate-500 font-mono text-[10px]">{unitLabel}</span>
            </div>
          </div>

          <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Hinge Height</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={isInch ? 0.5 : 10}
                max={isInch ? 30 : 800}
                value={mmToUnit(params.hingeHeight, params.unit)}
                onChange={(e) => updateParam('hingeHeight', unitToMm(parseFloat(e.target.value) || 10, params.unit))}
                className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-200"
              />
              <span className="text-slate-500 font-mono text-[10px]">{unitLabel}</span>
            </div>
          </div>
        </div>

        {/* Solid Side Margins (for attaching hinge to box/book covers) */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium block">
            Solid Attachment Margins (Left / Right)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800">
              <span className="text-[11px] text-slate-500">Left:</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={mmToUnit(params.marginLeft, params.unit)}
                  onChange={(e) => updateParam('marginLeft', unitToMm(parseFloat(e.target.value) || 0, params.unit))}
                  className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">{unitLabel}</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800">
              <span className="text-[11px] text-slate-500">Right:</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={mmToUnit(params.marginRight, params.unit)}
                  onChange={(e) => updateParam('marginRight', unitToMm(parseFloat(e.target.value) || 0, params.unit))}
                  className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">{unitLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swatch & Perimeter Cut Features */}
      <div className="p-4 space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Outer Border & Mounting Holes
        </label>

        {/* Include Outer Border Cut */}
        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer hover:bg-slate-950">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={params.includeOuterBorder}
                onChange={(e) => updateParam('includeOuterBorder', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Cut Outer Swatch Border</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {params.includeOuterBorder ? 'Perimeter ON' : 'Slits only'}
            </span>
          </label>

          {params.includeOuterBorder && (
            <div className="flex items-center justify-between pl-6 pr-2 py-1 text-xs">
              <span className="text-slate-400">Corner Radius:</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={mmToUnit(params.outerBorderCornerRadius, params.unit)}
                  onChange={(e) => updateParam('outerBorderCornerRadius', unitToMm(parseFloat(e.target.value) || 0, params.unit))}
                  className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono"
                />
                <span className="text-slate-500 font-mono text-[10px]">{unitLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mounting Holes */}
        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer hover:bg-slate-950">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={params.includeMountingHoles}
                onChange={(e) => updateParam('includeMountingHoles', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Corner Mounting Holes</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Screw Test</span>
          </label>

          {params.includeMountingHoles && (
            <div className="flex items-center justify-between pl-6 pr-2 py-1 text-xs">
              <span className="text-slate-400">Hole Diameter:</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={0.1}
                  value={mmToUnit(params.mountingHoleDiameter, params.unit)}
                  onChange={(e) => updateParam('mountingHoleDiameter', unitToMm(parseFloat(e.target.value) || 3.2, params.unit))}
                  className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono"
                />
                <span className="text-slate-500 font-mono text-[10px]">{unitLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Material Presets & Laser Kerf */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Material & Laser Kerf
          </label>
          <button
            onClick={onOpenGuide}
            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
        </div>

        {/* Preset Selector */}
        <select
          value={params.materialId}
          onChange={(e) => handleMaterialChange(e.target.value as MaterialPresetId)}
          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {MATERIAL_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Thickness</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <input
                type="number"
                min={0.5}
                max={20}
                step={0.5}
                value={params.materialThickness}
                onChange={(e) => updateParam('materialThickness', parseFloat(e.target.value) || 3.0)}
                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-300"
              />
              <span className="text-[10px] text-slate-500 font-mono">mm</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Laser Kerf</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <input
                type="number"
                min={0.05}
                max={0.5}
                step={0.01}
                value={params.kerf}
                onChange={(e) => updateParam('kerf', parseFloat(e.target.value) || 0.15)}
                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono text-orange-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
