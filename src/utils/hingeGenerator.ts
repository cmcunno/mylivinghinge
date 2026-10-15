import { CutPath, GeneratedHingeData, HingeParams, PatternType } from '../types/hinge';

export function generateHinge(params: HingeParams): GeneratedHingeData {
  const {
    hingeWidth,
    hingeHeight,
    cutLength,
    bridgeSize,
    lineSpacing,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    pattern,
    cutOrientation = 'vertical',
    waveAmplitude = 1.5,
    includeOuterBorder,
    outerBorderCornerRadius,
    includeMountingHoles,
    mountingHoleDiameter,
  } = params;

  const totalWidth = hingeWidth + marginLeft + marginRight;
  const totalHeight = hingeHeight + marginTop + marginBottom;

  const xMin = marginLeft;
  const xMax = marginLeft + hingeWidth;
  const yMin = marginTop;
  const yMax = marginTop + hingeHeight;

  const cutPaths: CutPath[] = [];

  // Generate pattern cuts based on orientation
  const isHorizontal = cutOrientation === 'horizontal';

  // Dimension along cut vs dimension across lines:
  // Vertical: cuts run along Y (from yMin to yMax), lines spaced across X (from xMin to xMax)
  // Horizontal: cuts run along X (from xMin to xMax), lines spaced across Y (from yMin to yMax)
  const cutDimMin = isHorizontal ? xMin : yMin;
  const cutDimMax = isHorizontal ? xMax : yMax;
  const lineDimMin = isHorizontal ? yMin : xMin;
  const lineDimMax = isHorizontal ? yMax : xMax;

  switch (pattern) {
    case 'straight-stagger':
      generateStraightStagger(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, 2, isHorizontal);
      break;
    case 'tri-stagger':
      generateStraightStagger(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, 3, isHorizontal);
      break;
    case 'wave-sine':
      generateWaveSine(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, waveAmplitude, isHorizontal);
      break;
    case 'cross-lattice':
      generateCrossLattice(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, isHorizontal);
      break;
    case 'honeycomb':
      generateHoneycombLattice(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, isHorizontal);
      break;
    case 'fishbone-chevron':
      generateFishboneChevron(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, isHorizontal);
      break;
    default:
      generateStraightStagger(cutPaths, cutDimMin, cutDimMax, lineDimMin, lineDimMax, cutLength, bridgeSize, lineSpacing, 2, isHorizontal);
  }

  // Generate outer border if enabled
  const outerBorderPaths: CutPath[] = [];
  if (includeOuterBorder) {
    outerBorderPaths.push(generateRoundedRect(0, 0, totalWidth, totalHeight, outerBorderCornerRadius));
  }

  // Generate mounting holes if enabled
  const holePaths: CutPath[] = [];
  if (includeMountingHoles) {
    const radius = mountingHoleDiameter / 2;
    // Four corner test holes placed inside the margins
    const holeOffsetLeft = Math.max(radius + 1.5, marginLeft / 2);
    const holeOffsetRight = totalWidth - Math.max(radius + 1.5, marginRight / 2);
    const holeOffsetTop = Math.max(radius + 1.5, marginTop / 2);
    const holeOffsetBottom = totalHeight - Math.max(radius + 1.5, marginBottom / 2);

    if (marginLeft >= radius * 2 && marginTop >= radius * 2) {
      holePaths.push({ type: 'circle', points: [{ x: holeOffsetLeft, y: holeOffsetTop }], radius });
    }
    if (marginLeft >= radius * 2 && marginBottom >= radius * 2) {
      holePaths.push({ type: 'circle', points: [{ x: holeOffsetLeft, y: holeOffsetBottom }], radius });
    }
    if (marginRight >= radius * 2 && marginTop >= radius * 2) {
      holePaths.push({ type: 'circle', points: [{ x: holeOffsetRight, y: holeOffsetTop }], radius });
    }
    if (marginRight >= radius * 2 && marginBottom >= radius * 2) {
      holePaths.push({ type: 'circle', points: [{ x: holeOffsetRight, y: holeOffsetBottom }], radius });
    }
  }

  // Calculate statistics
  let totalCutLengthMm = 0;
  for (const cp of cutPaths) {
    for (let i = 0; i < cp.points.length - 1; i++) {
      const dx = cp.points[i + 1].x - cp.points[i].x;
      const dy = cp.points[i + 1].y - cp.points[i].y;
      totalCutLengthMm += Math.hypot(dx, dy);
    }
  }
  for (const op of outerBorderPaths) {
    for (let i = 0; i < op.points.length - 1; i++) {
      const dx = op.points[i + 1].x - op.points[i].x;
      const dy = op.points[i + 1].y - op.points[i].y;
      totalCutLengthMm += Math.hypot(dx, dy);
    }
  }
  for (const hp of holePaths) {
    if (hp.radius) {
      totalCutLengthMm += 2 * Math.PI * hp.radius;
    }
  }

  const cutLineCount = cutPaths.length;
  const pierceCount = cutPaths.length + outerBorderPaths.length + holePaths.length;
  const estimatedCutTimeSec = Math.round(totalCutLengthMm / 28 + pierceCount * 0.12);

  const slitRatio = cutLength / Math.max(0.2, bridgeSize);
  let minBendRadiusMm = Math.max(
    3,
    Math.round(
      (params.materialThickness * 4.5 * (bridgeSize / Math.max(1, cutLength)) * (lineSpacing / 2)) * 10
    ) / 10
  );

  let flexibilityRating: GeneratedHingeData['stats']['flexibilityRating'] = 'Flexible';
  if (bridgeSize < 0.8 && slitRatio > 15) {
    flexibilityRating = 'Fragile (High Break Risk)';
  } else if (slitRatio > 8 && lineSpacing <= 2.5) {
    flexibilityRating = 'Very Flexible';
  } else if (slitRatio >= 4 && lineSpacing <= 3.5) {
    flexibilityRating = 'Flexible';
  } else if (slitRatio >= 2) {
    flexibilityRating = 'Moderate';
  } else {
    flexibilityRating = 'Stiff';
  }

  return {
    cutPaths,
    outerBorderPaths,
    holePaths,
    totalWidth,
    totalHeight,
    hingeBounds: { xMin, yMin, xMax, yMax },
    stats: {
      cutLineCount,
      totalCutLengthMm: Math.round(totalCutLengthMm * 10) / 10,
      pierceCount,
      minBendRadiusMm,
      estimatedCutTimeSec,
      flexibilityRating,
    },
  };
}

/**
 * Coordinate mapper: converts along-cut and across-lines coordinates to (x, y)
 */
function makePoint(alongCut: number, acrossLines: number, isHorizontal: boolean) {
  return isHorizontal
    ? { x: round(alongCut), y: round(acrossLines) }
    : { x: round(acrossLines), y: round(alongCut) };
}

/**
 * Straight Stagger Generator: alternates rows by 1/phases step
 */
function generateStraightStagger(
  cutPaths: CutPath[],
  cutDimMin: number,
  cutDimMax: number,
  lineDimMin: number,
  lineDimMax: number,
  cutLength: number,
  bridgeSize: number,
  lineSpacing: number,
  phases: number = 2,
  isHorizontal: boolean = false
) {
  const period = cutLength + bridgeSize;
  if (period <= 0 || lineSpacing <= 0) return;

  const numLines = Math.floor((lineDimMax - lineDimMin) / lineSpacing);
  const startLine = lineDimMin + (lineDimMax - lineDimMin - numLines * lineSpacing) / 2;

  for (let c = 0; c <= numLines; c++) {
    const lineCoord = startLine + c * lineSpacing;
    if (lineCoord < lineDimMin - 0.001 || lineCoord > lineDimMax + 0.001) continue;

    const phase = c % phases;
    const shift = (phase / phases) * period;

    let curCut = cutDimMin - period + shift;

    while (curCut < cutDimMax + period) {
      const segStart = curCut;
      const segEnd = curCut + cutLength;

      const clippedStart = Math.max(cutDimMin, segStart);
      const clippedEnd = Math.min(cutDimMax, segEnd);

      if (clippedEnd - clippedStart > 0.4) {
        cutPaths.push({
          type: 'line',
          points: [
            makePoint(clippedStart, lineCoord, isHorizontal),
            makePoint(clippedEnd, lineCoord, isHorizontal),
          ],
        });
      }

      curCut += period;
    }
  }
}

/**
 * Sine wave living hinge: smooth wavy lines that distribute torsional flex
 */
function generateWaveSine(
  cutPaths: CutPath[],
  cutDimMin: number,
  cutDimMax: number,
  lineDimMin: number,
  lineDimMax: number,
  cutLength: number,
  bridgeSize: number,
  lineSpacing: number,
  amplitude: number,
  isHorizontal: boolean = false
) {
  const period = cutLength + bridgeSize;
  if (period <= 0 || lineSpacing <= 0) return;

  const clampedAmp = Math.min(amplitude, lineSpacing * 0.42);
  const numLines = Math.floor((lineDimMax - lineDimMin) / lineSpacing);
  const startLine = lineDimMin + (lineDimMax - lineDimMin - numLines * lineSpacing) / 2;

  for (let c = 0; c <= numLines; c++) {
    const baseLine = startLine + c * lineSpacing;
    const phase = (c % 2) * 0.5 * period;

    let curCut = cutDimMin - period + phase;

    while (curCut < cutDimMax + period) {
      const segStart = curCut;
      const segEnd = curCut + cutLength;

      const clippedStart = Math.max(cutDimMin, segStart);
      const clippedEnd = Math.min(cutDimMax, segEnd);

      if (clippedEnd - clippedStart > 1.0) {
        const points: { x: number; y: number }[] = [];
        const steps = Math.max(6, Math.round((clippedEnd - clippedStart) / 1.5));
        const dir = c % 2 === 0 ? 1 : -1;

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const alongCut = clippedStart + t * (clippedEnd - clippedStart);
          const wavePhase = ((alongCut - segStart) / cutLength) * Math.PI * 2;
          const acrossLine = baseLine + Math.sin(wavePhase) * clampedAmp * dir;
          points.push(makePoint(alongCut, acrossLine, isHorizontal));
        }

        cutPaths.push({
          type: 'polyline',
          points,
        });
      }

      curCut += period;
    }
  }
}

/**
 * Cross-lattice / Interlocking T-stop pattern
 */
function generateCrossLattice(
  cutPaths: CutPath[],
  cutDimMin: number,
  cutDimMax: number,
  lineDimMin: number,
  lineDimMax: number,
  cutLength: number,
  bridgeSize: number,
  lineSpacing: number,
  isHorizontal: boolean = false
) {
  const period = cutLength + bridgeSize;
  if (period <= 0 || lineSpacing <= 0) return;

  const numLines = Math.floor((lineDimMax - lineDimMin) / lineSpacing);
  const startLine = lineDimMin + (lineDimMax - lineDimMin - numLines * lineSpacing) / 2;
  const tabWidth = Math.min(lineSpacing * 0.35, 1.2);

  for (let c = 0; c <= numLines; c++) {
    const lineCoord = startLine + c * lineSpacing;
    const phase = (c % 2) * 0.5 * period;

    let curCut = cutDimMin - period + phase;

    while (curCut < cutDimMax + period) {
      const segStart = curCut;
      const segEnd = curCut + cutLength;

      const clippedStart = Math.max(cutDimMin, segStart);
      const clippedEnd = Math.min(cutDimMax, segEnd);

      if (clippedEnd - clippedStart > 1.5) {
        // Main cut line
        cutPaths.push({
          type: 'line',
          points: [
            makePoint(clippedStart, lineCoord, isHorizontal),
            makePoint(clippedEnd, lineCoord, isHorizontal),
          ],
        });

        // Start tab
        if (clippedStart >= cutDimMin + 0.1 && clippedStart <= cutDimMax - 0.1) {
          cutPaths.push({
            type: 'line',
            points: [
              makePoint(clippedStart, lineCoord - tabWidth, isHorizontal),
              makePoint(clippedStart, lineCoord + tabWidth, isHorizontal),
            ],
          });
        }

        // End tab
        if (clippedEnd >= cutDimMin + 0.1 && clippedEnd <= cutDimMax - 0.1) {
          cutPaths.push({
            type: 'line',
            points: [
              makePoint(clippedEnd, lineCoord - tabWidth, isHorizontal),
              makePoint(clippedEnd, lineCoord + tabWidth, isHorizontal),
            ],
          });
        }
      }

      curCut += period;
    }
  }
}

/**
 * Honeycomb / Diamond mesh living hinge
 */
function generateHoneycombLattice(
  cutPaths: CutPath[],
  cutDimMin: number,
  cutDimMax: number,
  lineDimMin: number,
  lineDimMax: number,
  cutLength: number,
  bridgeSize: number,
  lineSpacing: number,
  isHorizontal: boolean = false
) {
  const period = cutLength + bridgeSize;
  if (period <= 0 || lineSpacing <= 0) return;

  const numLines = Math.floor((lineDimMax - lineDimMin) / lineSpacing);
  const startLine = lineDimMin + (lineDimMax - lineDimMin - numLines * lineSpacing) / 2;
  const diagOffset = Math.min(lineSpacing * 0.38, 1.5);

  for (let c = 0; c <= numLines; c++) {
    const lineCoord = startLine + c * lineSpacing;
    const phase = (c % 2) * 0.5 * period;

    let curCut = cutDimMin - period + phase;

    while (curCut < cutDimMax + period) {
      const segStart = curCut;
      const segEnd = curCut + cutLength;

      const clippedStart = Math.max(cutDimMin, segStart);
      const clippedEnd = Math.min(cutDimMax, segEnd);

      if (clippedEnd - clippedStart > 2.0) {
        const mid = (clippedStart + clippedEnd) / 2;
        const dir = c % 2 === 0 ? 1 : -1;

        cutPaths.push({
          type: 'polyline',
          points: [
            makePoint(clippedStart, lineCoord - diagOffset * dir, isHorizontal),
            makePoint(clippedStart + (clippedEnd - clippedStart) * 0.2, lineCoord, isHorizontal),
            makePoint(mid, lineCoord, isHorizontal),
            makePoint(clippedEnd - (clippedEnd - clippedStart) * 0.2, lineCoord, isHorizontal),
            makePoint(clippedEnd, lineCoord + diagOffset * dir, isHorizontal),
          ],
        });
      }

      curCut += period;
    }
  }
}

/**
 * Fishbone / Chevron diagonal cut pattern
 */
function generateFishboneChevron(
  cutPaths: CutPath[],
  cutDimMin: number,
  cutDimMax: number,
  lineDimMin: number,
  lineDimMax: number,
  cutLength: number,
  bridgeSize: number,
  lineSpacing: number,
  isHorizontal: boolean = false
) {
  const period = cutLength + bridgeSize;
  if (period <= 0 || lineSpacing <= 0) return;

  const numLines = Math.floor((lineDimMax - lineDimMin) / lineSpacing);
  const startLine = lineDimMin + (lineDimMax - lineDimMin - numLines * lineSpacing) / 2;
  const slant = Math.min(lineSpacing * 0.45, 2.0);

  for (let c = 0; c <= numLines; c++) {
    const baseLine = startLine + c * lineSpacing;
    const phase = (c % 2) * 0.5 * period;

    let curCut = cutDimMin - period + phase;

    while (curCut < cutDimMax + period) {
      const segStart = curCut;
      const segEnd = curCut + cutLength;

      const clippedStart = Math.max(cutDimMin, segStart);
      const clippedEnd = Math.min(cutDimMax, segEnd);

      if (clippedEnd - clippedStart > 1.5) {
        const sign = c % 2 === 0 ? 1 : -1;
        cutPaths.push({
          type: 'line',
          points: [
            makePoint(clippedStart, baseLine - slant * sign, isHorizontal),
            makePoint(clippedEnd, baseLine + slant * sign, isHorizontal),
          ],
        });
      }

      curCut += period;
    }
  }
}

/**
 * Rounded rectangle path generator
 */
function generateRoundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): CutPath {
  const r = Math.min(radius, width / 2, height / 2);
  if (r <= 0.1) {
    return {
      type: 'polyline',
      points: [
        { x: round(x), y: round(y) },
        { x: round(x + width), y: round(y) },
        { x: round(x + width), y: round(y + height) },
        { x: round(x), y: round(y + height) },
        { x: round(x), y: round(y) },
      ],
    };
  }

  const points: { x: number; y: number }[] = [];
  const segments = 6;

  for (let i = 0; i <= segments; i++) {
    const th = Math.PI + (i / segments) * (Math.PI / 2);
    points.push({ x: round(x + r + Math.cos(th) * r), y: round(y + r + Math.sin(th) * r) });
  }
  for (let i = 0; i <= segments; i++) {
    const th = 1.5 * Math.PI + (i / segments) * (Math.PI / 2);
    points.push({ x: round(x + width - r + Math.cos(th) * r), y: round(y + r + Math.sin(th) * r) });
  }
  for (let i = 0; i <= segments; i++) {
    const th = 0 + (i / segments) * (Math.PI / 2);
    points.push({ x: round(x + width - r + Math.cos(th) * r), y: round(y + height - r + Math.sin(th) * r) });
  }
  for (let i = 0; i <= segments; i++) {
    const th = 0.5 * Math.PI + (i / segments) * (Math.PI / 2);
    points.push({ x: round(x + r + Math.cos(th) * r), y: round(y + height - r + Math.sin(th) * r) });
  }
  points.push({ ...points[0] });

  return {
    type: 'polyline',
    points,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
