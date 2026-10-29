export type PatternType =
  | 'straight-stagger'
  | 'tri-stagger'
  | 'wave-sine'
  | 'honeycomb'
  | 'cross-lattice'
  | 'fishbone-chevron';

export type UnitType = 'mm' | 'inch';

export type MaterialPresetId =
  | 'plywood-3mm'
  | 'plywood-4mm'
  | 'plywood-6mm'
  | 'acrylic-3mm'
  | 'mdf-3mm'
  | 'veneer-1-5mm'
  | 'cardstock-1mm'
  | 'custom';

export interface MaterialPreset {
  id: MaterialPresetId;
  name: string;
  category: 'Wood' | 'Plastic' | 'Card / Paper';
  thickness: number; // in mm
  defaultKerf: number; // in mm
  elasticModulusRatio: number; // relative stiffness factor
  recommendedMinRadius: number; // in mm
  description: string;
}

export interface HingeParams {
  // Dimensions (internal stored in mm)
  hingeWidth: number; // width of cut region (direction across lines)
  hingeHeight: number; // height of cut region (length of lines)
  
  // Cut specifications
  cutLength: number; // length of each slit
  bridgeSize: number; // gap between collinear cuts
  lineSpacing: number; // pitch between adjacent cut lines
  
  // Margins / borders
  marginLeft: number; // solid uncut border left
  marginRight: number; // solid uncut border right
  marginTop: number; // solid uncut border top
  marginBottom: number; // solid uncut border bottom
  
  // Pattern-specific
  pattern: PatternType;
  cutOrientation: 'vertical' | 'horizontal'; // vertical = cuts run vertically (bends left/right), horizontal = cuts run horizontally (bends top/bottom)
  waveAmplitude?: number; // for wave pattern (in mm)
  waveFrequency?: number; // for wave pattern (cycles along line)
  
  // Outer swatch border & mounting
  includeOuterBorder: boolean; // cut enclosing rectangle
  outerBorderCornerRadius: number; // rounded corners for test swatch
  includeMountingHoles: boolean;
  mountingHoleDiameter: number;
  
  // Laser Kerf
  kerf: number; // laser cut kerf width (typically 0.15mm)
  
  // Material
  materialId: MaterialPresetId;
  materialThickness: number; // in mm
  
  // Display unit
  unit: UnitType;
}

export interface CutLineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CutPath {
  type: 'line' | 'polyline' | 'circle';
  points: { x: number; y: number }[];
  radius?: number; // for circles
}

export interface GeneratedHingeData {
  cutPaths: CutPath[];
  outerBorderPaths: CutPath[];
  holePaths: CutPath[];
  totalWidth: number; // hingeWidth + marginLeft + marginRight
  totalHeight: number; // hingeHeight + marginTop + marginBottom
  hingeBounds: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  stats: {
    cutLineCount: number;
    totalCutLengthMm: number;
    pierceCount: number;
    minBendRadiusMm: number;
    estimatedCutTimeSec: number; // at approx 25mm/s laser feed
    flexibilityRating: 'Very Flexible' | 'Flexible' | 'Moderate' | 'Stiff' | 'Fragile (High Break Risk)';
    cutToBridgeRatio: {
      cutPercent: number;
      bridgePercent: number;
      ratioString: string;
      ratioFormatted: string;
      isIdeal: boolean;
      status: 'stiff' | 'moderate' | 'optimal' | 'ultra-flex' | 'fragile';
      statusLabel: string;
    };
  };
}

export interface ExportSettings {
  format: 'svg' | 'dxf';
  unit: UnitType;
  colorScheme: 'red-cut' | 'black-cut' | 'blue-cut';
  includeOuterBorder: boolean;
  includeDimensionsLayer: boolean;
  hairlineWidth: number; // in mm (e.g. 0.05 or 0.1)
  laserKerfCompensation: boolean;
}
