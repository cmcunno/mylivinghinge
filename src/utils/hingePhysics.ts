export interface BendCalculatorInput {
  targetAngleDeg: number; // e.g. 90 or 180
  insideRadiusMm: number; // e.g. 15
  materialThicknessMm: number;
}

export function calculateArcLengthForBend(input: BendCalculatorInput): {
  requiredHingeWidthMm: number;
  neutralRadiusMm: number;
} {
  const neutralRadius = input.insideRadiusMm + input.materialThicknessMm * 0.5;
  const angleRad = (input.targetAngleDeg * Math.PI) / 180;
  const arcLength = angleRad * neutralRadius;
  return {
    requiredHingeWidthMm: Math.round(arcLength * 10) / 10,
    neutralRadiusMm: Math.round(neutralRadius * 10) / 10,
  };
}

export interface DesignPreset {
  name: string;
  description: string;
  tag: string;
  params: {
    pattern: 'straight-stagger' | 'tri-stagger' | 'wave-sine' | 'honeycomb' | 'cross-lattice' | 'fishbone-chevron';
    cutOrientation?: 'vertical' | 'horizontal';
    hingeWidth: number;
    hingeHeight: number;
    cutLength: number;
    bridgeSize: number;
    lineSpacing: number;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    materialThickness: number;
    kerf: number;
    includeOuterBorder: boolean;
    outerBorderCornerRadius: number;
    includeMountingHoles: boolean;
    mountingHoleDiameter: number;
  };
}

export const PRESET_LIBRARY: DesignPreset[] = [
  {
    name: 'Classic Book Spine / Box 90°',
    description: 'Balanced 3mm plywood standard alternating cut. Reliable 90° to 120° bend.',
    tag: 'Popular',
    params: {
      pattern: 'straight-stagger',
      hingeWidth: 40,
      hingeHeight: 120,
      cutLength: 14,
      bridgeSize: 2.0,
      lineSpacing: 2.5,
      marginLeft: 25,
      marginRight: 25,
      marginTop: 10,
      marginBottom: 10,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 4,
      includeMountingHoles: true,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'Organic Sine Wave Hinge',
    description: 'Smooth undulating sinusoidal slits distribute bending stresses uniformly. Ideal for artistic boxes and curved lamps.',
    tag: 'Aesthetic',
    params: {
      pattern: 'wave-sine',
      hingeWidth: 50,
      hingeHeight: 130,
      cutLength: 16,
      bridgeSize: 2.5,
      lineSpacing: 3.0,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
      marginBottom: 10,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 4,
      includeMountingHoles: false,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'Tight 180° Fold / Wallet Wrap',
    description: 'Dense pitch and long slits allowing full 180° tight wrap for notebook covers or folding cases.',
    tag: 'Ultra-Flex',
    params: {
      pattern: 'tri-stagger',
      hingeWidth: 60,
      hingeHeight: 100,
      cutLength: 18,
      bridgeSize: 1.8,
      lineSpacing: 2.0,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 8,
      marginBottom: 8,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 3,
      includeMountingHoles: false,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'T-Stop Crack Inhibitor (Acrylic Safe)',
    description: 'Stress-relief cross tabs at slit ends prevent notch stress fractures in brittle acrylic or MDF.',
    tag: 'Acrylic Safe',
    params: {
      pattern: 'cross-lattice',
      hingeWidth: 45,
      hingeHeight: 110,
      cutLength: 15,
      bridgeSize: 2.2,
      lineSpacing: 2.8,
      marginLeft: 25,
      marginRight: 25,
      marginTop: 10,
      marginBottom: 10,
      materialThickness: 3.0,
      kerf: 0.12,
      includeOuterBorder: true,
      outerBorderCornerRadius: 4,
      includeMountingHoles: true,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'Expandable Honeycomb Lattice',
    description: 'Interlocking diamond lattice for 3D curved surfaces or multi-axis compliance.',
    tag: 'Lattice',
    params: {
      pattern: 'honeycomb',
      hingeWidth: 55,
      hingeHeight: 120,
      cutLength: 12,
      bridgeSize: 2.0,
      lineSpacing: 3.2,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
      marginBottom: 10,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 4,
      includeMountingHoles: false,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'Fishbone Chevron Helix',
    description: 'Angled slits providing directional torsion and spiral cylinder bending.',
    tag: 'Specialty',
    params: {
      pattern: 'fishbone-chevron',
      hingeWidth: 45,
      hingeHeight: 120,
      cutLength: 14,
      bridgeSize: 2.2,
      lineSpacing: 2.6,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
      marginBottom: 10,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 3,
      includeMountingHoles: false,
      mountingHoleDiameter: 3.2,
    },
  },
  {
    name: 'Roll-Top Box Lid (Horizontal Cuts)',
    description: 'Cuts run horizontally across the width, allowing vertical curling upward for tambour doors and curved box tops.',
    tag: 'Horizontal',
    params: {
      pattern: 'straight-stagger',
      cutOrientation: 'horizontal',
      hingeWidth: 140,
      hingeHeight: 50,
      cutLength: 16,
      bridgeSize: 2.2,
      lineSpacing: 2.5,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 25,
      marginBottom: 25,
      materialThickness: 3.0,
      kerf: 0.15,
      includeOuterBorder: true,
      outerBorderCornerRadius: 4,
      includeMountingHoles: true,
      mountingHoleDiameter: 3.2,
    },
  },
];
