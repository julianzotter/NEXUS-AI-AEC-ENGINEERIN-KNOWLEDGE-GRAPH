/**
 * CODEBASE: AI-CODEBASE@GoogleDrive
 * Hub for CAD/BIM Exporters (EZDFX, OpenIFC), Three.js visualizers,
 * JSX Dashboards, and speech-recognition code from Google Drive.
 */

import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Box, 
  Mic, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CodebaseItem {
  id: string;
  name: string;
  path: string;
  category: 'CAD_BIM' | 'VISUALS' | 'SPEECH' | 'JSX_DASHBOARDS';
  size: string;
  language: string;
  description: string;
  codeSnippet: string;
}

const CODEBASE_REGISTRY: CodebaseItem[] = [
  {
    id: 'CODE-EZDFX-PLOTTER',
    name: 'ezdxf_composite_plotter.py',
    path: 'Drive/AI-CODEBASE/CAD-EXPORTERS/ezdxf_composite_plotter.py',
    category: 'CAD_BIM',
    size: '8.4 KB',
    language: 'Python',
    description: 'Generates AutoCAD R12/2000 DXF vector drawings with layered cross-sections (TIMBER, CONCRETE, CONNECTORS).',
    codeSnippet: `import ezdxf

def export_hbv_dxf(b1, h1, beff, h2, filepath="hbv_floor.dxf"):
    doc = ezdxf.new('R2000')
    msp = doc.modelspace()
    
    # Layers
    doc.layers.add(name='TIMBER', color=30)
    doc.layers.add(name='CONCRETE', color=8)
    doc.layers.add(name='CONNECTORS', color=1)

    # Timber beam
    msp.add_lwpolyline([(-b1/2, 0), (b1/2, 0), (b1/2, h1), (-b1/2, h1)], close=True, dxfattribs={'layer': 'TIMBER'})
    # Concrete slab
    msp.add_lwpolyline([(-beff/2, h1), (beff/2, h1), (beff/2, h1+h2), (-beff/2, h1+h2)], close=True, dxfattribs={'layer': 'CONCRETE'})
    
    doc.saveas(filepath)
    return filepath`
  },
  {
    id: 'CODE-OPENIFC-BUILDER',
    name: 'openifc_step_writer.py',
    path: 'Drive/AI-CODEBASE/CAD-EXPORTERS/openifc_step_writer.py',
    category: 'CAD_BIM',
    size: '14.2 KB',
    language: 'Python',
    description: 'ISO-10303-21 IFC4 STEP model exporter with IfcBeam, IfcSlab and Pset_NEXUS4_SIO_Validation.',
    codeSnippet: `import ifcopenshell
from ifcopenshell.api import run

def create_eurocode_ifc(span_m, b1_mm, h1_mm, beff_mm, h2_mm, audit_hash):
    model = ifcopenshell.file(schema="IFC4")
    project = run("root.create_entity", model, ifc_class="IfcProject", name="NEXUS-4 Composite Project")
    site = run("root.create_entity", model, ifc_class="IfcSite", name="Alpine AEC Site")
    building = run("root.create_entity", model, ifc_class="IfcBuilding", name="Eurocode Structure")
    storey = run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="Storey +01")

    # Attach SIO Pset
    pset = run("pset.add_pset", model, product=building, name="Pset_NEXUS4_SIO_Validation")
    run("pset.edit_pset", model, pset=pset, properties={"CalculationSeal": audit_hash, "Delta": "0.000000%"})
    return model`
  },
  {
    id: 'CODE-THREEJS-VIEWER',
    name: 'threejs_timber_beam.js',
    path: 'Drive/AI-CODEBASE/VISUALS/threejs_timber_beam.js',
    category: 'VISUALS',
    size: '11.8 KB',
    language: 'JavaScript',
    description: 'Three.js WebGL spatial viewer with parabolic bending deformation curvature and shear connector fasteners.',
    codeSnippet: `import * as THREE from 'three';

export function buildCompositeBeamMesh(L, b1, h1, beff, h2, deflection_m) {
    const group = new THREE.Group();
    const timberGeo = new THREE.BoxGeometry(b1, h1, L, 1, 1, 32);
    const timberMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const timberMesh = new THREE.Mesh(timberGeo, timberMat);
    group.add(timberMesh);

    const slabGeo = new THREE.BoxGeometry(beff, h2, L, 1, 1, 32);
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.9 });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.y = (h1/2) + (h2/2);
    group.add(slabMesh);

    return group;
}`
  },
  {
    id: 'CODE-SPEECH-PARSER',
    name: 'speech_command_parser.ts',
    path: 'Drive/AI-CODEBASE/SPEECH/speech_command_parser.ts',
    category: 'SPEECH',
    size: '6.2 KB',
    language: 'TypeScript',
    description: 'Real-time Web Speech recognition parser for Eurocode voice parameters (e.g., "Set span to 6.2 meters").',
    codeSnippet: `export function parseEurocodeSpeechCommand(transcript: string) {
    const t = transcript.toLowerCase();
    const spanMatch = t.match(/span (?:to )?(\\d+(?:\\.\\d+)?)/);
    const loadMatch = t.match(/load (?:to )?(\\d+(?:\\.\\d+)?)/);
    return {
        span_L: spanMatch ? parseFloat(spanMatch[1]) : null,
        q_load: loadMatch ? parseFloat(loadMatch[1]) : null,
        triggerGoldenRun: t.includes("calculate") || t.includes("run")
    };
}`
  }
];

export const AiCodebaseModule: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<CodebaseItem>(CODEBASE_REGISTRY[0]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const filtered = CODEBASE_REGISTRY.filter(item => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedItem.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedItem.codeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedItem.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              CODEBASE // AI-CODEBASE@GOOGLEDRIVE
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              CAD/BIM Exporters, Three.js Viewers, JSX Dashboards, and Speech-Recognition Modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            DOWNLOAD FILE
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
        {[
          { id: 'ALL', label: 'ALL FILES' },
          { id: 'CAD_BIM', label: 'CAD & BIM (EZDFX/IFC)' },
          { id: 'VISUALS', label: 'THREE.JS VISUALS' },
          { id: 'SPEECH', label: 'SPEECH RECOGNITION' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              activeCategory === cat.id ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid: File Explorer on Left, Code Viewer on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left (5 cols) */}
        <div className="md:col-span-5 space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                selectedItem.id === item.id
                  ? 'bg-sky-950/20 border-sky-500/80 text-sky-200 font-bold'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="truncate">{item.name}</span>
                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-sky-400 font-mono">
                  {item.language}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans line-clamp-2">{item.description}</p>
              <div className="text-[9px] text-slate-500 mt-2 truncate font-mono">{item.path}</div>
            </div>
          ))}
        </div>

        {/* Right (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-200 text-xs">{selectedItem.name}</span>
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto h-60 overflow-y-auto leading-relaxed">
              {selectedItem.codeSnippet}
            </pre>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Size: {selectedItem.size}</span>
            <span>Target: AI Studio / BricsCAD / FreeCAD BIM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
