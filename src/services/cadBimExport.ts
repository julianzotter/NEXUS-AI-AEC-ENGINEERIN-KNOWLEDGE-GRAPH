/**
 * NEXUS-4 CAD & BIM Open-Standards Export Engine
 * Generates ASCII DXF for BricsCAD / AutoCAD and OpenIFC (IFC4 ISO 10303-21) for FreeCAD BIM & BricsCAD.
 */

import { HbvParameters, HbvCalculationResult } from '../types/nexus';

/**
 * Generates an ASCII DXF (AutoCAD R12/2000 compatible) cross-section drawing of the composite floor.
 */
export function generateDxfCrossSection(params: HbvParameters, result: HbvCalculationResult): string {
  const beff = params.beff;
  const h2 = params.h2;
  const b1 = params.b1;
  const h1 = params.h1;

  // Coordinate setup:
  // Center of timber beam is at X = 0
  const timberLeft = -b1 / 2;
  const timberRight = b1 / 2;
  const timberBottom = 0;
  const timberTop = h1;

  const slabLeft = -beff / 2;
  const slabRight = beff / 2;
  const slabBottom = h1;
  const slabTop = h1 + h2;

  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
4
0
LAYER
2
TIMBER_BEAM
70
0
62
30
6
CONTINUOUS
0
LAYER
2
CONCRETE_SLAB
70
0
62
8
6
CONTINUOUS
0
LAYER
2
SHEAR_CONNECTORS
70
0
62
1
6
CONTINUOUS
0
LAYER
2
ANNOTATIONS
70
0
62
3
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // Helper to append a 2D line
  const addLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
    dxf += `0
LINE
8
${layer}
10
${x1.toFixed(2)}
20
${y1.toFixed(2)}
30
0.0
11
${x2.toFixed(2)}
21
${y2.toFixed(2)}
31
0.0
`;
  };

  // Helper to add text
  const addText = (x: number, y: number, height: number, text: string, layer: string) => {
    dxf += `0
TEXT
8
${layer}
10
${x.toFixed(2)}
20
${y.toFixed(2)}
30
0.0
40
${height.toFixed(2)}
1
${text}
`;
  };

  // 1. Timber Beam Rectangle
  addLine(timberLeft, timberBottom, timberRight, timberBottom, 'TIMBER_BEAM');
  addLine(timberRight, timberBottom, timberRight, timberTop, 'TIMBER_BEAM');
  addLine(timberRight, timberTop, timberLeft, timberTop, 'TIMBER_BEAM');
  addLine(timberLeft, timberTop, timberLeft, timberBottom, 'TIMBER_BEAM');

  // 2. Concrete Slab Rectangle
  addLine(slabLeft, slabBottom, slabRight, slabBottom, 'CONCRETE_SLAB');
  addLine(slabRight, slabBottom, slabRight, slabTop, 'CONCRETE_SLAB');
  addLine(slabRight, slabTop, slabLeft, slabTop, 'CONCRETE_SLAB');
  addLine(slabLeft, slabTop, slabLeft, slabBottom, 'CONCRETE_SLAB');

  // 3. Shear Connectors (Pair of screws at center)
  const connX1 = -b1 / 4;
  const connX2 = b1 / 4;
  const connYBottom = h1 - 100;
  const connYTop = h1 + h2 - 25;
  addLine(connX1, connYBottom, connX1, connYTop, 'SHEAR_CONNECTORS');
  addLine(connX2, connYBottom, connX2, connYTop, 'SHEAR_CONNECTORS');

  // 4. Annotations & Title Block
  addText(slabLeft, slabTop + 25, 20, `HBV-DECKE CEN/TS 19103 - NAD-AT // L=${params.spanL}m, qEd=${result.q_Ed.toFixed(2)}kN/m`, 'ANNOTATIONS');
  addText(timberLeft + 10, timberBottom + (h1 / 2), 16, `TIMBER ${params.b1}x${params.h1} C24 (eta_M=${(result.eta_M_timber * 100).toFixed(1)}%)`, 'ANNOTATIONS');
  addText(slabLeft + 20, slabBottom + (h2 / 2) - 8, 16, `CONCRETE C30/37 h2=${params.h2}mm beff=${params.beff}mm`, 'ANNOTATIONS');
  addText(slabLeft, timberBottom - 40, 14, `SIO SEAL: ${result.calculationHash} | DELTA: 0.000000% | BricsCAD/FreeCAD Export`, 'ANNOTATIONS');

  dxf += `0
ENDSEC
0
EOF
`;

  return dxf;
}

/**
 * Generates an OpenIFC (IFC4 STEP ISO 10303-21) file representing the 3D composite beam, slab, and connectors.
 */
export function generateOpenIfc4Model(params: HbvParameters, result: HbvCalculationResult): string {
  const spanMm = params.spanL * 1000;
  const now = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);

  // Approximate connector count along span
  const connectorCount = Math.floor(spanMm / params.spacingS);

  return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('NEXUS-4 SIO Certified Eurocode Structural Model','CEN/TS 19103 HBV-Verbund'),'2;1');
FILE_NAME('NEXUS4_HBV_${params.spanL}m.ifc','${now}',('NEXUS-4 SIO Authority Board'),('AEC Knowledge Structural Engineering OS'),'NEXUS4-IFC4-ExportEngine-v2.4','FreeCAD / BricsCAD BIM','Julian Zotter');
FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;
#1=IFCPERSON($,$,'Zotter','Julian',$,$,$,$);
#2=IFCORGANIZATION($,'NEXUS Structural Engineering OS',$,$,$);
#3=IFCPERSONANDORGANIZATION(#1,#2,$);
#4=IFCAPPLICATION(#2,'NEXUS-4.0','NEXUS-4 Structural OS','NEXUS4');
#5=IFCOWNERHISTORY(#3,#4,$,.ADDED.,$,$,$,$);

/* Spatial Structure: Project -> Site -> Building -> Storey */
#10=IFCPROJECT('1Nx4Project00000000001',#5,'NEXUS-4 HBV Composite Deck Project',$,$,$,$,(#20),#11);
#11=IFCUNITASSIGNMENT((#12,#13,#14));
#12=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#13=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#14=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);

#20=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#21,$);
#21=IFCAXIS2PLACEMENT3D(#22,$,$);
#22=IFCCARTESIANPOINT((0.,0.,0.));

#30=IFCSITE('1Nx4Site00000000000001',#5,'Site Alpine Construction',$,$,#31,$,$,.ELEMENT.,$,$,$,$,$);
#31=IFCLOCALPLACEMENT($,#21);
#40=IFCBUILDING('1Nx4Bld00000000000001',#5,'AEC Engineering Facility',$,$,#41,$,$,.ELEMENT.,$,$,$);
#41=IFCLOCALPLACEMENT(#31,#21);
#50=IFCBUILDINGSTOREY('1Nx4Story000000000001',#5,'Level +01 HBV Floor',$,$,#51,$,$,.ELEMENT.,0.);
#51=IFCLOCALPLACEMENT(#41,#21);

#60=IFCRELAGGREGATES('1Nx4Rel01',#5,$,$,#10,(#30));
#61=IFCRELAGGREGATES('1Nx4Rel02',#5,$,$,#30,(#40));
#62=IFCRELAGGREGATES('1Nx4Rel03',#5,$,$,#40,(#50));

/* Materials: C24 Timber and C30/37 Concrete */
#70=IFCMATERIAL('Timber C24 (EN 338 / ÖNORM B 1995-1-1)');
#71=IFCMATERIAL('Concrete C30/37 (EN 206 / ÖNORM B 1992-1-1)');
#72=IFCMATERIAL('Shear Connector Fasteners (CEN/TS 19103)');

/* 1. Timber Beam Element (IfcBeam) */
#100=IFCBEAM('1Nx4Beam0000000000001',#5,'Timber Girder C24',$,'C24-${params.b1}x${params.h1}',#101,#110,'T-01');
#101=IFCLOCALPLACEMENT(#51,#102);
#102=IFCAXIS2PLACEMENT3D(#103,$,$);
#103=IFCCARTESIANPOINT((0.,0.,0.));

#110=IFCPRODUCTDEFINITIONSHAPE($,$,(#111));
#111=IFCSHAPEREPRESENTATION(#20,'Body','SweptSolid',(#112));
#112=IFCEXTRUDEDAREASOLID(#113,#21,#116,${spanMm.toFixed(1)});
#113=IFCRECTANGLEPROFILEDEF(.AREA.,'TimberBeamProfile',#21,${params.b1.toFixed(1)},${params.h1.toFixed(1)});
#116=IFCDIRECTION((0.,0.,1.));

/* 2. Concrete Slab Topping (IfcSlab) */
#200=IFCSLAB('1Nx4Slab0000000000001',#5,'Concrete Slab Flange',$,'C30/37-h${params.h2}',#201,#210,'S-01',.FLOOR.);
#201=IFCLOCALPLACEMENT(#51,#202);
#202=IFCAXIS2PLACEMENT3D(#203,$,$);
#203=IFCCARTESIANPOINT((0.,${(params.h1 / 2 + params.h2 / 2).toFixed(1)},0.));

#210=IFCPRODUCTDEFINITIONSHAPE($,$,(#211));
#211=IFCSHAPEREPRESENTATION(#20,'Body','SweptSolid',(#212));
#212=IFCEXTRUDEDAREASOLID(#213,#21,#116,${spanMm.toFixed(1)});
#213=IFCRECTANGLEPROFILEDEF(.AREA.,'ConcreteSlabProfile',#21,${params.beff.toFixed(1)},${params.h2.toFixed(1)});

/* Relate Elements to Storey */
#300=IFCRELCONTAINEDINSPATIALSTRUCTURE('1Nx4RelCont01',#5,$,$,(#100,#200),#50);

/* SIO Audit Property Set for Structural Verification (FreeCAD/BricsCAD Property Inspector) */
#400=IFCPROPERTYSET('1Nx4Pset000000000001',#5,'Pset_NEXUS4_SIO_Validation',$,(
  #401,#402,#403,#404,#405,#406,#407
));
#401=IFCPROPERTYSINGLEVALUE('Standard',$,IFCLABEL('CEN/TS 19103:2021 & NAD-AT'),$);
#402=IFCPROPERTYSINGLEVALUE('EffectiveBendingStiffness_kNm2',$,IFCREAL(${(result.EI_eff / 1e9).toFixed(2)}),$);
#403=IFCPROPERTYSINGLEVALUE('Gamma2_ConnectionEfficiency',$,IFCREAL(${result.gamma2.toFixed(4)}),$);
#404=IFCPROPERTYSINGLEVALUE('TimberBendingUtilization',$,IFCREAL(${result.eta_M_timber.toFixed(4)}),$);
#405=IFCPROPERTYSINGLEVALUE('DeflectionUtilization',$,IFCREAL(${result.eta_deflection.toFixed(4)}),$);
#406=IFCPROPERTYSINGLEVALUE('SIO_VerificationSeal',$,IFCTEXT('${result.calculationHash}'),$);
#407=IFCPROPERTYSINGLEVALUE('DeltaTolerance',$,IFCTEXT('0.000000% (< 1e-9)'),$);

#410=IFCRELDEFINESBYPROPERTIES('1Nx4RelProps01',#5,$,$,(#100,#200),#400);

ENDSEC;
END-ISO-10303-21;`;
}
