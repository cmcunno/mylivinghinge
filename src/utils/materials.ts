import { MaterialPreset, MaterialPresetId } from '../types/hinge';

export const MM_TO_INCH = 1 / 25.4;
export const INCH_TO_MM = 25.4;

export function mmToUnit(valMm: number, unit: 'mm' | 'inch'): number {
  if (unit === 'inch') {
    return Number((valMm * MM_TO_INCH).toFixed(3));
  }
  return Number(valMm.toFixed(2));
}

export function unitToMm(valInUnit: number, unit: 'mm' | 'inch'): number {
  if (unit === 'inch') {
    return Number((valInUnit * INCH_TO_MM).toFixed(2));
  }
  return valInUnit;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'plywood-3mm',
    name: '3.0mm (1/8") Birch Plywood',
    category: 'Wood',
    thickness: 3.0,
    defaultKerf: 0.15,
    elasticModulusRatio: 1.0,
    recommendedMinRadius: 18,
    description: 'Most popular living hinge material. Excellent flexural strength when cuts run perpendicular to face wood grain.',
  },
  {
    id: 'plywood-4mm',
    name: '4.0mm Plywood / Poplar',
    category: 'Wood',
    thickness: 4.0,
    defaultKerf: 0.18,
    elasticModulusRatio: 1.25,
    recommendedMinRadius: 25,
    description: 'Requires slightly longer cuts or tighter spacing. Sturdy for larger enclosures and furniture.',
  },
  {
    id: 'plywood-6mm',
    name: '6.0mm (1/4") Plywood',
    category: 'Wood',
    thickness: 6.0,
    defaultKerf: 0.22,
    elasticModulusRatio: 1.6,
    recommendedMinRadius: 40,
    description: 'Heavy duty hinge. Requires wide hinge zone and generous cut segments to prevent splintering.',
  },
  {
    id: 'acrylic-3mm',
    name: '3.0mm Cast Acrylic (PMMA)',
    category: 'Plastic',
    thickness: 3.0,
    defaultKerf: 0.12,
    elasticModulusRatio: 1.4,
    recommendedMinRadius: 28,
    description: 'Cast acrylic can bend when warmed or gently cold-flexed with wider bridge tabs to stop notch cracks.',
  },
  {
    id: 'mdf-3mm',
    name: '3.0mm Hardboard / MDF',
    category: 'Wood',
    thickness: 3.0,
    defaultKerf: 0.16,
    elasticModulusRatio: 1.15,
    recommendedMinRadius: 20,
    description: 'Uniform isotropic density with no grain direction. Prone to snapping if over-stressed without sufficient bridges.',
  },
  {
    id: 'veneer-1-5mm',
    name: '1.5mm Wood Veneer / Kraftplex',
    category: 'Wood',
    thickness: 1.5,
    defaultKerf: 0.1,
    elasticModulusRatio: 0.6,
    recommendedMinRadius: 8,
    description: 'Extremely flexible. Perfect for book covers, curved lamp shades, and wallets.',
  },
  {
    id: 'cardstock-1mm',
    name: '1.0mm Heavy Cardstock / Greyboard',
    category: 'Card / Paper',
    thickness: 1.0,
    defaultKerf: 0.08,
    elasticModulusRatio: 0.4,
    recommendedMinRadius: 5,
    description: 'Ideal for papercraft packaging, rapid prototyping, and architectural models.',
  },
  {
    id: 'custom',
    name: 'Custom Material',
    category: 'Wood',
    thickness: 3.0,
    defaultKerf: 0.15,
    elasticModulusRatio: 1.0,
    recommendedMinRadius: 20,
    description: 'User specified thickness, kerf allowance, and custom cut parameters.',
  },
];
