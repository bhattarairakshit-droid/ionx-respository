import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Atom, Zap, Radiation, HeartPulse } from "lucide-react";

const panels = [
  {
    id: "bragg",
    icon: Atom,
    title: "What is a Bragg Peak?",
    content: `When charged particles like protons or carbon ions travel through matter, they slow down and deposit more energy as they decelerate. Near the end of their path, the energy loss spikes dramatically — this is the Bragg peak. Unlike X-rays which deposit dose exponentially along their entire path, ions deliver a concentrated burst of energy at a precise depth, then stop almost completely. This property makes ion beams ideal for targeting tumors while sparing surrounding healthy tissue.`,
  },
  {
    id: "fragmentation",
    icon: Radiation,
    title: "Nuclear Fragmentation",
    content: `Heavy ions like carbon-12 can undergo nuclear reactions with atoms in the target material. When a carbon nucleus collides with a target nucleus, it can break apart into lighter fragments — boron, beryllium, lithium, helium, and hydrogen nuclei. These fragments are lighter and faster, so they travel beyond the Bragg peak, creating a "fragmentation tail." This tail delivers a small but non-zero dose beyond the intended treatment depth, which clinicians must account for in treatment planning. Protons, being the lightest ions, produce negligible fragmentation.`,
  },
  {
    id: "delta",
    icon: Zap,
    title: "Delta Electrons (δ-electrons)",
    content: `As heavy ions pass through matter, they interact with orbital electrons of target atoms. Occasionally, an electron is knocked out with enough energy to travel a significant distance from the primary beam path — these are called delta electrons. They create a lateral "halo" of dose around the beam. The energy and range of delta electrons depend on the primary ion's charge and velocity. In the simulation, they appear as scattered dots around the central beam path. While their individual dose contribution is small, understanding their distribution is important for precise dose calculations.`,
  },
  {
    id: "clinical",
    icon: HeartPulse,
    title: "Clinical Relevance",
    content: `Ion beam therapy (also called hadron therapy) is one of the most precise forms of radiation therapy available today. The sharp Bragg peak allows oncologists to deliver high doses directly to a tumor while minimizing damage to surrounding organs — especially critical for tumors near the brain, spine, or heart. Carbon ions offer additional advantages: their higher biological effectiveness means they can kill radiation-resistant tumor cells more effectively than protons. However, the fragmentation tail and lateral scattering must be carefully modeled. Modern treatment planning systems use Monte Carlo simulations to predict dose distributions with millimeter precision.`,
  },
];

export default function EducationPanels() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Physics & Clinical Background</h3>
      <Accordion type="multiple" className="space-y-1">
        {panels.map((p) => (
          <AccordionItem key={p.id} value={p.id} className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <p.icon className="h-4 w-4 text-primary" />
                {p.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {p.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
