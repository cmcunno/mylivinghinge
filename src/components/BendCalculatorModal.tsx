import React, { useState } from 'react';
import { calculateArcLengthForBend } from '../utils/hingePhysics';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface BendCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialThickness: number;
  onApplyWidth: (widthMm: number) => void;
}

export const BendCalculatorModal: React.FC<BendCalculatorModalProps> = ({
  isOpen,
  onClose,
  materialThickness,
  onApplyWidth,
}) => {
  const [targetAngleDeg, setTargetAngleDeg] = useState(90);
  const [insideRadiusMm, setInsideRadiusMm] = useState(15);

  if (!isOpen) return null;

  const result = calculateArcLengthForBend({
    targetAngleDeg,
    insideRadiusMm,
    materialThicknessMm: materialThickness,
  });

  const handleApply = () => {
    onApplyWidth(result.requiredHingeWidthMm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Bend Arc Length Calculator</h3>
              <p className="text-xs text-slate-400">
                Compute the exact hinge width required for your target curve
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <p className="text-slate-400">
            When material bends, its neutral bending axis lies at half its thickness ($t/2$). To wrap around a corner of inside radius $R$, the required hinge width is $W = \theta \times (R + t/2)$.
          </p>

          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            {/* Target Bend Angle */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-300">Target Bend Angle:</span>
                <span className="font-mono text-emerald-400 font-bold">{targetAngleDeg}°</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { label: '45°', val: 45 },
                  { label: '90° Box', val: 90 },
                  { label: '120°', val: 120 },
                  { label: '180° Fold', val: 180 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTargetAngleDeg(item.val)}
                    className={`py-1 rounded text-center border font-mono transition-colors ${
                      targetAngleDeg === item.val
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={targetAngleDeg}
                onChange={(e) => setTargetAngleDeg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Inside Corner Radius */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-300">Inside Corner Radius ($R$):</span>
                <span className="font-mono text-emerald-400 font-bold">{insideRadiusMm} mm</span>
              </div>
              <input
                type="range"
                min="3"
                max="80"
                step="1"
                value={insideRadiusMm}
                onChange={(e) => setInsideRadiusMm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Sharp (5mm)</span>
                <span>Standard (15mm)</span>
                <span>Gentle (80mm)</span>
              </div>
            </div>

            {/* Current Material Thickness Readout */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-400">
              <span>Material Thickness:</span>
              <span className="font-mono text-slate-200">{materialThickness} mm</span>
            </div>
          </div>

          {/* Result Calculation Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider block">
                Calculated Hinge Width
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {result.requiredHingeWidthMm} <span className="text-sm font-normal text-slate-400">mm</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Neutral Arc Radius: {result.neutralRadiusMm} mm
              </span>
            </div>
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Apply Width</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
