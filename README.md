# KerfBend — Living Hinge Laser Cut Designer

Parametric living hinge generator and CAD tool for laser cutting. Customize cut length, bridge gap, and line spacing across multiple cut patterns with real-time 2D/3D bend simulation, Cut-to-Bridge ratio inspection, SVG, and DXF export.

---

## 🚀 Live on GitHub Pages

This project is pre-configured for **GitHub Pages** using automated GitHub Actions.

### How to Enable GitHub Pages in your Repository:

1. Push this repository to your GitHub account (branch `main` or `master`).
2. On GitHub, go to your repository **Settings** tab.
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment > Source**, select:
   👉 **GitHub Actions**
5. That's it! GitHub will automatically run the `.github/workflows/deploy.yml` workflow and publish your site at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle for static hosting
npm run build

# Preview production build locally
npm run preview
```

---

## ✨ Features

- **Parametric Sliders**: Real-time control of cut length, bridge size, and line spacing with millimetre or inch units.
- **Orientation Toggle**: Switch between **Vertical Cuts ↕** (bends left/right) and **Horizontal Cuts ↔** (bends up/down).
- **6 Cut Pattern Types**:
  - Straight Alternating (Standard 50% staggered brick cuts)
  - Tri-Step Stagger (3-phase offset for smooth gradient flex)
  - Sine Wave (Harmonic undulating slits)
  - Cross T-Stop (Stress-relief tabs preventing crack propagation in acrylic)
  - Honeycomb Lattice (Diamond mesh expansion)
  - Fishbone Chevron (Angled diagonal slits for cylinder wrapping)
- **Cut-to-Bridge Ratio Visualizer**:
  - Live calculation showing cut vs bridge percentage (e.g., `90:10` or `95:5`).
  - Visual sweet spot gauge showing the optimal flexibility bracket.
  - One-click `Snap to 90:10` and `Snap to 95:5` buttons.
- **Dual 2D & 3D Interactive Previews**:
  - **2D CAD View**: Pan, zoom, CAD measurement grid, 90° view rotation, laser kerf burn simulation.
  - **3D Bend Simulator**: Real-time 3D bending sheet (powered by Three.js) with procedural wood and acrylic materials, auto-flex loop, and interactive angle drag (0° to 180°).
- **Direct Laser Cutting Vector Export**:
  - **SVG**: Standard W3C vector format for LightBurn, Glowforge, Cricut, Inkscape, Illustrator.
  - **DXF**: Universal AutoCAD R12 ASCII DXF format for Fusion 360, RDWorks, SolidWorks, QCAD, CNC mills.
- **Built-in Engineering Tools**:
  - Bend Arc Length Calculator for 90° box corners and 180° wraps.
  - Material presets for 3mm Birch Plywood, 4mm Plywood, 6mm Plywood, 3mm Cast Acrylic, MDF, Veneer, and Cardstock.
  - Living Hinge Laser Cutting Rules Guide.
