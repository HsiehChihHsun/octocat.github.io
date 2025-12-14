# Role: Senior WebGL & Graphics Physics Engineer

## Project Overview
Create a high-fidelity, real-time, interactive **Black Hole Simulation** (akin to *Interstellar*'s Gargantua) using **Three.js** and **GLSL (Custom Shaders)**.
The project will be deployed as a static site on **GitHub Pages**, utilizing client-side rendering (GPU).

---

## 1. Technical Architecture & Constraints
* **Framework**: Three.js (Use CDN links, e.g., unpkg or cdnjs).
* **Rendering approach**: Full-screen Quad with a Fragment Shader (Ray Marching). No external 3D geometry models (.obj/.gltf) are needed.
* **Deployment**: Static HTML/JS/CSS. No complex build tools (Webpack/Vite). The structure should be simple enough to run via a local server or GitHub Pages immediately.
* **Performance Goal**: Target 60 FPS on standard dedicated GPUs (e.g., RTX 3060/4060) and optimized fallback for mobile devices.

---

## 2. Physics & Mathematics Specifications (The Shader)
The core logic must be implemented in the GLSL Fragment Shader.

### A. Ray Marching Setup
* **Camera**: Virtual camera handling ray direction based on UV coordinates and mouse interaction (OrbitControls).
* **Loop**: Implement a Ray Marching loop (Standard step limit: ~100-150).

### B. Gravitational Lensing (Light Bending)
* **Logic**: Approximate General Relativity using a Newtonian approach for visual performance.
* **Implementation**:
    * In each step of the march, calculate distance $r$ from the Black Hole center.
    * Apply a force to the Ray Direction vector $\vec{D}$:
        $$\vec{F} \propto \frac{1}{r^2}$$
    * Update ray position: $\vec{P}_{new} = \vec{P} + \vec{D} \times \Delta t$
    * (Optional) Variable step size: Decrease step size as the ray gets closer to the Event Horizon for precision.

### C. The Accretion Disk (Visuals & SDF)
* **Shape**: Define the disk using a Signed Distance Function (SDF) or a slab check:
    $$R_{min} < length(\vec{P}.xz) < R_{max} \quad \text{AND} \quad |P.y| < Height$$
* **Texture/Flow**: Use 3D Noise (Simplex or FBM) animated by `iTime` to create a cloud-like, swirling plasma texture.

### D. Doppler Beaming (Redshift/Blueshift) - **CRITICAL REQUIREMENT**
* **Physics**: Light emitted from the disk moving *towards* the observer appears brighter and bluer; light moving *away* appears dimmer and redder.
* **Calculation**:
    1.  Calculate the disk's rotational velocity vector $\vec{V}$ at the intersection point.
    2.  Calculate the Dot Product with the Ray Direction: $Factor = dot(\vec{V}, \vec{D})$.
    3.  **Mapping**:
        * If $Factor > 0$ (Approaching): Increase intensity, shift color towards White/Blue.
        * If $Factor < 0$ (Receding): Decrease intensity significantly, shift color towards Deep Red/Orange.
* **Visual Result**: The "left" side of the hole (assuming counter-clockwise spin) should be blindingly bright/white, while the "right" side should be a dim, deep red.

### E. Event Horizon
* If the ray distance $r$ falls below the Schwarzschild radius, return pure Black (0.0, 0.0, 0.0).

---

## 3. Visual Style & Post-Processing
* **Color Palette**:
    * Disk: 2000K - 4000K Blackbody radiation (Oranges, Golds, Whites).
    * Background: Procedural Starfield (simple noise or points) that also gets distorted by the gravitational lensing logic.
* **Post-Processing**:
    * Use `Three.js EffectComposer` and `UnrealBloomPass`.
    * The accretion disk must glow intensely.

---

## 4. Deliverables
Please provide the following file structure:

1.  **`index.html`**:
    * Main container.
    * Import Three.js and EffectComposer via ES Modules (CDN).
2.  **`style.css`**: Simple reset for full-screen canvas.
3.  **`main.js`**:
    * Scene setup.
    * ShaderMaterial definition (Uniforms: `iTime`, `iResolution`, `cameraPosition`, etc.).
    * **Embed the Vertex and Fragment shaders as Template Strings** within the JS file (to avoid CORS issues when testing locally without a server).
4.  **`README.md` (Optional)**: Brief instructions on which parameters to tweak (e.g., `bendStrength`, `diskSpeed`).

**Code Quality**: Add detailed comments explaining the Physics Math in the GLSL section so I can tweak the formulas later.


### 其他程式要求

請在程式註解時使用繁體中文。