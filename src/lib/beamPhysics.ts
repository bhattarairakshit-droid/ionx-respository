// Beam Therapy Physics Engine — ported from Python simulation

export type IonType = "Carbon-12" | "Proton" | "Alpha";

export interface Fragment {
  name: string;
  mass: number;
  charge: number;
  amplitude: number;
  lambda: number;
}

export interface IonConfig {
  mass: number;
  charge: number;
  color: string;
  scatterFactor: number;
  fragments: Fragment[];
  label: string;
}

export const ION_CATALOGUE: Record<IonType, IonConfig> = {
  "Carbon-12": {
    mass: 12, charge: 6, color: "hsl(180, 100%, 50%)",
    scatterFactor: 0.015, label: "Carbon-12 (C¹² ⁶⁺)",
    fragments: [
      { name: "B-11", mass: 11, charge: 5, amplitude: 0.070, lambda: 0.75 },
      { name: "Be-10", mass: 10, charge: 4, amplitude: 0.055, lambda: 0.55 },
      { name: "Li-7", mass: 7, charge: 3, amplitude: 0.045, lambda: 0.35 },
      { name: "He-4", mass: 4, charge: 2, amplitude: 0.035, lambda: 0.20 },
      { name: "H-1", mass: 1, charge: 1, amplitude: 0.025, lambda: 0.10 },
    ],
  },
  "Alpha": {
    mass: 4, charge: 2, color: "hsl(120, 100%, 50%)",
    scatterFactor: 0.08, label: "Alpha (He⁴ ²⁺)",
    fragments: [
      { name: "He-3", mass: 3, charge: 2, amplitude: 0.020, lambda: 0.45 },
      { name: "H-1", mass: 1, charge: 1, amplitude: 0.015, lambda: 0.15 },
    ],
  },
  "Proton": {
    mass: 1, charge: 1, color: "hsl(30, 100%, 50%)",
    scatterFactor: 0.25, label: "Proton (H⁺)",
    fragments: [],
  },
};

export interface SimulationResult {
  x: number[];
  totalDose: number[];
  primaryDose: number[];
  totalFrag: number[];
  fragCurves: Record<string, number[]>;
  deltaDose: number[];
  beamSpread: number[];
  totalRange: number;
  maxX: number;
  dynamicY: number;
  ssd: number;
  density: number;
  ion: IonConfig;
  deltaElectrons: { x: number; y: number; energy: number }[];
}

// Deterministic pseudo-random for reproducible scatter
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function gaussianRandom(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

export function runSimulation(
  ionType: IonType,
  energy: number,
  density: number,
  ssd: number,
): SimulationResult {
  const ion = ION_CATALOGUE[ionType];
  const { mass, charge, scatterFactor, fragments } = ion;

  // Energy after air traversal
  const dEdxAir = charge ** 2 * 0.005;
  const energyEnter = Math.max(0, energy - dEdxAir * ssd);

  // Range calculation
  const k = 0.0022;
  const theoreticalRange = (mass / charge ** 2) * energyEnter ** 1.75 * k;
  const penDepth = theoreticalRange / density;
  const totalRange = ssd + penDepth;

  const maxX = Math.max(10, totalRange * 1.15);
  const N = 2000; // enough for smooth charts
  const x: number[] = [];
  for (let i = 0; i < N; i++) x.push((i / (N - 1)) * maxX);

  const primaryDose = new Float64Array(N);
  const totalFrag = new Float64Array(N);
  const deltaDose = new Float64Array(N);
  const beamSpread = new Float64Array(N);
  const fragCurves: Record<string, Float64Array> = {};
  for (const f of fragments) fragCurves[f.name] = new Float64Array(N);

  const effDist = ssd * 0.5 + penDepth;
  const straggling = 0.15 + (0.005 / mass) * effDist ** 0.8;
  const muAbs = 0.003 + 0.0006 * mass;

  for (let i = 0; i < N; i++) {
    const pos = x[i];

    // Beam spread
    if (pos < ssd) {
      beamSpread[i] = scatterFactor * pos * 0.005;
    } else {
      const airSp = scatterFactor * ssd * 0.005;
      const pd = pos - ssd;
      beamSpread[i] = airSp + scatterFactor * pd ** 0.8 * density * 0.02;
    }

    if (pos < ssd) {
      let base = charge ** 2 * 0.3;
      if (ssd - pos < 2) base += (2 - (ssd - pos)) * charge ** 2 * 0.15;
      primaryDose[i] = base;
      deltaDose[i] = charge ** 2 * 0.015;
    } else if (pos <= totalRange) {
      const dr = totalRange - pos;
      const abso = Math.exp(-muAbs * (pos - ssd) * 0.05);
      primaryDose[i] = (charge ** 2 / (dr ** 0.5 + straggling)) * abso;

      const vFrac = (dr / Math.max(penDepth, 0.01)) ** 0.35;
      deltaDose[i] = charge ** 2 * 0.08 * vFrac * abso;

      const frac = (pos - ssd) / Math.max(penDepth, 0.01);
      for (const f of fragments) {
        const buildup = f.amplitude * charge ** 2 * frac ** 1.4 * (1 - Math.exp(-frac * 3.5));
        const eScale = (energyEnter / 150) ** 0.35;
        const val = buildup * eScale;
        fragCurves[f.name][i] = val;
        totalFrag[i] += val;
      }
    } else {
      const deltaBeyond = pos - totalRange;
      for (const f of fragments) {
        const rangeExt = (energyEnter * 0.12) / (f.mass * density + 0.5);
        const peakVal = f.amplitude * charge ** 2 * 1 * (1 - Math.exp(-3.5));
        const eScale = (energyEnter / 150) ** 0.35;
        const decay = Math.exp(-deltaBeyond * f.lambda * density * 0.5);
        const atten = 1 / (1 + deltaBeyond * 0.02 * density);
        const val = peakVal * eScale * decay * atten * (1 + rangeExt * 0.05);
        fragCurves[f.name][i] = val;
        totalFrag[i] += val;
      }
      deltaDose[i] = fragments.reduce(
        (sum, f) => sum + f.charge ** 2 * 0.008 * Math.exp(-deltaBeyond * f.lambda * density * 0.5),
        0,
      );
    }
  }

  // Normalisation
  const refDist = 5;
  const refS = 0.15 + (0.005 / mass) * refDist ** 0.8;
  const refA = Math.exp(-(0.003 + 0.0006 * mass) * refDist * 0.05);
  const refMax = charge ** 2 / refS * refA;
  const sf = 90 / refMax;

  const totalDose: number[] = [];
  const primaryOut: number[] = [];
  const totalFragOut: number[] = [];
  const deltaOut: number[] = [];
  const spreadOut: number[] = [];
  const fragOut: Record<string, number[]> = {};
  for (const f of fragments) fragOut[f.name] = [];

  for (let i = 0; i < N; i++) {
    primaryOut.push(primaryDose[i] * sf);
    totalFragOut.push(totalFrag[i] * sf);
    deltaOut.push(deltaDose[i] * sf);
    spreadOut.push(beamSpread[i]);
    totalDose.push((primaryDose[i] + totalFrag[i]) * sf);
    for (const f of fragments) fragOut[f.name].push(fragCurves[f.name][i] * sf);
  }

  // Delta-electron scatter positions
  const maxSpread = Math.max(...spreadOut, 1);
  const dynY = Math.max(6, maxSpread * 2.5);
  const nDel = Math.min(600, Math.floor(charge ** 2 * 10 * Math.max(1, totalRange / 20)));
  const rng = seededRandom(42);
  const deltaElectrons: { x: number; y: number; energy: number }[] = [];

  for (let j = 0; j < nDel; j++) {
    const p = rng() * Math.min(maxX, totalRange + 5);
    let sig: number, ef: number;
    if (p < ssd) { sig = 0.1; ef = 0.4; }
    else if (p < totalRange) {
      const fr = (p - ssd) / Math.max(penDepth, 0.01);
      sig = 0.1 + fr * 0.8;
      ef = Math.max(0.1, 1 - fr * 0.8);
    } else { sig = 1.2; ef = 0.08; }
    const dy = gaussianRandom(rng) * sig * (dynY / 6);
    const de = -Math.log(rng() + 1e-10) * (ef * charge + 0.01);
    deltaElectrons.push({ x: p, y: dy, energy: de });
  }

  return {
    x, totalDose, primaryDose: primaryOut, totalFrag: totalFragOut,
    fragCurves: fragOut, deltaDose: deltaOut, beamSpread: spreadOut,
    totalRange, maxX, dynamicY: dynY, ssd, density, ion, deltaElectrons,
  };
}

export type ZoomRegion = "Full View" | "Air Gap" | "Entrance" | "Bragg Peak" | "Fragmentation Tail" | "δ-Electron Detail";

export function getZoomBounds(
  region: ZoomRegion,
  ssd: number,
  totalRange: number,
  maxX: number,
): [number, number] {
  switch (region) {
    case "Air Gap": return [0, Math.max(ssd + 2, 5)];
    case "Entrance": return [Math.max(0, ssd - maxX * 0.02), ssd + maxX * 0.05];
    case "Bragg Peak": return [Math.max(0, totalRange - maxX * 0.05), totalRange + maxX * 0.02];
    case "Fragmentation Tail": return [Math.max(0, totalRange - maxX * 0.01), Math.min(totalRange + maxX * 0.2, maxX)];
    case "δ-Electron Detail": return [Math.max(0, ssd), Math.min(totalRange + maxX * 0.05, maxX)];
    default: return [0, maxX];
  }
}

export const FRAGMENT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#a855f7"];
