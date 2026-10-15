import React from 'react';
import { X, BookOpen, AlertTriangle, Compass, CheckCircle2, Flame } from 'lucide-react';

interface HingeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HingeGuideModal: React.FC<HingeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Living Hinge Engineering Guide</h3>
              <p className="text-xs text-slate-400">Rules of thumb for reliable laser-cut flexible hinges</p>
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Rule 1: Wood Grain Direction */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Compass className="w-4 h-4" />
              <span>1. Wood Grain Orientation (Critical!)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Always orient the sheet so that the cut slits run <strong className="text-slate-200">perpendicular to the surface wood grain</strong>. The bending force will then twist against the grain fibers. If cuts run parallel to the grain, the wood will immediately split along the growth rings!
            </p>
          </div>

          {/* Rule 2: Bridge Size vs Kerf */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <Flame className="w-4 h-4" />
              <span>2. Laser Kerf Compensation</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Laser beams burn away material (typically <strong className="text-slate-200">0.12mm to 0.20mm</strong> of kerf). This widens the slits and correspondingly shrinks your solid bridges. If you set a 1.0mm bridge and your kerf is 0.18mm, the real structural bridge width is only ~0.82mm. Keep bridges at least <strong className="text-slate-200">1.8mm to 2.5mm</strong> on 3mm plywood.
            </p>
          </div>

          {/* Rule 3: Acrylic & Brittle Materials */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Working with Cast Acrylic</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Acrylic has virtually zero grain compliance and high notch sensitivity. Sharp slit ends act as stress concentrations. For acrylic, choose the <strong className="text-slate-200">Cross T-Stop</strong> pattern (which adds stress relief cross-bars) or gently warm the hinge with a heat gun to ease cold bend tension.
            </p>
          </div>

          {/* Rule 4: Prototyping Swatches */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Always Cut a Test Swatch First</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Turn on <strong className="text-slate-200">Cut Outer Swatch Border</strong> and <strong className="text-slate-200">Corner Mounting Holes</strong> to export a small standalone coupon. Test it by bending manually before committing large sheets of expensive hardwood veneer or acrylic.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
