import React from 'react';
import { GeneratedHingeData, HingeParams } from '../types/hinge';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Wand2,
} from 'lucide-react';

interface CutBridgeRatioMeterProps {
  data: GeneratedHingeData;
  params: HingeParams;
  onChangeParams: (newParams: HingeParams) => void;
  compact?: boolean;
}

export const CutBridgeRatioMeter: React.FC<CutBridgeRatioMeterProps> = ({
  data,
  params,
  onChangeParams,
  compact = false,
}) => {
  const { cutToBridgeRatio } = data.stats;
  const { cutPercent, bridgePercent, isIdeal, status, statusLabel, ratioFormatted } = cutToBridgeRatio;

  // Handler to auto-tune bridge size to exactly 90:10 or 95:5 while preserving cut length
  const autoTuneRatio = (targetCutRatio: 90 | 95) => {
    // cut / (cut + bridge) = targetCutRatio / 100
    // bridge = cut * (100 - targetCutRatio) / targetCutRatio
    const targetBridge = Number((params.cutLength * ((100 - targetCutRatio) / targetCutRatio)).toFixed(2));
    const safeBridge = Math.max(0.6, Math.min(8.0, targetBridge));
    onChangeParams({
      ...params,
      bridgeSize: safeBridge,
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'optimal':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          desc: 'Perfect balance of flexibility and strength. High fatigue life for repeated bending.',
        };
      case 'ultra-flex':
        return {
          bg: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
          dot: 'bg-teal-400',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          desc: 'Maximum compliance for tight 180° folding or small radius curves. Ensure laser focus is sharp.',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-400',
          icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
          desc: 'Good for gentle arcs or structural curved faces. More resistant to snapping.',
        };
      case 'stiff':
        return {
          bg: 'bg-slate-700/60 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
          icon: <Info className="w-3.5 h-3.5" />,
          desc: 'Heavy bridge tabs provide high stiffness. Requires large bend radius or pre-soaking.',
        };
      case 'fragile':
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          dot: 'bg-rose-400',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          desc: 'High snap risk! Bridges are < 0.8mm or > 96% cut. Laser beam kerf will burn away remaining wood fiber.',
        };
    }
  };

  const badge = getStatusBadge();

  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
        <span className="text-slate-400">Ratio:</span>
        <span className={`font-bold ${isIdeal ? 'text-emerald-400' : 'text-slate-200'}`}>
          {ratioFormatted}
        </span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded border flex items-center space-x-1 ${badge.bg}`}>
          <span>{badge.icon}</span>
          <span>{cutPercent}% Cut</span>
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/75 p-3.5 rounded-xl border border-slate-800 space-y-3">
      {/* Header with numbers */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Cut-to-Bridge Ratio
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-xl font-mono font-black tracking-tight text-white">
              {cutPercent}% : {bridgePercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({ratioFormatted})
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 text-xs font-medium ${badge.bg}`}>
          {badge.icon}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Visual Proportional Split Bar */}
      <div className="space-y-1">
        <div className="relative h-4 w-full bg-slate-900 rounded-md overflow-hidden border border-slate-800 flex">
          {/* Cut segment */}
          <div
            style={{ width: `${Math.min(100, Math.max(0, cutPercent))}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 relative flex items-center justify-center"
          >
            {cutPercent > 30 && (
              <span className="text-[9px] font-mono text-slate-950 font-bold px-1 select-none">
                Cut {params.cutLength}mm
              </span>
            )}
          </div>

          {/* Bridge segment */}
          <div
            style={{ width: `${Math.min(100, Math.max(0, bridgePercent))}%` }}
            className="h-full bg-amber-500/80 transition-all duration-300 flex items-center justify-center relative"
          >
            {bridgePercent > 10 && (
              <span className="text-[9px] font-mono text-slate-950 font-bold px-0.5 select-none">
                {params.bridgeSize}mm
              </span>
            )}
          </div>

          {/* Golden Sweet Spot Bracket overlay (90% to 95%) */}
          <div
            style={{ left: '90%', width: '5%' }}
            className="absolute top-0 bottom-0 border-x-2 border-white/60 bg-white/10 pointer-events-none"
            title="Ideal 90:10 - 95:5 Flexibility Zone"
          />
        </div>

        {/* Spectrum Scale Labels */}
        <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
          <span>Stiff (&lt;80%)</span>
          <span>Moderate (85:15)</span>
          <span className="text-emerald-400 font-semibold">★ 90:10 (Ideal)</span>
          <span className="text-teal-300 font-semibold">★ 95:5 (Max)</span>
          <span className="text-rose-400">Risk (&gt;96%)</span>
        </div>
      </div>

      {/* Physics & Engineering Insight */}
      <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">The 90:10 – 95:5 Rule:</strong> In digital fabrication, a 90% to 95% cut ratio lowers torsional bending resistance by ~85% while preserving bridge tensile connection.
            {bridgePercent < 5 && (
              <span className="text-amber-300 block mt-1 font-medium">
                ⚠️ Warning: Bridge is only {params.bridgeSize}mm. Subtracting ~{params.kerf}mm laser kerf leaves ~{(params.bridgeSize - params.kerf).toFixed(2)}mm effective bridge width.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quick Auto-Tune Presets */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
          <Wand2 className="w-3 h-3 text-emerald-400" />
          <span>Auto-Tune Bridge:</span>
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => autoTuneRatio(90)}
            title="Auto-tune bridge size to exactly 90:10 (e.g. cut 18mm -> bridge 2mm)"
            className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-slate-700 hover:border-emerald-500/50 text-[10px] font-mono font-medium transition-colors"
          >
            Snap to 90:10
          </button>
          <button
            type="button"
            onClick={() => autoTuneRatio(95)}
            title="Auto-tune bridge size to exactly 95:5 for tight maximum bend"
            className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-600/30 text-teal-300 hover:text-white border border-slate-700 hover:border-teal-500/50 text-[10px] font-mono font-medium transition-colors"
          >
            Snap to 95:5
          </button>
        </div>
      </div>
    </div>
  );
};
