import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeneratedHingeData, HingeParams } from '../types/hinge';
import { Play, Pause, Rotate3d, Compass, RefreshCw } from 'lucide-react';

interface Hinge3DPreviewProps {
  data: GeneratedHingeData;
  params: HingeParams;
}

export const Hinge3DPreview: React.FC<Hinge3DPreviewProps> = ({ data, params }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [bendAngleDeg, setBendAngleDeg] = useState(90);
  const [isAnimating, setIsAnimating] = useState(false);
  const [materialTheme, setMaterialTheme] = useState<'birch' | 'walnut' | 'acrylic' | 'blueprint'>('birch');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const animDirectionRef = useRef<number>(1);
  const angleRef = useRef<number>(bendAngleDeg);

  angleRef.current = bendAngleDeg;

  // Set up Three.js Scene, Camera, Controls, Lights
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(materialTheme === 'blueprint' ? 0x0a192f : 0x0f172a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, -180, 220);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.minDistance = 40;
    controls.maxDistance = 600;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaed, 1.8);
    dirLight1.position.set(120, -150, 250);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90b0e0, 0.8);
    dirLight2.position.set(-150, 150, 100);
    scene.add(dirLight2);

    // Floor Grid / Shadow plane
    const gridHelper = new THREE.GridHelper(300, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = 0;
    gridHelper.position.z = -30;
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Mesh group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Animation Loop
    let lastTime = performance.now();
    const renderLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Animate flex cycle if toggled
      if (isAnimating) {
        setBendAngleDeg((prev) => {
          let next = prev + animDirectionRef.current * 45 * dt;
          if (next >= 165) {
            next = 165;
            animDirectionRef.current = -1;
          } else if (next <= 5) {
            next = 5;
            animDirectionRef.current = 1;
          }
          return next;
        });
      }

      controls.update();
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update background color when material theme changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(materialTheme === 'blueprint' ? 0x0a192f : 0x0f172a);
    }
  }, [materialTheme]);

  // Rebuild 3D Deformed Sheet Geometry whenever parameters or bend angle changes
  useEffect(() => {
    if (!meshGroupRef.current) return;

    const group = meshGroupRef.current;
    // Clear old children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    }

    const { totalWidth, totalHeight, hingeBounds } = data;
    const thickness = params.materialThickness;
    const angleRad = (bendAngleDeg * Math.PI) / 180;

    const leftMargin = params.marginLeft;
    const hingeW = params.hingeWidth;
    const rightMargin = params.marginRight;

    // Procedural texture for wood/acrylic surface with real laser slits
    const textureCanvas = document.createElement('canvas');
    const texW = 1024;
    const texH = Math.round((totalHeight / totalWidth) * texW);
    textureCanvas.width = texW;
    textureCanvas.height = Math.max(128, texH);
    const ctx = textureCanvas.getContext('2d');

    if (ctx) {
      // Base material color
      if (materialTheme === 'birch') {
        ctx.fillStyle = '#e8c99b';
        ctx.fillRect(0, 0, texW, texH);
        // Subtle wood grain lines
        ctx.fillStyle = 'rgba(180, 130, 80, 0.08)';
        for (let i = 0; i < 40; i++) {
          ctx.fillRect(0, (i / 40) * texH, texW, 3 + Math.random() * 4);
        }
      } else if (materialTheme === 'walnut') {
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(0, 0, texW, texH);
        ctx.fillStyle = 'rgba(40, 25, 20, 0.15)';
        for (let i = 0; i < 40; i++) {
          ctx.fillRect(0, (i / 40) * texH, texW, 4 + Math.random() * 5);
        }
      } else if (materialTheme === 'acrylic') {
        ctx.fillStyle = 'rgba(230, 245, 255, 0.75)';
        ctx.fillRect(0, 0, texW, texH);
      } else {
        // Blueprint
        ctx.fillStyle = '#102a45';
        ctx.fillRect(0, 0, texW, texH);
      }

      // Draw living hinge cut lines as laser kerf cuts with charred edges
      const scaleX = texW / totalWidth;
      const scaleY = texH / totalHeight;

      ctx.strokeStyle = materialTheme === 'blueprint' ? '#60a5fa' : '#1a1008';
      ctx.lineWidth = Math.max(2, (params.kerf * scaleX * 1.5));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const cp of data.cutPaths) {
        if (cp.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(cp.points[0].x * scaleX, cp.points[0].y * scaleY);
          for (let i = 1; i < cp.points.length; i++) {
            ctx.lineTo(cp.points[i].x * scaleX, cp.points[i].y * scaleY);
          }
          ctx.stroke();
        }
      }

      // Draw mounting holes if present
      if (params.includeMountingHoles) {
        ctx.fillStyle = '#0f172a';
        for (const hp of data.holePaths) {
          if (hp.radius) {
            ctx.beginPath();
            ctx.arc(hp.points[0].x * scaleX, hp.points[0].y * scaleY, hp.radius * scaleX, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }

    const surfaceTexture = new THREE.CanvasTexture(textureCanvas);
    surfaceTexture.colorSpace = THREE.SRGBColorSpace;

    // Create deformed 3D mesh:
    // We break the total sheet into segments along X (left flat, curved bend, right flat)
    const segsX = 90;
    const segsY = 30;

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const isHorizontal = params.cutOrientation === 'horizontal';
    const topMargin = params.marginTop;
    const hingeH = params.hingeHeight;

    // Helper: compute 3D point (x3d, y3d, z3d) and tangent for an original 2D (x, y)
    const deformPoint = (x2d: number, y2d: number, zOffset: number) => {
      if (!isHorizontal) {
        // Vertical cuts: bends along X-Z plane
        const centeredY = y2d - totalHeight / 2;

        if (x2d <= leftMargin) {
          // Left flat panel (aligned along -X)
          const localX = x2d - leftMargin;
          return {
            x: localX,
            y: centeredY,
            z: zOffset,
            norm: [0, 0, 1],
          };
        } else if (x2d <= leftMargin + hingeW) {
          // Curved hinge zone: bends around a cylinder of neutral radius R
          const hingeFrac = (x2d - leftMargin) / Math.max(0.01, hingeW);
          const theta = hingeFrac * angleRad;

          if (Math.abs(angleRad) < 0.005) {
            return {
              x: x2d - leftMargin,
              y: centeredY,
              z: zOffset,
              norm: [0, 0, 1],
            };
          }

          const neutralRadius = hingeW / angleRad;
          const r = neutralRadius + zOffset;

          return {
            x: neutralRadius - r * Math.cos(theta),
            y: centeredY,
            z: r * Math.sin(theta),
            norm: [-Math.cos(theta), 0, Math.sin(theta)],
          };
        } else {
          // Right flat panel
          const excessX = x2d - (leftMargin + hingeW);

          if (Math.abs(angleRad) < 0.005) {
            return {
              x: hingeW + excessX,
              y: centeredY,
              z: zOffset,
              norm: [0, 0, 1],
            };
          }

          const neutralRadius = hingeW / angleRad;
          const endX = neutralRadius - (neutralRadius + zOffset) * Math.cos(angleRad);
          const endZ = (neutralRadius + zOffset) * Math.sin(angleRad);

          const tangX = Math.sin(angleRad);
          const tangZ = Math.cos(angleRad);

          return {
            x: endX + excessX * tangX,
            y: centeredY,
            z: endZ + excessX * tangZ,
            norm: [-Math.cos(angleRad), 0, Math.sin(angleRad)],
          };
        }
      } else {
        // Horizontal cuts: bends along Y-Z plane
        const centeredX = x2d - totalWidth / 2;

        if (y2d <= topMargin) {
          // Bottom flat panel
          const localY = y2d - topMargin;
          return {
            x: centeredX,
            y: localY,
            z: zOffset,
            norm: [0, 0, 1],
          };
        } else if (y2d <= topMargin + hingeH) {
          // Curved hinge zone
          const hingeFrac = (y2d - topMargin) / Math.max(0.01, hingeH);
          const theta = hingeFrac * angleRad;

          if (Math.abs(angleRad) < 0.005) {
            return {
              x: centeredX,
              y: y2d - topMargin,
              z: zOffset,
              norm: [0, 0, 1],
            };
          }

          const neutralRadius = hingeH / angleRad;
          const r = neutralRadius + zOffset;

          return {
            x: centeredX,
            y: neutralRadius - r * Math.cos(theta),
            z: r * Math.sin(theta),
            norm: [0, -Math.cos(theta), Math.sin(theta)],
          };
        } else {
          // Top flat panel
          const excessY = y2d - (topMargin + hingeH);

          if (Math.abs(angleRad) < 0.005) {
            return {
              x: centeredX,
              y: hingeH + excessY,
              z: zOffset,
              norm: [0, 0, 1],
            };
          }

          const neutralRadius = hingeH / angleRad;
          const endY = neutralRadius - (neutralRadius + zOffset) * Math.cos(angleRad);
          const endZ = (neutralRadius + zOffset) * Math.sin(angleRad);

          const tangY = Math.sin(angleRad);
          const tangZ = Math.cos(angleRad);

          return {
            x: centeredX,
            y: endY + excessY * tangY,
            z: endZ + excessY * tangZ,
            norm: [0, -Math.cos(angleRad), Math.sin(angleRad)],
          };
        }
      }
    };

    // Build top and bottom surfaces
    const halfThick = thickness / 2;

    // Top surface vertices
    for (let iy = 0; iy <= segsY; iy++) {
      const v = iy / segsY;
      const y2d = v * totalHeight;
      for (let ix = 0; ix <= segsX; ix++) {
        const u = ix / segsX;
        const x2d = u * totalWidth;
        const pt = deformPoint(x2d, y2d, halfThick);

        vertices.push(pt.x, pt.y, pt.z);
        normals.push(pt.norm[0], pt.norm[1], pt.norm[2]);
        uvs.push(u, 1 - v);
      }
    }

    const rowStride = segsX + 1;
    // Top surface faces
    for (let iy = 0; iy < segsY; iy++) {
      for (let ix = 0; ix < segsX; ix++) {
        const a = iy * rowStride + ix;
        const b = (iy + 1) * rowStride + ix;
        const c = (iy + 1) * rowStride + (ix + 1);
        const d = iy * rowStride + (ix + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Bottom surface vertices (with inverted thickness offset)
    const bottomOffsetIdx = vertices.length / 3;
    for (let iy = 0; iy <= segsY; iy++) {
      const v = iy / segsY;
      const y2d = v * totalHeight;
      for (let ix = 0; ix <= segsX; ix++) {
        const u = ix / segsX;
        const x2d = u * totalWidth;
        const pt = deformPoint(x2d, y2d, -halfThick);

        vertices.push(pt.x, pt.y, pt.z);
        normals.push(-pt.norm[0], -pt.norm[1], -pt.norm[2]);
        uvs.push(u, 1 - v);
      }
    }

    // Bottom surface faces (reversed winding for correct normal)
    for (let iy = 0; iy < segsY; iy++) {
      for (let ix = 0; ix < segsX; ix++) {
        const a = bottomOffsetIdx + iy * rowStride + ix;
        const b = bottomOffsetIdx + (iy + 1) * rowStride + ix;
        const c = bottomOffsetIdx + (iy + 1) * rowStride + (ix + 1);
        const d = bottomOffsetIdx + iy * rowStride + (ix + 1);

        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Material setup
    let material: THREE.Material;
    if (materialTheme === 'acrylic') {
      material = new THREE.MeshPhysicalMaterial({
        map: surfaceTexture,
        roughness: 0.15,
        transmission: 0.85,
        thickness: params.materialThickness,
        ior: 1.49, // Acrylic PMMA index of refraction
        color: 0xddf0ff,
        side: THREE.DoubleSide,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        map: surfaceTexture,
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Center the hinge in view
    group.position.set(isHorizontal ? 0 : -totalWidth / 4, isHorizontal ? -totalHeight / 4 : 0, 0);

  }, [data, params, bendAngleDeg, materialTheme]);

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 3D Viewport Controls Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-xs text-slate-300 gap-2 z-10">
        <div className="flex items-center space-x-2">
          <Rotate3d className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">3D Flexible Bend Simulator</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            Interactive
          </span>
        </div>

        {/* Material Selection */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setMaterialTheme('birch')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              materialTheme === 'birch'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Birch Ply
          </button>
          <button
            onClick={() => setMaterialTheme('walnut')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              materialTheme === 'walnut'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Walnut
          </button>
          <button
            onClick={() => setMaterialTheme('acrylic')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              materialTheme === 'acrylic'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clear Acrylic
          </button>
          <button
            onClick={() => setMaterialTheme('blueprint')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              materialTheme === 'blueprint'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blueprint
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* Floating Bottom Bend Angle Slider & Playback Controller */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-xl z-20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isAnimating
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAnimating ? 'Pause' : 'Auto Flex'}</span>
            </button>
            <span className="text-slate-400">Drag to bend:</span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-slate-200 font-bold">
            <span className="text-emerald-400 text-sm">{Math.round(bendAngleDeg)}°</span>
            <span className="text-slate-500 font-normal">
              {bendAngleDeg <= 5
                ? '(Flat Sheet)'
                : bendAngleDeg >= 85 && bendAngleDeg <= 95
                ? '(90° Corner)'
                : bendAngleDeg >= 170
                ? '(180° Fold)'
                : '(Partial Curve)'}
            </span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-slate-500 font-mono">0°</span>
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={bendAngleDeg}
            onChange={(e) => {
              setIsAnimating(false);
              setBendAngleDeg(Number(e.target.value));
            }}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
          />
          <span className="text-[10px] text-slate-500 font-mono">180°</span>
        </div>

        {/* Quick Angle Presets */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="text-slate-500 text-[10px]">Quick Presets:</span>
          <div className="flex space-x-2">
            {[
              { label: '0° Flat', val: 0 },
              { label: '45°', val: 45 },
              { label: '90° Box', val: 90 },
              { label: '135°', val: 135 },
              { label: '180° Book', val: 180 },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => {
                  setIsAnimating(false);
                  setBendAngleDeg(preset.val);
                }}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  Math.round(bendAngleDeg) === preset.val
                    ? 'bg-slate-700 text-white font-medium'
                    : 'hover:text-slate-200 text-slate-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orbit Tip overlay */}
      <div className="absolute top-12 left-3 bg-slate-900/70 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800/50 pointer-events-none">
        Left Click: Orbit | Right Click: Pan | Scroll: Zoom
      </div>
    </div>
  );
};
