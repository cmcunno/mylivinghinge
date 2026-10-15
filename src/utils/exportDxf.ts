import { ExportSettings, GeneratedHingeData, HingeParams } from '../types/hinge';

export function buildDxfString(
  data: GeneratedHingeData,
  params: HingeParams,
  settings: ExportSettings
): string {
  const { totalWidth, totalHeight, cutPaths, outerBorderPaths, holePaths } = data;
  const isInch = settings.unit === 'inch';
  const scale = isInch ? 1 / 25.4 : 1.0;
  const insUnits = isInch ? 1 : 4; // 1 = Inches, 4 = Millimeters

  // Flip Y coordinate so that origin (0,0) is bottom-left in standard CAD coordinate space
  const flipY = (y: number) => (totalHeight - y) * scale;
  const scaleX = (x: number) => x * scale;

  let dxf = '';

  // HEADER SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1009\n'; // AutoCAD R12 ASCII - maximum universal laser cutter compatibility
  dxf += '9\n$INSUNITS\n70\n' + insUnits + '\n';
  dxf += '9\n$EXTMIN\n10\n0.0\n20\n0.0\n30\n0.0\n';
  dxf += `9\n$EXTMAX\n10\n${(totalWidth * scale).toFixed(4)}\n20\n${(totalHeight * scale).toFixed(4)}\n30\n0.0\n`;
  dxf += '0\nENDSEC\n';

  // TABLES SECTION (Layers)
  dxf += '0\nSECTION\n';
  dxf += '2\nTABLES\n';
  dxf += '0\nTABLE\n';
  dxf += '2\nLAYER\n';
  dxf += '70\n3\n';

  // Layer: CUT_HINGE (Color 1 = Red)
  dxf += '0\nLAYER\n2\nCUT_HINGE\n70\n0\n62\n1\n6\nCONTINUOUS\n';
  // Layer: OUTER_BORDER (Color 7 = White/Black)
  dxf += '0\nLAYER\n2\nOUTER_BORDER\n70\n0\n62\n7\n6\nCONTINUOUS\n';
  // Layer: MOUNTING_HOLES (Color 5 = Blue)
  dxf += '0\nLAYER\n2\nMOUNTING_HOLES\n70\n0\n62\n5\n6\nCONTINUOUS\n';

  dxf += '0\nENDTAB\n';
  dxf += '0\nENDSEC\n';

  // ENTITIES SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nENTITIES\n';

  // 1. Hinge Cut Paths (Output as standard LINE entities for maximum firmware compatibility)
  for (const cp of cutPaths) {
    for (let i = 0; i < cp.points.length - 1; i++) {
      const p1 = cp.points[i];
      const p2 = cp.points[i + 1];

      dxf += '0\nLINE\n';
      dxf += '8\nCUT_HINGE\n';
      dxf += '10\n' + scaleX(p1.x).toFixed(4) + '\n';
      dxf += '20\n' + flipY(p1.y).toFixed(4) + '\n';
      dxf += '30\n0.0\n';
      dxf += '11\n' + scaleX(p2.x).toFixed(4) + '\n';
      dxf += '21\n' + flipY(p2.y).toFixed(4) + '\n';
      dxf += '31\n0.0\n';
    }
  }

  // 2. Outer Border Paths
  if (settings.includeOuterBorder && outerBorderPaths.length > 0) {
    for (const op of outerBorderPaths) {
      for (let i = 0; i < op.points.length - 1; i++) {
        const p1 = op.points[i];
        const p2 = op.points[i + 1];

        dxf += '0\nLINE\n';
        dxf += '8\nOUTER_BORDER\n';
        dxf += '10\n' + scaleX(p1.x).toFixed(4) + '\n';
        dxf += '20\n' + flipY(p1.y).toFixed(4) + '\n';
        dxf += '30\n0.0\n';
        dxf += '11\n' + scaleX(p2.x).toFixed(4) + '\n';
        dxf += '21\n' + flipY(p2.y).toFixed(4) + '\n';
        dxf += '31\n0.0\n';
      }
    }
  }

  // 3. Mounting Holes (CIRCLE entities)
  if (holePaths.length > 0) {
    for (const hp of holePaths) {
      if (hp.radius) {
        dxf += '0\nCIRCLE\n';
        dxf += '8\nMOUNTING_HOLES\n';
        dxf += '10\n' + scaleX(hp.points[0].x).toFixed(4) + '\n';
        dxf += '20\n' + flipY(hp.points[0].y).toFixed(4) + '\n';
        dxf += '30\n0.0\n';
        dxf += '40\n' + (hp.radius * scale).toFixed(4) + '\n';
      }
    }
  }

  dxf += '0\nENDSEC\n';
  dxf += '0\nEOF\n';

  return dxf;
}

export function downloadDxf(
  data: GeneratedHingeData,
  params: HingeParams,
  settings: ExportSettings
) {
  const dxfContent = buildDxfString(data, params, settings);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `living-hinge-${params.pattern}-${Math.round(params.hingeWidth)}x${Math.round(params.hingeHeight)}mm.dxf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
