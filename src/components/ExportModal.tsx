import React, { useState } from 'react';
import { ExportSettings, GeneratedHingeData, HingeParams } from '../types/hinge';
import { buildSvgString, downloadSvg } from '../utils/exportSvg';
import { buildDxfString, downloadDxf } from '../utils/exportDxf';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Layers,
  Settings2,
  ExternalLink,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeneratedHingeData;
  params: HingeParams;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  params,
}) => {
  const [format, setFormat] = useState<'svg' | 'dxf'>('svg');
  const [colorScheme, setColorScheme] = useState<'red-cut' | 'black-cut' | 'blue-cut'>('red-cut');
  const [includeOuterBorder, setIncludeOuterBorder] = useState(params.includeOuterBorder);
  const [includeDimensionsLayer, setIncludeDimensionsLayer] = useState(false);
  const [hairlineWidth, setHairlineWidth] = useState(0.1);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentExportSettings: ExportSettings = {
    format,
    unit: params.unit,
    colorScheme,
    includeOuterBorder,
    includeDimensionsLayer,
    hairlineWidth,
    laserKerfCompensation: false,
  };

  const handleDownload = () => {
    if (format === 'svg') {
      downloadSvg(data, params, currentExportSettings);
    } else {
      downloadDxf(data, params, currentExportSettings);
    }
    onClose();
  };

  const handleCopySvg = () => {
    const svgStr = buildSvgString(data, params, currentExportSettings);
    navigator.clipboard.writeText(svgStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Export Laser Cutting File</h3>
              <p className="text-xs text-slate-400">
                Parametric CAD vector export for LightBurn, Glowforge & CNC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm text-slate-300">
          {/* Format Selection Tab */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  format === 'svg'
                    ? 'bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">SVG Vector (.svg)</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    Web & Laser
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Best for LightBurn, Glowforge, Cricut, Inkscape, Illustrator. Pure vector paths.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormat('dxf')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  format === 'dxf'
                    ? 'bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">AutoCAD DXF (.dxf)</span>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    CAD & CNC
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Standard R12 ASCII DXF for Fusion 360, RDWorks, SolidWorks, QCAD, CNC mill.
                </p>
              </button>
            </div>
          </div>

          {/* Laser Cut Layer Settings */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Laser Layer Mapping</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Color Scheme */}
              <div>
                <span className="text-slate-400 block mb-1">Stroke Color</span>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="red-cut">Red (#FF0000) Cut</option>
                  <option value="black-cut">Black (#000000) Cut</option>
                  <option value="blue-cut">Blue (#0055FF) Cut</option>
                </select>
              </div>

              {/* Hairline stroke width */}
              <div>
                <span className="text-slate-400 block mb-1">Vector Hairline</span>
                <select
                  value={hairlineWidth}
                  onChange={(e) => setHairlineWidth(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value={0.1}>0.10 mm (Standard)</option>
                  <option value={0.05}>0.05 mm (Ultra Thin)</option>
                  <option value={0.025}>0.025 mm (0.001 in)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeOuterBorder}
                  onChange={(e) => setIncludeOuterBorder(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300">
                  Include outer perimeter rectangle border in export
                </span>
              </label>

              {format === 'svg' && (
                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeDimensionsLayer}
                    onChange={(e) => setIncludeDimensionsLayer(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300">
                    Include dimension callout text (non-cut engrave annotation)
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Export File Summary */}
          <div className="flex items-center justify-between text-xs bg-slate-950/40 px-3.5 py-2.5 rounded-lg border border-slate-800 text-slate-400 font-mono">
            <span>Dimensions: {data.totalWidth} × {data.totalHeight} mm</span>
            <span className="text-emerald-400 font-semibold">{data.stats.cutLineCount} Cut Slits</span>
            <span>Est: ~{(data.stats.totalCutLengthMm / 1000).toFixed(2)}m</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          {format === 'svg' ? (
            <button
              type="button"
              onClick={handleCopySvg}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied XML!' : 'Copy SVG Code'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
