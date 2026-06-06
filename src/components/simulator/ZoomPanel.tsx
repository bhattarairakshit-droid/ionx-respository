import { useMemo } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getZoomBounds, type SimulationResult, type ZoomRegion } from "@/lib/beamPhysics";

interface Props { sim: SimulationResult; zoomRegion: ZoomRegion; }

export default function ZoomPanel({ sim, zoomRegion }: Props) {
  const [zs, ze] = getZoomBounds(zoomRegion, sim.ssd, sim.totalRange, sim.maxX);

  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(sim.x.length / 600));
    const pts: any[] = [];
    for (let i = 0; i < sim.x.length; i += step) {
      if (sim.x[i] < zs || sim.x[i] > ze) continue;
      pts.push({
        depth: +sim.x[i].toFixed(2),
        total: +sim.totalDose[i].toFixed(3),
        primary: +sim.primaryDose[i].toFixed(3),
        fragment: +sim.totalFrag[i].toFixed(3),
        delta: +sim.deltaDose[i].toFixed(3),
      });
    }
    return pts;
  }, [sim, zs, ze]);

  const localMax = Math.max(...data.map((d) => d.total), 1) * 1.15;
  const ionColor = sim.ion.color;

  const showSsd = sim.ssd >= zs && sim.ssd <= ze;
  const showPeak = sim.totalRange >= zs && sim.totalRange <= ze;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Zoom: {zoomRegion}</h3>
        <span className="text-xs text-muted-foreground font-mono">{zs.toFixed(1)} – {ze.toFixed(1)} cm</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,15%,18%)" />
          <XAxis dataKey="depth" type="number" domain={[zs, ze]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Depth (cm)", position: "bottom", offset: -2, fill: "hsl(215,15%,55%)", fontSize: 10 }} />
          <YAxis domain={[0, localMax]} tick={{ fill: "hsl(215,15%,55%)", fontSize: 10 }} label={{ value: "Relative dose", angle: -90, position: "insideLeft", fill: "hsl(215,15%,55%)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "hsl(230,25%,12%)", border: "1px solid hsl(230,15%,22%)", borderRadius: 8, fontSize: 12 }}
            labelFormatter={(v) => `Depth: ${v} cm`}
            formatter={(v: number, name: string) => {
              const labels: Record<string, string> = { total: "Total dose", primary: "Primary dose", fragment: "Fragment dose", delta: "δ-electron dose" };
              return [v.toFixed(3), labels[name] || name];
            }}
          />
          <Area dataKey="total" stroke={ionColor} fill={ionColor} fillOpacity={0.08} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line dataKey="primary" stroke="hsl(0,0%,80%)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
          <Line dataKey="fragment" stroke="hsl(0, 80%, 55%)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="delta" stroke="hsl(0, 80%, 65%)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          {showSsd && <ReferenceLine x={sim.ssd} stroke="hsl(50, 100%, 60%)" strokeDasharray="4 4" label={{ value: "Surface", fill: "hsl(50,100%,60%)", fontSize: 10 }} />}
          {showPeak && <ReferenceLine x={+sim.totalRange.toFixed(2)} stroke={ionColor} strokeDasharray="4 4" label={{ value: "Bragg peak", fill: ionColor, fontSize: 10 }} />}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: ionColor }} /> Total</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded bg-foreground opacity-60" /> Primary</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: "hsl(0,80%,55%)" }} /> Fragment</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: "hsl(0,80%,65%)" }} /> δ-electron</span>
      </div>
    </div>
  );
}
