/**
 * NEXUS-4 3D-Orbit Control Plane
 * Embedded Three.js (r128+) interactive spatial system.
 * Renders 12 nodes across concentric governance & operational orbits.
 * Features run-pulse along interface contracts, hover tooltips, and node dossier selection.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitNode } from '../../types/nexus';

interface OrbitControlPlaneProps {
  nodes: OrbitNode[];
  selectedNodeId: string | null;
  onSelectNode: (node: OrbitNode) => void;
  isRunning: boolean;
  activeGate: string | null;
}

export const OrbitControlPlane: React.FC<OrbitControlPlaneProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  isRunning,
  activeGate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<OrbitNode | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(28);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const pulseParticlesRef = useRef<THREE.Points | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 28, theta: Math.PI / 4, phi: Math.PI / 3 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a0f, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x38bdf8, 2, 60);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const dirLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight.position.set(15, 25, 20);
    scene.add(dirLight);

    // 4. Central NEXUS Singularity Core
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Inner glowing sphere
    const innerCoreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    scene.add(innerCore);

    // 5. Orbital Grid Rings (3 Rings for Governance, Agents, Kernels)
    const ringRadii = [6.5, 11.5, 16.5];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.03, r + 0.03, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x0284c7 : (idx === 1 ? 0x8b5cf6 : 0x10b981),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // 6. Background Star Dust Field
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 80;
      starCoords[i + 1] = (Math.random() - 0.5) * 80;
      starCoords[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.18,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 7. Node Meshes & Interface Edges
    const meshesMap = new Map<string, THREE.Mesh>();

    nodes.forEach(node => {
      // Outer sphere
      const nodeGeo = new THREE.SphereGeometry(node.category === 'GOVERNANCE' ? 0.95 : 0.75, 24, 24);
      const colorHex = parseInt(node.color.replace('#', '0x'), 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.6
      });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(...node.position);
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);
      meshesMap.set(node.id, mesh);

      // Node Halo ring
      const haloGeo = new THREE.TorusGeometry(node.category === 'GOVERNANCE' ? 1.25 : 1.0, 0.03, 12, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.5
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      mesh.add(halo);
    });

    nodeMeshesRef.current = meshesMap;

    // Draw Interface Contract Edges between connected nodes
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.4
    });

    const activeEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    nodes.forEach(src => {
      src.contracts.forEach(targetId => {
        const dest = nodes.find(n => n.id === targetId);
        if (dest) {
          const points = [
            new THREE.Vector3(...src.position),
            new THREE.Vector3(...dest.position)
          ];
          const edgeGeo = new THREE.BufferGeometry().setFromPoints(points);
          const isGovernanceChain = 
            (src.layer === 'DAA' && dest.layer === 'ASO') ||
            (src.layer === 'ASO' && dest.layer === 'AEGS') ||
            (src.layer === 'AEGS' && dest.layer === 'SIO');
          const line = new THREE.Line(edgeGeo, isGovernanceChain ? activeEdgeMaterial : edgeMaterial);
          scene.add(line);
        }
      });
    });

    // 8. Run-Pulse Particle System (particles traveling along active contracts)
    const pulseCount = 120;
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePositions = new Float32Array(pulseCount * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    scene.add(pulsePoints);
    pulseParticlesRef.current = pulsePoints;

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate central core
      coreMesh.rotation.y = elapsed * 0.2;
      coreMesh.rotation.x = elapsed * 0.1;
      innerCore.rotation.y = -elapsed * 0.3;

      // Auto-rotate orbit camera if enabled and not interacting
      if (autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += 0.0025;
        updateCameraPosition();
      }

      // Pulse particles movement along gate chain (DAA -> ASO -> AEGS -> SIO)
      if (pulseParticlesRef.current) {
        const posAttr = pulseParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const gateChainNodes = ['node-daa', 'node-aso', 'node-aegs', 'node-sio'];
        
        for (let i = 0; i < pulseCount; i++) {
          const t = (elapsed * 0.8 + (i / pulseCount)) % 3; // 3 segments
          const segIdx = Math.floor(t);
          const segFraction = t - segIdx;

          const srcId = gateChainNodes[segIdx];
          const dstId = gateChainNodes[segIdx + 1];
          const srcNode = nodes.find(n => n.id === srcId);
          const dstNode = nodes.find(n => n.id === dstId);

          if (srcNode && dstNode) {
            const x = THREE.MathUtils.lerp(srcNode.position[0], dstNode.position[0], segFraction);
            const y = THREE.MathUtils.lerp(srcNode.position[1], dstNode.position[1], segFraction);
            const z = THREE.MathUtils.lerp(srcNode.position[2], dstNode.position[2], segFraction);
            posAttr.setXYZ(i, x, y, z);
          }
        }
        posAttr.needsUpdate = true;
      }

      // Highlight selected node
      meshesMap.forEach((mesh, id) => {
        if (id === selectedNodeId) {
          const s = 1.0 + Math.sin(elapsed * 4) * 0.12;
          mesh.scale.set(s, s, s);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
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
  }, [nodes]);

  // Helper to sync spherical coordinates to camera
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Mouse interaction for Orbit Controls & Node Raycasting
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
      updateCameraPosition();
      return;
    }

    // Raycast hover detection
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Array.from(nodeMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const nodeId = hit.userData.nodeId;
      const node = nodes.find(n => n.id === nodeId);
      setHoveredNode(node || null);
    } else {
      setHoveredNode(null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const meshes = Array.from(nodeMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const nodeId = hit.userData.nodeId;
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        onSelectNode(node);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.02;
    sphericalRef.current.radius = Math.max(12, Math.min(48, sphericalRef.current.radius + zoomDelta));
    setCameraDistance(Math.round(sphericalRef.current.radius));
    updateCameraPosition();
  };

  const resetView = () => {
    sphericalRef.current = { radius: 28, theta: Math.PI / 4, phi: Math.PI / 3 };
    setCameraDistance(28);
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Control HUD Overlay */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
        <span className="font-mono font-bold text-sky-400">3D-ORBIT // CONTROL PLANE</span>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-0.5 rounded transition ${autoRotate ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          {autoRotate ? 'AUTO-ORBIT: ON' : 'AUTO-ORBIT: OFF'}
        </button>
        <button
          onClick={resetView}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          RESET VIEW
        </button>
        <span className="text-slate-500 font-mono text-[10px]">R: {cameraDistance}m</span>
      </div>

      {/* Active Gate & Status Banner */}
      {isRunning && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>RUN PULSE ACTIVE // STAGE: {activeGate || 'DAA'}</span>
        </div>
      )}

      {/* Hover Node Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg max-w-sm shadow-xl z-20">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-mono font-bold text-sm text-slate-100">{hoveredNode.name}</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${hoveredNode.color}22`, color: hoveredNode.color }}
            >
              {hoveredNode.category}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 mb-2">{hoveredNode.description}</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
            <span>Runs: <b className="text-slate-200">{hoveredNode.runsCount}</b></span>
            <span>Drift: <b className={hoveredNode.driftLevel > 2 ? 'text-rose-400' : 'text-emerald-400'}>{hoveredNode.driftLevel.toFixed(2)}%</b></span>
            <span>Status: <b className="text-slate-200">{hoveredNode.status}</b></span>
          </div>
        </div>
      )}

      {/* Mini Legend / Guide */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[11px] font-mono bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Governance</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Agents</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Kernels</span>
      </div>
    </div>
  );
};
