import { useMemo } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { FRAGMENT_COLORS, type SimulationResult } from "@/lib/beamPhysics";

interface Props { sim: SimulationResult; }

export default function FragmentationChart({ sim }: Props) {
  const fragNames = Object.keys(sim.fragCurves);
  const hasFrag = fragNames.length > 0;

  const zS = Math.max(0, sim.totalRange - sim.maxX * 0.05);
  const zE = Math.min(sim.totalRange + sim.maxX * 0.25, sim.maxX);

  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(sim.x.length / 500));
    const pts: any[] = [];
    for (let i = 0; i < sim.x.length; i += step) {
      if (sim.x[i] < zS || sim.x[i] > zE) continue;
      const pt: any = { depth: +sim.x[i].toFixed(2), sum: +sim.totalFrag[i].toFixed(3) };
      for (const fn of fragNames) pt[fn] = +sim.fragCurves[fn][i].toFixed(3);
      pts.push(pt);
    }
    return pts;
  }, [sim, zS, zE, fragNames]);

  const maxFrag = hasFrag ? Math.max(...data.map((d) => d.sum), 1) * 1.2 : 5;

  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Fragmentation Tail</h3>
      {hasFrag ? (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,15%,18%)" />
            <XAxis dataKey="depth" type="number" domain={[zS, zE]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Depth (cm)", position: "bottom", offset: -2, fill: "hsl(215,15%,55%)", fontSize: 10 }} />
            <YAxis domain={[0, maxFrag]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Fragment dose", angle: -90, position: "insideLeft", fill: "hsl(215,15%,55%)", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "hsl(230,25%,12%)", border: "1px solid hsl(230,15%,22%)", borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `Depth: ${v} cm`}
              formatter={(v: number, name: string) => [v.toFixed(3), name === "sum" ? "Σ fragments" : name]}
            />
            {fragNames.map((fn, i) => (
              <Area key={fn} dataKey={fn} stroke={FRAGMENT_COLORS[i % FRAGMENT_COLORS.length]} fill={FRAGMENT_COLORS[i % FRAGMENT_COLORS.length]} fillOpacity={0.06} strokeWidth={1.8} dot={false} isAnimationActive={false} />
            ))}
            <Line dataKey="sum" stroke="hsl(0,0%,90%)" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} name="sum" />
            <ReferenceLine x={+sim.totalRange.toFixed(2)} stroke="hsl(0,0%,60%)" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-muted-foreground italic text-sm">Protons: negligible nuclear fragmentation.</p>
        </div>
      )}
      {hasFrag && (
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          {fragNames.map((fn, i) => (
            <span key={fn} className="flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded-sm" style={{ background: FRAGMENT_COLORS[i % FRAGMENT_COLORS.length] }} />
              {fn}
            </span>
          ))}
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded bg-foreground" /> Σ fragments</span>
        </div>
      )}
    </div>
  );
}
