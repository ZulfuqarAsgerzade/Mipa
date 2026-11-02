// MIPA — injection mold scene, rendered offline into scroll-scrubbed frame sequences.
// Axis convention: the mold opens along X. Fixed half sits at -X, moving half at +X,
// parting line at x = 0. Y is up, Z faces the default camera side.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const C = {
  bg: 0x0a0f1a,
  steel: 0x9aa1a8,
  polished: 0xc9cdd1,
  oxide: 0x34393f,
  brass: 0xc8a15a,
  blue: 0x3d6bff,
  cyan: 0x22d3ee,
};

const params = new URLSearchParams(location.search);
const W = +params.get("w") || 1920;
const H = +params.get("h") || 1080;
const portrait = H > W;

// transparent ground: the page's own gradients show through behind the mold
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.75;

const camera = new THREE.PerspectiveCamera(portrait ? 46 : 32, W / H, 0.1, 100);

// ---------- lights ----------
const key = new THREE.SpotLight(0xfff4e6, 260, 30, Math.PI / 6, 0.6, 1.6);
key.position.set(-4, 7, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
key.shadow.radius = 6;
scene.add(key, key.target);

// neutral studio rig: cool white rim for silhouette, faint warm kicker from below
const rim = new THREE.SpotLight(0xdfe7f2, 300, 30, Math.PI / 5, 0.8, 1.4);
rim.position.set(5, 3, -6);
scene.add(rim, rim.target);

const rim2 = new THREE.SpotLight(0xffc9a0, 70, 30, Math.PI / 5, 0.8, 1.4);
rim2.position.set(-6, -2, -4);
scene.add(rim2);

const fill = new THREE.DirectionalLight(0xe4e8ee, 0.4);
fill.position.set(2, -3, 5);
scene.add(fill);

// ---------- procedural textures ----------
function brushedTexture(seed = 1, vertical = false) {
  const s = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d");
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, 0, s, s);
  let r = seed * 9301;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 2600; i++) {
    const v = 90 + rand() * 90;
    g.strokeStyle = `rgba(${v},${v},${v},${0.08 + rand() * 0.18})`;
    g.lineWidth = 0.5 + rand() * 1.2;
    const p = rand() * s;
    const len = 60 + rand() * 300;
    const o = rand() * s;
    g.beginPath();
    if (vertical) { g.moveTo(p, o); g.lineTo(p, o + len); }
    else { g.moveTo(o, p); g.lineTo(o + len, p); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function nameplateTexture() {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 384;
  const g = cv.getContext("2d");
  g.fillStyle = "#b9bec4";
  g.fillRect(0, 0, 1024, 384);
  g.strokeStyle = "#5d636a";
  g.lineWidth = 10;
  g.strokeRect(14, 14, 996, 356);
  g.fillStyle = "#2b3036";
  g.font = "800 128px Arial Black, Arial, sans-serif";
  g.fillText("MIPA", 60, 170);
  g.font = "600 46px Arial, sans-serif";
  g.fillText("MOLD No. M-2604   STEEL 1.2738", 60, 255);
  g.fillText("4 CAV   2026   AZ", 60, 320);
  for (const [x, y] of [[960, 60], [960, 324]]) {
    g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- materials ----------
const M = {
  steel: new THREE.MeshPhysicalMaterial({ color: C.steel, metalness: 1, roughness: 0.34, roughnessMap: brushedTexture(3) }),
  steelV: new THREE.MeshPhysicalMaterial({ color: C.steel, metalness: 1, roughness: 0.36, roughnessMap: brushedTexture(7, true) }),
  polished: new THREE.MeshPhysicalMaterial({ color: C.polished, metalness: 1, roughness: 0.08 }),
  oxide: new THREE.MeshPhysicalMaterial({ color: C.oxide, metalness: 0.85, roughness: 0.48, roughnessMap: brushedTexture(11) }),
  dark: new THREE.MeshStandardMaterial({ color: 0x0d0f12, metalness: 0.6, roughness: 0.5 }),
  brass: new THREE.MeshPhysicalMaterial({ color: C.brass, metalness: 1, roughness: 0.25 }),
  pin: new THREE.MeshPhysicalMaterial({ color: 0xd6dade, metalness: 1, roughness: 0.15 }),
  // graphite textured ABS, as on real interior trim
  part: new THREE.MeshPhysicalMaterial({ color: 0x2b2e33, metalness: 0, roughness: 0.52, clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: 0x8a9099, sheenRoughness: 0.5 }),
  plate: new THREE.MeshPhysicalMaterial({ map: nameplateTexture(), metalness: 0.7, roughness: 0.4 }),
};

function shade(o) {
  o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return o;
}

// plate along X: thickness t, height h, depth d, centered at x
function plate(x0, x1, h, d, mat, r = 0.025) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(x1 - x0, h, d, 3, r), mat);
  m.position.x = (x0 + x1) / 2;
  return m;
}

function cyl(r, len, mat, seg = 40) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.rotation.z = Math.PI / 2; // align with X
  return m;
}

// socket cap screw head seen on a face pointing along dir (+1/-1 on X)
function capScrew(dir) {
  const g = new THREE.Group();
  const head = cyl(0.045, 0.05, M.oxide);
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.052, 6), M.dark);
  hex.rotation.z = Math.PI / 2;
  hex.position.x = dir * 0.002;
  g.add(head, hex);
  return g;
}

function screwPattern(group, x, dir, h, d) {
  for (const y of [-h / 2 + 0.16, h / 2 - 0.16])
    for (const z of [-d / 2 + 0.16, -d / 6, d / 6, d / 2 - 0.16]) {
      const s = capScrew(dir);
      s.position.set(x + dir * 0.025, y, z);
      group.add(s);
    }
}

// cooling water fitting on a side face (+Z)
function fitting() {
  const g = new THREE.Group();
  const hexNut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6), M.brass);
  hexNut.rotation.x = Math.PI / 2;
  const nipple = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 24), M.brass);
  nipple.rotation.x = Math.PI / 2;
  nipple.position.z = 0.08;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 24), M.brass);
  ring.position.z = 0.12;
  g.add(hexNut, nipple, ring);
  return g;
}

// ---------- the molded part: automotive air-vent bezel ----------
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function makePart() {
  const g = new THREE.Group();
  const outer = roundedRectShape(1.3, 0.72, 0.16);
  const hole = roundedRectShape(1.06, 0.48, 0.08);
  outer.holes.push(hole);
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outer, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 4, curveSegments: 24 }),
    M.part
  );
  frame.position.z = -0.06;
  g.add(frame);
  // louvers
  for (let i = 0; i < 5; i++) {
    const l = new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.02, 0.13, 2, 0.008), M.part);
    l.position.y = -0.2 + i * 0.1;
    l.rotation.x = -0.35;
    g.add(l);
  }
  // vertical adjuster vane
  const vane = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.46, 0.06, 2, 0.01), M.part);
  vane.position.set(0.18, 0, 0.05);
  const knob = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.06, 0.08, 2, 0.02), M.part);
  knob.position.set(0.18, 0, 0.1);
  g.add(vane, knob);
  // part lies in YZ plane, face normal -> -X (toward fixed half)
  const holder = new THREE.Group();
  g.rotation.y = -Math.PI / 2;
  holder.add(g);
  return shade(holder);
}

// ---------- assembly ----------
const H_PL = 2.2;   // plate height (Y)
const D_PL = 2.2;   // plate depth (Z)
const D_CL = 2.85;  // clamp plate depth (wider, with clamp slots)

const root = new THREE.Group(); // lets the portrait anatomy stand the stack on end
scene.add(root);
const fixedHalf = new THREE.Group();
const movingHalf = new THREE.Group();
const ejector = new THREE.Group();
root.add(fixedHalf, movingHalf);
movingHalf.add(ejector);

const parts = {}; // named components (for exploded view + label anchors)

// Fixed half
parts.topClamp = plate(-1.6, -1.32, H_PL, D_CL, M.oxide);
parts.aPlate = plate(-1.32, 0, H_PL, D_PL, M.steel);
fixedHalf.add(parts.topClamp, parts.aPlate);
screwPattern(parts.topClamp, -0.14, -1, H_PL, D_CL); // local coords relative to plate center
// locating ring + sprue bushing on the back face
parts.locRing = new THREE.Group();
const ring = cyl(0.36, 0.08, M.steelV, 64);
const ringInner = cyl(0.2, 0.085, M.polished, 64);
const sprue = cyl(0.1, 0.1, M.polished, 48);
sprue.position.x = -0.04;
const sprueHole = cyl(0.035, 0.12, M.dark, 24);
sprueHole.position.x = -0.06;
parts.locRing.add(ring, ringInner, sprue, sprueHole);
parts.locRing.position.x = -1.64;
fixedHalf.add(parts.locRing);
// cavity face detail: polished insert with recess silhouette
const cavityInsert = plate(-0.02, 0.001, 1.15, 1.75, M.polished, 0.01);
const cavityRecess = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(1.36, 0.78, 0.17), 24), M.dark);
cavityRecess.rotation.y = Math.PI / 2;
cavityRecess.position.x = 0.0025;
fixedHalf.add(cavityInsert, cavityRecess);
// guide bushings on A plate face
for (const [y, z] of [[0.86, 0.86], [-0.86, 0.86], [0.86, -0.86], [-0.86, -0.86]]) {
  const b = cyl(0.11, 0.01, M.polished, 40);
  b.position.set(0.004, y, z);
  const bh = cyl(0.075, 0.012, M.dark, 32);
  bh.position.set(0.006, y, z);
  fixedHalf.add(b, bh);
}
// lifting eye bolt on top of A plate
parts.eyeBolt = new THREE.Group();
const eye = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 16, 48), M.oxide);
const eyeShank = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 24), M.oxide);
eyeShank.position.y = -0.17;
const eyeCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 32), M.oxide);
eyeCollar.position.y = -0.12;
eye.rotation.y = Math.PI / 2;
parts.eyeBolt.add(eye, eyeShank, eyeCollar);
parts.eyeBolt.position.set(-0.66, H_PL / 2 + 0.25, 0);
fixedHalf.add(parts.eyeBolt);
// cooling fittings + nameplate on +Z side of A plate
for (const [x, y] of [[-1.0, 0.55], [-1.0, -0.55], [-0.35, 0.55], [-0.35, -0.55]]) {
  const f = fitting();
  f.position.set(x, y, D_PL / 2);
  fixedHalf.add(f);
}
const np = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), M.plate);
np.position.set(-0.66, 0, D_PL / 2 + 0.003);
fixedHalf.add(np);

// Moving half
parts.bPlate = plate(0, 1.0, H_PL, D_PL, M.steel);
parts.support = plate(1.0, 1.3, H_PL, D_PL, M.steelV);
parts.railTop = plate(1.3, 2.2, 0.42, D_PL, M.oxide);
parts.railTop.position.y = H_PL / 2 - 0.21;
parts.railBot = plate(1.3, 2.2, 0.42, D_PL, M.oxide);
parts.railBot.position.y = -H_PL / 2 + 0.21;
parts.bottomClamp = plate(2.2, 2.48, H_PL, D_CL, M.oxide);
movingHalf.add(parts.bPlate, parts.support, parts.railTop, parts.railBot, parts.bottomClamp);
screwPattern(parts.bottomClamp, 0.14, 1, H_PL, D_CL);
// core insert + core (raised, fits the part's opening)
const coreInsert = plate(-0.001, 0.02, 1.15, 1.75, M.polished, 0.01);
coreInsert.position.x = -0.009;
parts.core = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.46, 1.04, 4, 0.06), M.polished);
parts.core.position.x = -0.06;
movingHalf.add(coreInsert, parts.core);
// guide pillars (protrude from B plate into A plate when closed)
for (const [y, z] of [[0.86, 0.86], [-0.86, 0.86], [0.86, -0.86], [-0.86, -0.86]]) {
  const p = cyl(0.07, 0.9, M.pin, 48);
  p.position.set(-0.45, y, z);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.pin);
  tip.rotation.z = Math.PI / 2;
  tip.position.set(-0.9, y, z);
  movingHalf.add(p, tip);
}
for (const [x, y] of [[0.35, 0.55], [0.35, -0.55]]) {
  const f = fitting();
  f.position.set(x, y, D_PL / 2);
  movingHalf.add(f);
}
// ejector system: plates between rails + pins reaching the core face
parts.ejPlate = plate(1.62, 1.86, 1.25, D_PL - 0.3, M.steelV);
parts.ejRetainer = plate(1.42, 1.62, 1.25, D_PL - 0.3, M.steel);
ejector.add(parts.ejPlate, parts.ejRetainer);
parts.pins = [];
for (const [y, z] of [[0.27, 0.45], [-0.27, 0.45], [0.27, -0.45], [-0.27, -0.45], [0, 0]]) {
  const pin = cyl(0.028, 1.62 + 0.04, M.pin, 24);
  pin.position.set(1.62 / 2 - 0.04, y, z);
  ejector.add(pin);
  parts.pins.push(pin);
}
// return pins (visible in exploded view)
for (const [y, z] of [[0.45, 0.85], [-0.45, -0.85]]) {
  const rp = cyl(0.045, 1.42, M.pin, 24);
  rp.position.set(0.71, y, z);
  ejector.add(rp);
}

const part = makePart();
part.position.x = -0.07;
root.add(part);

shade(fixedHalf);
shade(movingHalf);

// ---------- helpers ----------
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// camera path: keyframes [p, position, target]; interpolated with Catmull-Rom on both
function cameraRig(keys) {
  const pos = new THREE.CatmullRomCurve3(keys.map((k) => k[1]), false, "centripetal");
  const tgt = new THREE.CatmullRomCurve3(keys.map((k) => k[2]), false, "centripetal");
  const ps = keys.map((k) => k[0]);
  return (p) => {
    let i = 0;
    while (i < ps.length - 2 && p > ps[i + 1]) i++;
    const local = clamp01((p - ps[i]) / (ps[i + 1] - ps[i]));
    const eased = local * local * (3 - 2 * local);
    const u = (i + eased) / (ps.length - 1);
    return { pos: pos.getPoint(u), tgt: tgt.getPoint(u) };
  };
}

const dist = portrait ? 1.55 : 1;
const scaleFrom = (target, posV) => target.clone().add(posV.clone().sub(target).multiplyScalar(dist));

// ---------- sequence: OPEN (hero) ----------
const heroRig = cameraRig([
  [0.0, V(-4.6, 2.3, 6.4), portrait ? V(0.3, -1.5, 0) : V(-0.95, -0.3, 0)],
  [0.3, V(-2.4, 1.4, 5.6), V(0.7, 0, 0)],
  [0.55, V(-0.7, 0.7, 4.4), V(1.3, 0, 0)],
  [0.8, V(0.3, 0.5, 5.4), V(1.0, 0.05, 1.0)],
  [1.0, V(1.2, 0.45, 5.9), portrait ? V(0.95, -0.9, 1.7) : V(0.95, -0.42, 1.7)],
]);

function poseOpen(p) {
  const open = smooth(0.1, 0.44, p) * 1.9;
  const eject = smooth(0.46, 0.6, p) * 0.36;
  const present = smooth(0.6, 0.92, p);

  movingHalf.position.x = open;
  ejector.position.x = -eject;

  const ejectedX = open - 0.07 - eject;
  part.position.set(
    lerp(ejectedX, 0.95, present),
    lerp(0, 0.05, present),
    lerp(0, 1.75, present)
  );
  part.rotation.set(lerp(0, -0.12, present), lerp(0, Math.PI / 2 - 0.25, present), lerp(0, 0.04, present));
  part.scale.setScalar(lerp(1, 1.05, present));

  key.target.position.set(0.5, 0, 0);
  rim.target.position.copy(part.position);

  const { pos, tgt } = heroRig(p);
  camera.position.copy(scaleFrom(tgt, pos));
  camera.lookAt(tgt);
}

// ---------- sequence: ANATOMY (exploded view) ----------
// components fly apart along X; camera orbits slowly around the stack
const explodeOffsets = {
  topClamp: -1.6, locRing: -1.95, aPlate: -0.75, eyeBolt: -0.75,
  bPlate: 0.4, support: 0.9, railTop: 1.4, railBot: 1.4, ejector: 1.15, bottomClamp: 2.2,
};
const baseX = {};
for (const k of Object.keys(parts)) if (parts[k].position) baseX[k] = parts[k].position.x;
const fixedChildren = [...fixedHalf.children];
const extraLift = { railTop: 0.35, railBot: -0.35 };
const baseY = { railTop: parts.railTop.position.y, railBot: parts.railBot.position.y };

const anatomyRigPortrait = cameraRig([
  [0.0, V(3.6, 1.2, 12.5), V(0, 0.1, 0)],
  [0.5, V(-0.6, 2.0, 14.0), V(0, 0.1, 0)],
  [1.0, V(-3.8, 1.6, 13.0), V(0, 0.1, 0)],
]);

const anatomyRig = cameraRig([
  [0.0, V(-3.6, 2.4, 8.6), V(0.4, 0.75, 0)],
  [0.5, V(0.4, 3.0, 12.2), V(0.6, 0.8, 0)],
  [1.0, V(4.2, 2.4, 11.2), V(0.8, 0.7, 0)],
]);

function poseAnatomy(p) {
  const e = smooth(0.08, 0.7, p);
  movingHalf.position.x = 0;
  ejector.position.x = 0;
  part.position.set(-0.07, 0, 0);
  part.rotation.set(0, 0, 0);
  part.scale.setScalar(1);
  // fixed half: split top clamp + loc ring from A plate
  fixedHalf.position.x = 0;
  for (const c of fixedChildren) c.position.x = c.userData.bx ?? (c.userData.bx = c.position.x);
  parts.topClamp.position.x = baseX.topClamp + explodeOffsets.topClamp * e;
  parts.locRing.position.x = baseX.locRing + explodeOffsets.locRing * e;
  // A-plate-mounted details travel with the A plate
  for (const c of fixedChildren) {
    if (c === parts.topClamp || c === parts.locRing) continue;
    c.position.x = c.userData.bx + explodeOffsets.aPlate * e;
  }
  part.position.x = -0.07 + -0.35 * e;
  // moving side
  for (const c of movingHalf.children) {
    if (c === ejector) continue;
    if (c.userData.bx === undefined) c.userData.bx = c.position.x;
    let off = explodeOffsets.bPlate;
    if (c === parts.support) off = explodeOffsets.support;
    if (c === parts.railTop || c === parts.railBot) off = explodeOffsets.railTop;
    if (c === parts.bottomClamp) off = explodeOffsets.bottomClamp;
    c.position.x = c.userData.bx + off * e;
  }
  parts.railTop.position.y = baseY.railTop + extraLift.railTop * e;
  parts.railBot.position.y = baseY.railBot + extraLift.railBot * e;
  ejector.position.x = explodeOffsets.ejector * e;

  key.target.position.set(0.4, 0, 0);
  rim.target.position.set(0.4, 0, 0);
  if (portrait) {
    root.rotation.z = -Math.PI / 2; // fixed half up, moving half down
    const { pos, tgt } = anatomyRigPortrait(p);
    camera.position.copy(pos);
    camera.lookAt(tgt);
    return;
  }
  const { pos, tgt } = anatomyRig(p);
  camera.position.copy(scaleFrom(tgt, pos));
  camera.lookAt(tgt);
}

// ---------- label anchors (projected to normalized screen coords per frame) ----------
const anchors = {
  open: {
    parting: () => V(movingHalf.position.x / 2, H_PL / 2, D_PL / 2),
    pins: () => V(movingHalf.position.x + ejector.position.x - 0.02, 0.27, 0.45),
    part: () => part.localToWorld(V(0, 0.36, 0)),
    cooling: () => V(-0.35, 0.55, D_PL / 2 + 0.12),
  },
  anatomy: {
    topClamp: () => parts.topClamp.localToWorld(V(0, -H_PL / 2, D_CL / 2)),
    aPlate: () => parts.aPlate.localToWorld(V(0, H_PL / 2, D_PL / 2)),
    part: () => part.localToWorld(V(0, 0.36, 0)),
    bPlate: () => parts.bPlate.localToWorld(V(0, H_PL / 2, D_PL / 2)),
    support: () => parts.support.localToWorld(V(0, -H_PL / 2, D_PL / 2)),
    ejector: () => parts.ejPlate.localToWorld(V(0, 0.62, (D_PL - 0.3) / 2)),
    bottomClamp: () => parts.bottomClamp.localToWorld(V(0, -H_PL / 2, D_CL / 2)),
  },
  turntable: {},
};

function project(v) {
  const s = v.clone().project(camera);
  return [+((s.x + 1) / 2).toFixed(4), +((1 - s.y) / 2).toFixed(4)];
}

// ---------- sequence: TURNTABLE (the part alone, one full revolution) ----------
function poseTurntable(p) {
  fixedHalf.visible = movingHalf.visible = false;
  root.rotation.z = 0;
  part.position.set(0, 0, 0);
  part.rotation.set(-0.32, Math.PI / 2 + p * Math.PI * 2, 0);
  part.scale.setScalar(1);
  key.target.position.set(0, 0, 0);
  rim.target.position.set(0, 0, 0);
  camera.fov = 26;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0.25, 3.4);
  camera.lookAt(0, 0, 0);
}

const poses = { open: poseOpen, anatomy: poseAnatomy, turntable: poseTurntable };

window.renderFrame = (seq, p) => {
  poses[seq](p);
  scene.updateMatrixWorld(true);
  renderer.render(scene, camera);
  const labels = {};
  for (const [k, fn] of Object.entries(anchors[seq])) labels[k] = project(fn());
  return { labels };
};

window.grab = (quality) => renderer.domElement.toDataURL("image/webp", quality);
window.sceneReady = true;
