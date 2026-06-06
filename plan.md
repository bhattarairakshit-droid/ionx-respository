
# Macro-Scale Beam Therapy Simulator — Web App

## Overview
An interactive web-based particle beam therapy simulator that lets anyone explore how different ion beams (Carbon-12, Proton, Alpha) interact with matter. Clean modern dark dashboard with educational context, fully interactive charts, and smooth controls.

## Page Layout

### 1. Header & Introduction
- App title: "Beam Therapy Simulator"
- Subtitle with brief one-liner explaining what the simulator does
- Clean dark theme with modern styling (dark navy/slate background, subtle accent colors per ion type)

### 2. Control Panel (Top Section)
- **Ion Type** dropdown: Carbon-12, Proton, Alpha — each with its own accent color (cyan, orange, green)
- **Beam Energy** slider: 10–3000 MeV with numeric readout
- **Phantom Density** slider: 0.1–10.0 g/cm³
- **Air Gap / SSD** slider: 0–1000 cm
- **Zoom Region** selector: Full View, Air Gap, Entrance, Bragg Peak, Fragmentation Tail, δ-Electron Detail
- All sliders update charts in real-time using Recharts

### 3. Laboratory View (Top Chart)
- Wide panoramic visualization showing beam path through air and phantom
- Central ray line, 1σ and 2σ beam envelopes
- Scattered δ-electron dots
- Bragg peak position marker
- Phantom region shaded with density info

### 4. Charts Row (Two Side-by-Side)
- **Bragg Curve**: Total dose and δ-electron dose vs depth, with peak annotation
- **Fragmentation Tail**: Individual fragment curves (B-11, Be-10, Li-7, He-4, H-1) with color coding, sum line — or "negligible fragmentation" note for protons

### 5. Zoom Panel (Bottom Chart)
- Detailed view of selected region with all dose components overlaid (total, primary, fragment, δ-electron)
- Click-to-inspect: hovering/clicking on chart points shows exact dose values and depth
- Phantom surface and Bragg peak markers when in view

### 6. Educational Info Panels
- Expandable accordion sections below or beside charts:
  - **What is a Bragg Peak?** — Why ions stop at a specific depth
  - **Nuclear Fragmentation** — Why heavy ions produce lighter fragments beyond the peak
  - **Delta Electrons** — Secondary electron scattering explained
  - **Clinical Relevance** — Why this matters for cancer treatment
- Written in plain language for general public

## Physics Engine
- Port the Python simulation logic to TypeScript
- Same ion catalogue (Carbon-12, Alpha, Proton) with mass, charge, scatter factors, and fragment lists
- Bethe-Bloch inspired dose calculation, fragmentation buildup/decay, δ-electron sampling
- All computations run client-side in the browser (no backend needed)

## Accessibility & UX
- Keyboard-navigable controls
- Tooltips on every parameter explaining what it does
- Responsive layout that works on tablet and desktop
- Smooth transitions when parameters change
- Color-blind-friendly fragment curve palette with pattern differentiation
