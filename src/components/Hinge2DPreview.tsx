import React, { useState, useRef, useEffect } from 'react';
import { GeneratedHingeData, HingeParams } from '../types/hinge';
import { mmToUnit } from '../utils/materials';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  Layers,
  Flame,
  Grid as GridIcon,
  Ruler,
  ArrowUpDown,
  ArrowLeftRight,
} from 'lucide-react';

interface Hinge2DPreviewProps {
  data: GeneratedHingeData;
  params: HingeParams;
  viewMode: 'cad' | 'laser-cut' | 'blueprint';
  setViewMode: (mode: 'cad' | 'laser-cut' | 'blueprint') => void;
  onChangeOrientation?: (orientation: 'vertical' | 'horizontal') => void;
}

export const Hinge2DPreview: React.FC<Hinge2DPreviewProps> = ({
  data,
  params,
  viewMode,
  setViewMode,
  onChangeOrientation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePosMm, setMousePosMm] = useState<{ x: number; y: number } | null>(null);

  // View Rotation in degrees (0, 90, 180, 270)
  const [viewRotation, setViewRotation] = useState<0 | 90 | 180 | 270>(0);

  // Layer toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showKerf, setShowKerf] = useState(false);
  const [showHingeZoneBox, setShowHingeZoneBox] = useState(true);

  // Auto-fit on initial render or major dimension changes or rotation changes
  useEffect(() => {
    fitToScreen();
  }, [data.totalWidth, data.totalHeight, viewRotation, params.cutOrientation]);

  const fitToScreen = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const padding = 60;
    const availableW = clientWidth - padding * 2;
    const availableH = clientHeight - padding * 2;

    const isQuarterTurn = viewRotation === 90 || viewRotation === 270;
    const effectiveW = isQuarterTurn ? data.totalHeight : data.totalWidth;
    const effectiveH = isQuarterTurn ? data.totalWidth : data.totalHeight;

    const scaleX = availableW / effectiveW;
    const scaleY = availableH / effectiveH;
    const newScale = Math.min(scaleX, scaleY, 6.0); // max zoom 6x

    setScale(newScale);
    setOffset({
      x: (clientWidth - data.totalWidth * newScale) / 2,
      y: (clientHeight - data.totalHeight * newScale) / 2,
    });
  };

  const handleRotateView = () => {
    setViewRotation((prev) => {
      const next = ((prev + 90) % 360) as 0 | 90 | 180 | 270;
      return next;
    });
  };

  const handleZoom = (factor: number) => {
    if (!containerRef.current) return;
    const newScale = Math.min(Math.max(scale * factor, 0.2), 20);
    const { clientWidth, clientHeight } = containerRef.current;
    const cx = clientWidth / 2;
    const cy = clientHeight / 2;
    const newOffsetX = cx - ((cx - offset.x) * newScale) / scale;
    const newOffsetY = cy - ((cy - offset.y) * newScale) / scale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.min(Math.max(scale * factor, 0.15), 25);
    const newOffsetX = mouseX - ((mouseX - offset.x) * newScale) / scale;
    const newOffsetY = mouseY - ((mouseY - offset.y) * newScale) / scale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const mmX = (mouseX - offset.x) / scale;
      const mmY = (mouseY - offset.y) / scale;

      if (mmX >= -10 && mmX <= data.totalWidth + 10 && mmY >= -10 && mmY <= data.totalHeight + 10) {
        setMousePosMm({ x: Math.round(mmX * 10) / 10, y: Math.round(mmY * 10) / 10 });
      } else {
        setMousePosMm(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getThemeColors = () => {
    switch (viewMode) {
      case 'blueprint':
        return {
          bg: '#0a192f',
          gridMajor: '#172a45',
          gridMinor: '#112240',
          stock: '#102a45',
          stockBorder: '#3b82f6',
          cutStroke: '#60a5fa',
          outerBorderStroke: '#93c5fd',
          hingeZone: 'rgba(59, 130, 246, 0.08)',
          hingeZoneBorder: 'rgba(59, 130, 246, 0.35)',
          holeStroke: '#38bdf8',
          text: '#93c5fd',
        };
      case 'laser-cut':
        return {
          bg: '#181412',
          gridMajor: '#26201b',
          gridMinor: '#1f1a16',
          stock: '#d4a373',
          stockBorder: '#bc6c25',
          cutStroke: '#1c1917',
          outerBorderStroke: '#3e2723',
          hingeZone: 'rgba(188, 108, 37, 0.1)',
          hingeZoneBorder: 'rgba(188, 108, 37, 0.4)',
          holeStroke: '#1c1917',
          text: '#e2d5c3',
        };
      case 'cad':
      default:
        return {
          bg: '#0f172a',
          gridMajor: '#1e293b',
          gridMinor: '#141e33',
          stock: '#1e293b',
          stockBorder: '#475569',
          cutStroke: '#ef4444',
          outerBorderStroke: '#e2e8f0',
          hingeZone: 'rgba(239, 68, 68, 0.06)',
          hingeZoneBorder: 'rgba(239, 68, 68, 0.35)',
          holeStroke: '#3b82f6',
          text: '#94a3b8',
        };
    }
  };

  const colors = getThemeColors();
  const isHorizontal = params.cutOrientation === 'horizontal';

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* Top HUD Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-xs text-slate-300 gap-2 z-10">
        {/* Style View Mode */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('cad')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              viewMode === 'cad'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CAD Laser View
          </button>
          <button
            onClick={() => setViewMode('laser-cut')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              viewMode === 'laser-cut'
                ? 'bg-amber-600/25 text-amber-300 border border-amber-600/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wood Burn Sim
          </button>
          <button
            onClick={() => setViewMode('blueprint')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              viewMode === 'blueprint'
                ? 'bg-blue-600/25 text-blue-300 border border-blue-600/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blueprint
          </button>
        </div>

        {/* Cut Orientation Switcher (Vertical vs Horizontal cuts) */}
        {onChangeOrientation && (
          <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onChangeOrientation('vertical')}
              title="Cuts run vertically (Sheet flexes horizontally left/right)"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition-all ${
                !isHorizontal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Vertical Cuts</span>
            </button>
            <button
              onClick={() => onChangeOrientation('horizontal')}
              title="Cuts run horizontally (Sheet flexes vertically top/down)"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition-all ${
                isHorizontal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Horizontal Cuts</span>
            </button>
          </div>
        )}

        {/* Display Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowKerf(!showKerf)}
            title="Simulate Laser Kerf Burn Width"
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              showKerf
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Kerf ({params.kerf}mm)</span>
          </button>

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            title="Toggle Dimensions & Callouts"
            className={`p-1.5 rounded border transition-colors ${
              showDimensions
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle CAD Grid"
            className={`p-1.5 rounded border transition-colors ${
              showGrid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <GridIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowHingeZoneBox(!showHingeZoneBox)}
            title="Toggle Hinge Zone Boundary Highlight"
            className={`p-1.5 rounded border transition-colors ${
              showHingeZoneBox
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pan / Zoom & View Rotation Controls */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          {/* Rotate Canvas View 90 degrees */}
          <button
            onClick={handleRotateView}
            title={`Rotate Canvas View by 90° (Current: ${viewRotation}°)`}
            className={`flex items-center space-x-1 px-1.5 py-1 rounded transition-colors ${
              viewRotation !== 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">{viewRotation}°</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom In (Scroll Up)"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out (Scroll Down)"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitToScreen}
            title="Fit to Screen"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setViewRotation(0);
              fitToScreen();
            }}
            title="Reset Position & Rotation"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ backgroundColor: colors.bg }}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
      >
        <svg
          className="w-full h-full pointer-events-none select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-small"
              width={10 * scale}
              height={10 * scale}
              patternUnits="userSpaceOnUse"
              x={offset.x}
              y={offset.y}
            >
              <path
                d={`M ${10 * scale} 0 L 0 0 0 ${10 * scale}`}
                fill="none"
                stroke={colors.gridMinor}
                strokeWidth="0.7"
              />
            </pattern>
            <pattern
              id="grid-large"
              width={50 * scale}
              height={50 * scale}
              patternUnits="userSpaceOnUse"
              x={offset.x}
              y={offset.y}
            >
              <rect width={50 * scale} height={50 * scale} fill="url(#grid-small)" />
              <path
                d={`M ${50 * scale} 0 L 0 0 0 ${50 * scale}`}
                fill="none"
                stroke={colors.gridMajor}
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          {/* Grid Background */}
          {showGrid && <rect width="100%" height="100%" fill="url(#grid-large)" />}

          {/* Main Transformation Matrix with optional View Rotation */}
          <g
            transform={`translate(${offset.x}, ${offset.y}) scale(${scale}) rotate(${viewRotation}, ${data.totalWidth / 2}, ${data.totalHeight / 2})`}
          >
            {/* Stock Material Sheet simulation */}
            {viewMode === 'laser-cut' && (
              <rect
                x={0}
                y={0}
                width={data.totalWidth}
                height={data.totalHeight}
                rx={params.includeOuterBorder ? params.outerBorderCornerRadius : 0}
                fill={colors.stock}
                stroke={colors.stockBorder}
                strokeWidth={0.8}
                className="transition-colors"
                filter="drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
              />
            )}

            {/* Hinge Active Cut Area Background Highlight */}
            {showHingeZoneBox && (
              <rect
                x={data.hingeBounds.xMin}
                y={data.hingeBounds.yMin}
                width={params.hingeWidth}
                height={params.hingeHeight}
                fill={colors.hingeZone}
                stroke={colors.hingeZoneBorder}
                strokeWidth={0.5}
                strokeDasharray="2 2"
              />
            )}

            {/* Outer Cut Border (Perimeter cut) */}
            {params.includeOuterBorder &&
              data.outerBorderPaths.map((op, idx) => {
                let d = `M ${op.points[0].x} ${op.points[0].y}`;
                for (let i = 1; i < op.points.length; i++) {
                  d += ` L ${op.points[i].x} ${op.points[i].y}`;
                }
                d += ' Z';
                return (
                  <path
                    key={`outer-${idx}`}
                    d={d}
                    fill="none"
                    stroke={colors.outerBorderStroke}
                    strokeWidth={showKerf ? params.kerf : 0.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

            {/* Laser Cut Slit Lines */}
            <g
              stroke={colors.cutStroke}
              strokeWidth={showKerf ? Math.max(0.18, params.kerf) : 0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {data.cutPaths.map((cp, idx) => {
                if (cp.points.length === 2) {
                  return (
                    <line
                      key={`cut-${idx}`}
                      x1={cp.points[0].x}
                      y1={cp.points[0].y}
                      x2={cp.points[1].x}
                      y2={cp.points[1].y}
                    />
                  );
                }
                let d = `M ${cp.points[0].x} ${cp.points[0].y}`;
                for (let i = 1; i < cp.points.length; i++) {
                  d += ` L ${cp.points[i].x} ${cp.points[i].y}`;
                }
                return <path key={`cut-${idx}`} d={d} fill="none" />;
              })}
            </g>

            {/* Mounting Holes */}
            {params.includeMountingHoles &&
              data.holePaths.map((hp, idx) => (
                <circle
                  key={`hole-${idx}`}
                  cx={hp.points[0].x}
                  cy={hp.points[0].y}
                  r={hp.radius || 1.5}
                  fill={viewMode === 'laser-cut' ? colors.bg : 'none'}
                  stroke={colors.holeStroke}
                  strokeWidth={showKerf ? params.kerf : 0.25}
                />
              ))}

            {/* Dimension Callouts / Annotations */}
            {showDimensions && (
              <g className="text-[3.2px] font-mono select-none" fill={colors.text} stroke={colors.text}>
                {/* Width dimension at bottom */}
                <line
                  x1={0}
                  y1={data.totalHeight + 4}
                  x2={data.totalWidth}
                  y2={data.totalHeight + 4}
                  strokeWidth={0.2}
                />
                <line x1={0} y1={data.totalHeight + 2} x2={0} y2={data.totalHeight + 6} strokeWidth={0.2} />
                <line
                  x1={data.totalWidth}
                  y1={data.totalHeight + 2}
                  x2={data.totalWidth}
                  y2={data.totalHeight + 6}
                  strokeWidth={0.2}
                />
                <text
                  x={data.totalWidth / 2}
                  y={data.totalHeight + 8}
                  textAnchor="middle"
                  stroke="none"
                  fontSize={3.2}
                  className="font-medium"
                >
                  W: {mmToUnit(data.totalWidth, params.unit)} {params.unit}
                </text>

                {/* Hinge flex zone dimension */}
                {!isHorizontal ? (
                  <>
                    <line
                      x1={data.hingeBounds.xMin}
                      y1={data.hingeBounds.yMin - 4}
                      x2={data.hingeBounds.xMax}
                      y2={data.hingeBounds.yMin - 4}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <line
                      x1={data.hingeBounds.xMin}
                      y1={data.hingeBounds.yMin - 6}
                      x2={data.hingeBounds.xMin}
                      y2={data.hingeBounds.yMin - 2}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <line
                      x1={data.hingeBounds.xMax}
                      y1={data.hingeBounds.yMin - 6}
                      x2={data.hingeBounds.xMax}
                      y2={data.hingeBounds.yMin - 2}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <text
                      x={data.hingeBounds.xMin + params.hingeWidth / 2}
                      y={data.hingeBounds.yMin - 6.5}
                      textAnchor="middle"
                      stroke="none"
                      fill="#ef4444"
                      fontSize={2.8}
                    >
                      Hinge Flex (Width): {mmToUnit(params.hingeWidth, params.unit)} {params.unit}
                    </text>
                  </>
                ) : (
                  <>
                    <line
                      x1={data.hingeBounds.xMin - 4}
                      y1={data.hingeBounds.yMin}
                      x2={data.hingeBounds.xMin - 4}
                      y2={data.hingeBounds.yMax}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <line
                      x1={data.hingeBounds.xMin - 6}
                      y1={data.hingeBounds.yMin}
                      x2={data.hingeBounds.xMin - 2}
                      y2={data.hingeBounds.yMin}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <line
                      x1={data.hingeBounds.xMin - 6}
                      y1={data.hingeBounds.yMax}
                      x2={data.hingeBounds.xMin - 2}
                      y2={data.hingeBounds.yMax}
                      strokeWidth={0.2}
                      stroke="#ef4444"
                    />
                    <text
                      x={data.hingeBounds.xMin - 7}
                      y={data.hingeBounds.yMin + params.hingeHeight / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      stroke="none"
                      fill="#ef4444"
                      fontSize={2.8}
                    >
                      Flex (Height): {mmToUnit(params.hingeHeight, params.unit)} {params.unit}
                    </text>
                  </>
                )}

                {/* Total Height dimension at right */}
                <line
                  x1={data.totalWidth + 4}
                  y1={0}
                  x2={data.totalWidth + 4}
                  y2={data.totalHeight}
                  strokeWidth={0.2}
                />
                <line x1={data.totalWidth + 2} y1={0} x2={data.totalWidth + 6} y2={0} strokeWidth={0.2} />
                <line
                  x1={data.totalWidth + 2}
                  y1={data.totalHeight}
                  x2={data.totalWidth + 6}
                  y2={data.totalHeight}
                  strokeWidth={0.2}
                />
                <text
                  x={data.totalWidth + 7}
                  y={data.totalHeight / 2}
                  textAnchor="start"
                  dominantBaseline="middle"
                  stroke="none"
                  fontSize={3.2}
                >
                  H: {mmToUnit(data.totalHeight, params.unit)} {params.unit}
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* Bottom Status / Precision Coordinates Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-[11px] font-mono bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800 text-slate-400">
          <span className="text-slate-200">
            {data.totalWidth} × {data.totalHeight} mm ({mmToUnit(data.totalWidth, 'inch')} ×{' '}
            {mmToUnit(data.totalHeight, 'inch')} in)
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">
            {isHorizontal ? 'Horizontal Cuts ↔' : 'Vertical Cuts ↕'}
          </span>
          <span className="text-slate-600">|</span>
          <span className={`font-mono ${data.stats.cutToBridgeRatio.isIdeal ? 'text-emerald-300 font-semibold' : 'text-slate-300'}`}>
            Ratio: {data.stats.cutToBridgeRatio.ratioFormatted} ({data.stats.cutToBridgeRatio.cutPercent}% Cut)
          </span>
          {viewRotation !== 0 && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">View Rotated {viewRotation}°</span>
            </>
          )}
          {mousePosMm && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">
                X: {mousePosMm.x} mm, Y: {mousePosMm.y} mm
              </span>
            </>
          )}
        </div>

        {/* Laser Quick Stats Badge on Top Right */}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-3 pointer-events-none">
          <div>
            <span className="text-slate-500">Ratio: </span>
            <span className={`font-bold ${data.stats.cutToBridgeRatio.isIdeal ? 'text-emerald-400' : 'text-slate-200'}`}>
              {data.stats.cutToBridgeRatio.ratioFormatted}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Cuts: </span>
            <span className="text-emerald-400 font-bold">{data.stats.cutLineCount}</span>
          </div>
          <div>
            <span className="text-slate-500">Path: </span>
            <span className="text-indigo-300 font-bold">{(data.stats.totalCutLengthMm / 1000).toFixed(2)} m</span>
          </div>
          <div>
            <span className="text-slate-500">Laser Est: </span>
            <span className="text-amber-400 font-bold">{data.stats.estimatedCutTimeSec}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
