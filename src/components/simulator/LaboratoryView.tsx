import { useMemo } from "react";
import {
  ComposedChart, Area, Line, Scatter, XAxis, YAxis,
  ReferenceLine, ResponsiveContainer, Tooltip,
} from "recharts";
import type { SimulationResult } from "@/lib/beamPhysics";

interface Props {
  sim: SimulationResult;
}

export default function LaboratoryView({ sim }: Props) {
  const data = useMemo(() => {
    // Downsample for lab view (every 4th point)
    const step = Math.max(1, Math.floor(sim.x.length / 500));
    const pts: any[] = [];
    for (let i = 0; i < sim.x.length; i += step) {
      pts.push({
        x: sim.x[i],
        spread1: sim.beamSpread[i],
        spread1neg: -sim.beamSpread[i],
        spread2: sim.beamSpread[i] * 2,
        spread2neg: -sim.beamSpread[i] * 2,
        center: 0,
      });
    }
    return pts;
  }, [sim]);

  const scatterData = useMemo(() =>
    sim.deltaElectrons.map((d) => ({
      x: d.x,
      y: d.y,
      size: Math.min(Math.max(d.energy * 2, 2), 12),
    })),
    [sim],
  );

  const ionColor = sim.ion.color;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Laboratory View</h3>
        <span className="text-xs text-muted-foreground font-mono">Width: {sim.maxX.toFixed(1)} cm</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id="phantomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(230, 10%, 35%)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(230, 10%, 35%)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" type="number" domain={[0, sim.maxX]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "hsl(230,15%,22%)" }} />
          <YAxis domain={[-sim.dynamicY, sim.dynamicY]} hide />

          {/* Phantom region */}
          <ReferenceLine x={sim.ssd} stroke="hsl(0,0%,45%)" strokeDasharray="4 4" label={{ value: "Phantom", position: "top", fill: "hsl(215,15%,55%)", fontSize: 10 }} />

          {/* 2σ envelope */}
          <Area dataKey="spread2" stroke="none" fill={ionColor} fillOpacity={0.06} isAnimationActive={false} />
          <Area dataKey="spread2neg" stroke="none" fill={ionColor} fillOpacity={0.06} isAnimationActive={false} />

          {/* 1σ envelope */}
          <Area dataKey="spread1" stroke="none" fill={ionColor} fillOpacity={0.18} isAnimationActive={false} />
          <Area dataKey="spread1neg" stroke="none" fill={ionColor} fillOpacity={0.18} isAnimationActive={false} />

          {/* Central ray */}
          <Line dataKey="center" stroke={ionColor} strokeWidth={1.5} strokeDasharray="6 3" dot={false} isAnimationActive={false} />

          {/* Delta electrons */}
          <Scatter data={scatterData} dataKey="y" fill="hsl(0, 80%, 65%)" fillOpacity={0.6} isAnimationActive={false} />

          {/* Bragg peak marker */}
          {sim.totalRange < sim.maxX && (
            <ReferenceLine x={sim.totalRange} stroke={ionColor} strokeDasharray="3 3" label={{ value: `Peak ${sim.totalRange.toFixed(1)}cm`, position: "top", fill: ionColor, fontSize: 10, fontWeight: 600 }} />
          )}

          <Tooltip content={() => null} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: ionColor }} /> Central ray</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm opacity-30" style={{ background: ionColor }} /> 1σ/2σ envelope</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-destructive opacity-60" /> δ-electrons</span>
        <span className="ml-auto font-mono">ρ = {sim.density.toFixed(1)} g/cm³</span>
      </div>
    </div>
  );
}
