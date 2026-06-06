import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { IonType, ZoomRegion } from "@/lib/beamPhysics";

interface ControlPanelProps {
  ionType: IonType;
  energy: number;
  density: number;
  ssd: number;
  zoomRegion: ZoomRegion;
  onIonTypeChange: (v: IonType) => void;
  onEnergyChange: (v: number) => void;
  onDensityChange: (v: number) => void;
  onSsdChange: (v: number) => void;
  onZoomRegionChange: (v: ZoomRegion) => void;
}

function ParamLabel({ label, tooltip, value }: { label: string; tooltip: string; value: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px]">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <span className="text-sm font-mono text-primary">{value}</span>
    </div>
  );
}

export default function ControlPanel(props: ControlPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* Ion Type */}
        <div>
          <ParamLabel label="Ion Type" tooltip="Choose the particle species for the beam simulation." value={props.ionType} />
          <Select value={props.ionType} onValueChange={(v) => props.onIonTypeChange(v as IonType)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Carbon-12">Carbon-12 (C¹² ⁶⁺)</SelectItem>
              <SelectItem value="Proton">Proton (H⁺)</SelectItem>
              <SelectItem value="Alpha">Alpha (He⁴ ²⁺)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Energy */}
        <div>
          <ParamLabel label="Beam Energy" tooltip="Kinetic energy of each ion in MeV. Higher energy = deeper penetration." value={`${props.energy} MeV`} />
          <Slider min={10} max={3000} step={10} value={[props.energy]} onValueChange={([v]) => props.onEnergyChange(v)} className="mt-1" />
        </div>

        {/* Density */}
        <div>
          <ParamLabel label="Phantom Density" tooltip="Density of the target material in g/cm³. Water = 1.0, bone ≈ 1.8, lung ≈ 0.3." value={`${props.density.toFixed(1)} g/cm³`} />
          <Slider min={0.1} max={10} step={0.1} value={[props.density]} onValueChange={([v]) => props.onDensityChange(v)} className="mt-1" />
        </div>

        {/* SSD */}
        <div>
          <ParamLabel label="Air Gap / SSD" tooltip="Distance from the beam source to the phantom surface in cm." value={`${props.ssd} cm`} />
          <Slider min={0} max={1000} step={5} value={[props.ssd]} onValueChange={([v]) => props.onSsdChange(v)} className="mt-1" />
        </div>

        {/* Zoom */}
        <div>
          <ParamLabel label="Zoom Region" tooltip="Select a region of interest to inspect in detail in the bottom chart." value={props.zoomRegion} />
          <Select value={props.zoomRegion} onValueChange={(v) => props.onZoomRegionChange(v as ZoomRegion)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full View">Full View</SelectItem>
              <SelectItem value="Air Gap">Air Gap (Pre-Phantom)</SelectItem>
              <SelectItem value="Entrance">Entrance Region</SelectItem>
              <SelectItem value="Bragg Peak">Bragg Peak Region</SelectItem>
              <SelectItem value="Fragmentation Tail">Fragmentation Tail</SelectItem>
              <SelectItem value="δ-Electron Detail">δ-Electron Detail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
