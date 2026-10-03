/**
 * NEXUS-4 3D Structural Open-GL / WebGL Visualizer (Three.js)
 * Physical 3D visualization of the timber beam, concrete slab, shear fastener array, and stress gradients.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HbvParameters, HbvCalculationResult } from '../../types/nexus';
import { Eye, Layers, Box, RotateCw, ZoomIn, Info } from 'lucide-react';

interface Structural3DVisualizerProps {
  params: HbvParameters;
  result: HbvCalculationResult;
}

export const Structural3DVisualizer: React.FC<Structural3DVisualizerProps> = ({
  params,
  result
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [showConnectors, setShowConnectors] = useState(true);
  const [deflectionScale, setDeflectionScale] = useState(10); // visual exaggeration factor

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.35, y: -0.65 });

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.0, 7.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-8, -4, -6);
    scene.add(dirLight2);

    // Grid Floor
    const grid = new THREE.GridHelper(12, 24, 0x1e293b, 0x0f172a);
    grid.position.y = -1.2;
    scene.add(grid);

    // Group for the Structural Composite Beam
    const beamGroup = new THREE.Group();
    scene.add(beamGroup);

    // Geometry scaled to meters
    const L_m = params.spanL;
    const b1_m = params.b1 / 1000;
    const h1_m = params.h1 / 1000;
    const beff_m = params.beff / 1000;
    const h2_m = params.h2 / 1000;

    // 1. Timber Girder (Glulam/Solid C24 - Warm golden oak color)
    const timberGeo = new THREE.BoxGeometry(b1_m, h1_m, L_m, 1, 1, 32);
    const timberMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber timber
      roughness: 0.6,
      metalness: 0.1,
      wireframe
    });
    const timberMesh = new THREE.Mesh(timberGeo, timberMat);
    timberMesh.position.set(0, 0, 0);
    beamGroup.add(timberMesh);

    // 2. Concrete Slab Flange (Light stone grey concrete)
    const slabGeo = new THREE.BoxGeometry(beff_m, h2_m, L_m, 1, 1, 32);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Slate concrete
      roughness: 0.85,
      metalness: 0.05,
      wireframe,
      transparent: true,
      opacity: 0.92
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, (h1_m / 2) + (h2_m / 2), 0);
    beamGroup.add(slabMesh);

    // 3. Shear Connector Fasteners (Pairs of steel screws along span)
    if (showConnectors) {
      const pitchM = params.spacingS / 1000;
      const startZ = -L_m / 2 + pitchM;
      const endZ = L_m / 2 - pitchM;
      const screwGeo = new THREE.CylinderGeometry(0.012, 0.012, h2_m + 0.08, 12);
      const screwMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Red steel fasteners
        roughness: 0.3,
        metalness: 0.8
      });

      for (let z = startZ; z <= endZ; z += pitchM) {
        const screw1 = new THREE.Mesh(screwGeo, screwMat);
        screw1.position.set(-b1_m / 4, (h1_m / 2) + 0.02, z);
        beamGroup.add(screw1);

        const screw2 = new THREE.Mesh(screwGeo, screwMat);
        screw2.position.set(b1_m / 4, (h1_m / 2) + 0.02, z);
        beamGroup.add(screw2);
      }
    }

    // Apply Deflection Curvature deformation to beam group vertices
    const maxDeflectionM = (result.w_net_fin / 1000) * (deflectionScale / 10);
    const applyCurvature = (mesh: THREE.Mesh, baseY: number) => {
      const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        // Parabolic deflection profile: w(z) = -w_max * (1 - 4 * (z/L)^2)
        const normalizedZ = (2 * z) / L_m;
        const sag = -maxDeflectionM * (1 - normalizedZ * normalizedZ);
        pos.setY(i, pos.getY(i) + sag);
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    };

    applyCurvature(timberMesh, 0);
    applyCurvature(slabMesh, (h1_m / 2) + (h2_m / 2));

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate group based on drag
      beamGroup.rotation.x = rotRef.current.x;
      beamGroup.rotation.y = rotRef.current.y;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [params, result, wireframe, showConnectors, deflectionScale]);

  // Drag mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    rotRef.current.y += deltaX * 0.008;
    rotRef.current.x = Math.max(-0.6, Math.min(0.8, rotRef.current.x + deltaY * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-[380px] bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden select-none">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Viewport HUD Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
        <span className="font-bold text-sky-400">OPENGL // 3D STRUCTURAL VISUALIZER</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300">HBV {params.b1}x{params.h1} + {params.beff}x{params.h2}mm</span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`px-2 py-0.5 rounded transition ${wireframe ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
        >
          {wireframe ? 'WIREFRAME' : 'SOLID'}
        </button>
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          className={`px-2 py-0.5 rounded transition ${showConnectors ? 'bg-rose-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
        >
          FASTENERS
        </button>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-1 border-l border-slate-800">
          <span>Defl:</span>
          <select
            value={deflectionScale}
            onChange={e => setDeflectionScale(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded text-slate-200"
          >
            <option value="1">1x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
            <option value="25">25x</option>
          </select>
        </div>
      </div>

      {/* Physical Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] font-mono bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-400" /> Concrete C30/37</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Timber Girder C24</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Kser Shear Fasteners</span>
      </div>

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
        Drag to Orbit • Sag wnet,fin = {result.w_net_fin.toFixed(1)}mm
      </div>
    </div>
  );
};
