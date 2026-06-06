import { useState, useMemo } from "react";
import { Atom } from "lucide-react";
import { runSimulation, type IonType, type ZoomRegion } from "@/lib/beamPhysics";
import ControlPanel from "@/components/simulator/ControlPanel";
import LaboratoryView from "@/components/simulator/LaboratoryView";
import BraggCurveChart from "@/components/simulator/BraggCurveChart";
import FragmentationChart from "@/components/simulator/FragmentationChart";
import ZoomPanel from "@/components/simulator/ZoomPanel";
import EducationPanels from "@/components/simulator/EducationPanels";

export default function Index() {
  const [ionType, setIonType] = useState<IonType>("Carbon-12");
  const [energy, setEnergy] = useState(180);
  const [density, setDensity] = useState(1.0);
  const [ssd, setSsd] = useState(5);
  const [zoomRegion, setZoomRegion] = useState<ZoomRegion>("Full View");

  const sim = useMemo(
    () => runSimulation(ionType, energy, density, ssd),
    [ionType, energy, density, ssd],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Atom className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Beam Therapy Simulator</h1>
            <p className="text-xs text-muted-foreground">Explore how ion beams interact with matter — energies up to 3 GeV, depths up to 100+ meters</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-5 space-y-5">
        <ControlPanel
          ionType={ionType} energy={energy} density={density} ssd={ssd} zoomRegion={zoomRegion}
          onIonTypeChange={setIonType} onEnergyChange={setEnergy} onDensityChange={setDensity}
          onSsdChange={setSsd} onZoomRegionChange={setZoomRegion}
        />
        <LaboratoryView sim={sim} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BraggCurveChart sim={sim} />
          <FragmentationChart sim={sim} />
        </div>
        <ZoomPanel sim={sim} zoomRegion={zoomRegion} />
        <EducationPanels />
      </main>
    </div>
  );
}
