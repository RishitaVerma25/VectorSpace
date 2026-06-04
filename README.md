# VectorSpace

[![Live Demo](https://img.shields.io/badge/Live-Demo-005F73?style=for-the-badge&logo=vercel)](https://vector-space-two.vercel.app)

---

##  Project Overview
**VectorSpace** is a high-fidelity, interactive vector workspace and developer layout framework built using React and Vite. Engineered to bridge the gap between abstract coordinate tracking systems and interactive frontend layouts, it provides engineers with an ultra-lightweight, customizable graphical engine to manage primitives, canvas states, and digital design tokens natively in the browser. 

Designed for both solo developers and large-scale engineering teams, VectorSpace acts as a single source of truth for your application's visual architecture—seamlessly blending state-driven design logic with highly optimized rendering workflows.

---

##  Tech Stack & Languages

* **Core Languages:** JavaScript (ES6+), HTML5, CSS3
* **Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (Utility-first styling)
* **Cloud Infrastructure:** Firebase (Authentication), Google Cloud Firestore (Real-time NoSQL)
* **Graphics & Vectors:** Lucide React, Native SVG APIs

---

##  Core Engine Architecture & Engineering Optimizations

* **Magic Vector Tracing Algorithm:** A bespoke client-side processing utility that dynamically traces and extrapolates raster images (PNG/JPG) into infinitely scalable vector graphics (SVG). This operation occurs entirely inside the browser without requiring external server compute, preserving strict data privacy and bypassing latency bottlenecks.
* **Persistent Google Cloud Synchronization:** Deeply integrated with Firebase Authentication and Firestore real-time databases. The application intelligently merges local browser storage states with cloud-hosted workspaces, ensuring zero data loss during offline sessions while providing a seamless roaming experience across devices.
* **Pure Drag-and-Drop Ingestion:** Features a tailored visual drop-zone that communicates directly with the web browser's file stream object (File API). By abandoning standard browser-OS file directory picker calls, the application bypasses native indexing delays and location timeouts, executing asset ingestion in under 10ms.
* **Infinite Spatial Canvas Topology:** Designed on a smooth mathematical coordinate system that allows developers to plot canvas properties, preview CSS token variables, and generate live UI layouts without blocking the central JavaScript thread or bottlenecking rendering frames.
* **Interactive Operational Documentation:** Includes an expansive contextual Onboarding and Help Guide Drawer directly inside the dashboard workspace layout for zero-friction user onboarding.

---

##  Design Language Tokens

The workspace features a minimalist, dark-charcoal and clean-off-white industrial aesthetic centered around an aligned layout grid framework. This exact design system is entirely self-hosted within the app's own token registry.

* **Primary Contrast Accents:** Deep Premium Teal (`#005F73`) for primary actions, nodes, and selected state layouts.
* **Secondary UI Highlights:** Soft Muted Sage Green (`#94D2BD`) for visual guides and accessory actions.
* **Typography Archetype:** Headings in Slate Charcoal (`#1A252C`) and interface text in readable graphite gray (`#4A5560`).

---

##  Local Development Setup Instructions

Follow these standard terminal scripts to install and boot the project locally:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd vectorspace
   ```

2. **Load standard dependencies:**
   ```bash
   npm install
   ```

3. **Boot the framework:**
   ```bash
   npm run dev
   ```
   *The framework will now be served locally on `http://localhost:5173`.*

---

##  Licensing

Distributed under the protective, open-source **Apache License 2.0**. Full conditions can be reviewed inside the accompanying `LICENSE` text file.

<br>
<p align="center">
  <b>Copyright © 2026 Rishita Verma. All rights reserved.</b>
</p>
