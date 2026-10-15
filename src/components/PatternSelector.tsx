import React from 'react';
import { PatternType } from '../types/hinge';
import {
  AlignJustify,
  Layers,
  Activity,
  Grid,
  Minimize2,
  Workflow,
} from 'lucide-react';

interface PatternSelectorProps {
  currentPattern: PatternType;
  onSelectPattern: (p: PatternType) => void;
}

interface PatternOption {
  id: PatternType;
  title: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
}

export const PATTERN_OPTIONS: PatternOption[] = [
  {
    id: 'straight-stagger',
    title: 'Straight Alternating',
    tag: 'Standard',
    desc: 'Classic 50% staggered brick cuts. Industry standard for wooden box corners and spines.',
    icon: <AlignJustify className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'tri-stagger',
    title: 'Tri-Step Stagger',
    tag: 'High Flex',
    desc: '3-phase offset cuts deliver a smoother curve with lower localized strain concentrations.',
    icon: <Layers className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'wave-sine',
    title: 'Sine Wave',
    tag: 'Organic',
    desc: 'Harmonic undulating cut lines. Eliminates sharp stress corners and looks beautiful.',
    icon: <Activity className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'cross-lattice',
    title: 'Cross T-Stop',
    tag: 'Anti-Crack',
    desc: 'Perpendicular relief tabs at slit ends to arrest crack propagation in brittle acrylic.',
    icon: <Minimize2 className="w-4 h-4 text-rose-400" />,
  },
  {
    id: 'honeycomb',
    title: 'Honeycomb Lattice',
    tag: 'Mesh',
    desc: 'Interlocking diamond nodes allow gentle 3D twisting and expansion compliance.',
    icon: <Grid className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'fishbone-chevron',
    title: 'Fishbone Chevron',
    tag: 'Helical',
    desc: 'Angled diagonal cuts. Ideal for wrapping around cylinders or directional stiffness.',
    icon: <Workflow className="w-4 h-4 text-indigo-400" />,
  },
];

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  currentPattern,
  onSelectPattern,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Cut Pattern Style
        </label>
        <span className="text-[11px] text-slate-500">6 Specialized Types</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PATTERN_OPTIONS.map((item) => {
          const isSelected = currentPattern === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPattern(item.id)}
              className={`flex flex-col text-left p-2.5 rounded-lg border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-1.5">
                  {item.icon}
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {item.desc}
              </p>

              {/* Selection indicator pill */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-bl-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
