import { useMemo } from "react";
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { SimulationResult } from "@/lib/beamPhysics";

interface Props { sim: SimulationResult; }

export default function BraggCurveChart({ sim }: Props) {
  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(sim.x.length / 500));
    const pts: any[] = [];
    for (let i = 0; i < sim.x.length; i += step) {
      pts.push({
        depth: +sim.x[i].toFixed(2),
        total: +sim.totalDose[i].toFixed(3),
        delta: +sim.deltaDose[i].toFixed(3),
      });
    }
    return pts;
  }, [sim]);

  const maxDose = Math.max(...sim.totalDose) * 1.15;
  const ionColor = sim.ion.color;

  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Bragg Curve</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,15%,18%)" />
          <XAxis dataKey="depth" type="number" domain={[0, sim.maxX]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Depth (cm)", position: "bottom", offset: -2, fill: "hsl(215,15%,55%)", fontSize: 10 }} />
          <YAxis domain={[0, maxDose]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Relative dose", angle: -90, position: "insideLeft", fill: "hsl(215,15%,55%)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "hsl(230,25%,12%)", border: "1px solid hsl(230,15%,22%)", borderRadius: 8, fontSize: 12 }}
            labelFormatter={(v) => `Depth: ${v} cm`}
            formatter={(v: number, name: string) => [v.toFixed(2), name === "total" ? "Total dose" : "δ-electron dose"]}
          />
          <Area dataKey="total" stroke={ionColor} fill={ionColor} fillOpacity={0.1} strokeWidth={2.5} dot={false} isAnimationActive={false} name="total" />
          <Line dataKey="delta" stroke="hsl(0, 80%, 65%)" strokeWidth={1.5} dot={false} isAnimationActive={false} name="delta" />
          {sim.totalRange < sim.maxX && (
            <ReferenceLine x={+sim.totalRange.toFixed(2)} stroke={ionColor} strokeDasharray="4 4" label={{ value: `${sim.totalRange.toFixed(1)} cm`, fill: ionColor, fontSize: 10 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
