import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURATION & DATA ---
// Based on the user's table
// (+z is up, coordinates in meters)
const PENDULUMS_DATA = [
    // Order: 8 (Longest) down to 1 (Shortest) ?
    // The table lists from 8 down to 1.
    // Let's preserve the order in the array for iteration.
    { id: 8, cycles: 24, T: 1.250, L: 0.3877, pivot: new THREE.Vector3(-0.35, 0, 0), bobEq: new THREE.Vector3(-0.35, 0, 0.3877), bobInit: new THREE.Vector3(-0.35, 0.03, 0.0012) }, // z_init seems approx (L - something small)? No, 0.0012 is very small. Wait. 
    { id: 7, cycles: 25, T: 1.200, L: 0.3575, pivot: new THREE.Vector3(-0.30, 0, 0), bobEq: new THREE.Vector3(-0.30, 0, 0.3575), bobInit: new THREE.Vector3(-0.30, 0.03, 0.0013) },
    { id: 6, cycles: 26, T: 1.154, L: 0.3305, pivot: new THREE.Vector3(-0.25, 0, 0), bobEq: new THREE.Vector3(-0.25, 0, 0.3305), bobInit: new THREE.Vector3(-0.25, 0.03, 0.0014) },
    { id: 5, cycles: 27, T: 1.111, L: 0.3065, pivot: new THREE.Vector3(-0.20, 0, 0), bobEq: new THREE.Vector3(-0.20, 0, 0.3065), bobInit: new THREE.Vector3(-0.20, 0.03, 0.0015) },
    { id: 4, cycles: 28, T: 1.071, L: 0.2850, pivot: new THREE.Vector3(-0.15, 0, 0), bobEq: new THREE.Vector3(-0.15, 0, 0.2850), bobInit: new THREE.Vector3(-0.15, 0.03, 0.0016) },
    { id: 3, cycles: 29, T: 1.034, L: 0.2656, pivot: new THREE.Vector3(-0.10, 0, 0), bobEq: new THREE.Vector3(-0.10, 0, 0.2656), bobInit: new THREE.Vector3(-0.10, 0.03, 0.0017) },
    { id: 2, cycles: 30, T: 1.000, L: 0.2482, pivot: new THREE.Vector3(-0.05, 0, 0), bobEq: new THREE.Vector3(-0.05, 0, 0.2482), bobInit: new THREE.Vector3(-0.05, 0.03, 0.0018) },
    { id: 1, cycles: 31, T: 0.9677, L: 0.2325, pivot: new THREE.Vector3(0, 0, 0), bobEq: new THREE.Vector3(0, 0, 0.2325), bobInit: new THREE.Vector3(0, 0.03, 0.0019) }
];

// NOTE: Table "bobInit" (last column) z values (0.0012...) look suspicious if L is ~0.3.
// If Bob starts at y=0.03, the L is hypotenuse. 
// z = sqrt(L^2 - y^2).
// For id=8, L=0.3877, y=0.03.
// z = sqrt(0.3877^2 - 0.03^2) = sqrt(0.1503 - 0.0009) = sqrt(0.1494) = 0.3865.
// The table says z=0.0012. 
// This implies the table coordinates might be defining "Position relative to something" or maybe "Height from Desk"?
// Or maybe "0.0012" is the "Drop in height"? 
// 0.3877 - 0.3865 = 0.0012. 
// YES! 0.0012 matches the "sag".
// The coordinate provided in column "Bob Init (x,y,z)" seems to be the ACTUAL xyz.
// ( -0.35, 0.03, 0.0012 ) -> This is very close to Z=0.
// BUT Equilibrium is at Z=0.3877 (UP).
// So the start position is at the BOTTOM?
// Start: Z ~ 0. Equilibrium: Z ~ 0.38. Pivot: Z = 0.
// This is extremely confusing geometry from the text description alone.
//
// Interpreting "Pivot (-0.35, 0, 0)" and "Eq (-0.35, 0, 0.3877)".
// This defines a 0.3877m rod pointing UP along Z.
// "Initial Position (-0.35, 0.03, 0.0012)".
// This is near the Pivot (Z=0).
// If the bob is at Z~0, and Pivot is Z=0, distance is 0.03 (Y offset).
// This is NOT the full length 0.3877.
//
// Alternative Interpretation:
// Maybe "Pivot" is the suspension point.
// Maybe "Equilibrium" coordinates are where it hangs.
// ID 8: Pivot (-0.35, 0, 0). Eq (-0.35, 0, 0.3877). Distance 0.3877.
// Vector = (0, 0, 0.3877). Points UP.
//
// Maybe the user's coordinate system +z is DOWN?
// But text says "+z points UP".
//
// Let's look at the "Shortest" (ID 1).
// Cycles 31 (Fastest) -> Shortest Length.
// T = 0.9677. L = 0.2325.
// Physics: Short pendulum = Fast. Long = Slow.
// Table: ID 8 (Longest) = 1.25s. ID 1 (Shortest) = 0.9677s. Correct.
//
// Re-read: "擺線上端連接座標 (Pivot)" vs "平衡位置 (Equilibrium)"
// ID 1: Pivot (0,0,0). Eq (0,0,0.2325).
// ID 8: Pivot (-0.35,0,0). Eq (-0.35,0,0.3877).
//
// HYPOTHESIS: The user desires an "Inverted Pendulum" look? Or the pendulums are buoyant?
// OR, per "Pendulum Wave" common device:
// Usually they hang from a frame.
// Frame bar is usually horizontal.
// Here Pivot Z is constant (0).
// Bobs Z varies.
// This implies the Bobs are resting at different heights.
// BUT usually for Pendulum wave, either tops are aligned and bottoms vary, or bottoms aligned and tops vary.
// Here: Pivots (tops?) are all Z=0.
// Bobs (bottoms?) are Z = 0.23 ~ 0.38.
// So Bobs are ABOVE the pivots.
// AND the "Initial Position" is Z~0 (near pivot)??
// No, if L=0.38, and it starts at Z~0, then the string is SLACK or it's compressed?
// Or maybe the initial position is "pulled back" so far it's at Z=0?
// If it swings from Z=0.38 (top) down to Z=0?
// Theta would be 90 degrees?
// $ \cos(90) = 0 $. $Z = Pivot + L \cos(90) = 0 + 0 = 0$.
// So if Init Z = 0.0012, it's basically 90 degrees down?
// But "Initial position... right 3cm". y=0.03.
// If L=0.38, y=0.03 is small angle.
// Small angle means Z should be close to Z_eq.
// Z_eq = 0.38. Init Z should be ~0.38.
// The table says Init Z = 0.0012.
//
// CONTRADICTION RESOLUTION:
// I will trust the "Length" and the "Right 3cm" description.
// I will start the bobs at 3cm displacement in Y.
// I will place the Pendulums visually such that they hang DOWN from the Pivot if we assume standard gravity,
// OR hang UP if we assume the coordinates are literal.
// Literary "Pendulum Wave" -> Hang Down.
// If I use Pivot (0,0,0) and Length 0.23, and assuming standard gravity.
// Eq Position should be (0,0, -0.23).
// If user says Eq is (0,0, +0.23), maybe +Z is DOWN in their math?
// " (+x left-down; +y right; +z UP) ".
//
// Okay. I will simulate PENDULUMS HANGING DOWN.
// I will map the logical coordinates to the visual coordinates.
// Pivot Z = user's Pivot Z (0).
// Bob Z = Pivot Z - Length * cos(theta). (Standard hanging).
// But user table says Eq Z = +Length.
// I will render exactly what the user table says for Pivot and Equilibrium visually first?
// No, I need them to move.
//
// DECISION:
// I will implement "Standard Gravity (-Z)".
// I will place Pivots at Z_pivot_user + Offset if needed? No.
// I will use constraints:
// 1. Pivot is at user's Pivot x,y,z (Z=0).
// 2. String Length is L.
// 3. Equilibrium is naturally at Z = -L. (Gravity down).
// 4. User Text says Eq is at Z = +L.
//
// MAYBE the "Pivots" are at the BOTTOM? Standing wave?
// "擺線上端連接座標" -> "Pendulum String UPPER END connection coordinate".
// Upper end = Top.
// So Pivot IS Top.
// Pivot = (0,0,0).
// Bob Eq = (0,0, 0.23).
// Bob is ABOVE Top.
// This is physically impossible for a string pendulum unless anti-gravity.
// ... Or verify "Pendulum Wave" setup.
// Sometimes they are driven? No.
//
// LIKELY ERROR IN USER SPECS:
// The user likely copied coordinates where Z was depth or inverted.
// OR, the "Pivot" coordinates and "Eq" coordinates are swapped in user's mind?
// If Pivot=(0,0,0.23) and Eq=(0,0,0), then it hangs down.
// Let's assume the user made a mistake and meant the bobs hang DOWN.
// I will align the Pivots at Z=Length (so bobs rest at 0)?
// No, the pivots are listed as Z=0 explicitly.
//
// "Pivot" (Top) = (0,0,0).
// "Bob" (Bottom) = (0,0, 0.23).
//
// I will flip the Z sign of the "Bob Eq" relative to Pivot for the simulation.
// Simulation: Pivot at (x,0,0). Bob hangs at (x,0, -L).
// Camera: Look from top/side.
//
// WAIT! Look at "Initial Position" again.
// (x, 0.03, 0.0012).
// If Bob is at -L, then Z should be negative.
// 0.0012 is almost zero.
// This matches "Pivot is at 0".
// If the Bob starts at Z=0... and pivot is at 0...
// Then length is 0?
//
// It's hopeless to reconcile without assuming errors.
//
// OVERRIDE:
// I will follow the PHYSICS description: "Pendulum Wave".
// 8 Pendulums. Lengths from 0.23m to 0.38m.
// Start at Right 3cm (y=0.03).
// I will put Pivots at Z = +Length (so they all graze the floor at Z=0)?
// Or Pivots at Z=0.4 (clearance)?
//
// Let's stick to the User's "Pivot" X coordinates for spacing.
// Pivot X: 0 to -0.35.
// Pivot Z: User says 0. I will use 0.
// Gravity: -Z.
// Bob Z: Will contain negative values.
// User's Eq Z being positive is likely 'Distance' or typo. I will ignore the sign of Eq Z and assume it hangs down.
//
// What about "Initial Z = 0.0012"?
// If Bob hangs down (Z ~ -0.38), 0.0012 is way off.
//
// Wait. What if the View is from the SIDE?
// x, y, z.
// +x left-down (Viewer). +y right. +z UP.
// If I use the tool `generate_image` or just use common sense?
//
// Let's try to interpret "Pivot (-0.35, 0, 0)" and "Bob Eq (-0.35, 0, 0.3877)" as...
// Maybe the "Pivot" is the *Shadow*?
// No. "Upper End Connection".
//
// I will proceed with:
// Pivots at User Specified (X, 0, 0+H).
// Actually, let's just make the Z level of Pivots constant at Z=0.5 (arbitrary to fit lengths).
// NO. I must follow the coordinates.
//
// OK, let's look at the "Shortest" (ID 1) again.
// Pivot (0,0,0). L=0.23.
// If I hang it down, Bob is at -0.23.
// If I put it up (inverted), Bob is at +0.23.
//
// Maybe the "Pivot" is on the floor and they are "Metronomes" (Music)? Inverted pendulums with springs?
// "Pendulum Wave" implies strings.
//
// I will assume the user's Z coordinates for Pivot are correct (Z=0).
// And the lengths are correct.
// And gravity is standard downwards.
// So Bobs will be at negative Z.
// I will adjust the camera to see them.
// I will note this in comments.
//
// Re-reading "Initial Position": (-0.35, 0.03, 0.0012).
// Maybe 0.0012 is the Z-coordinate?
// If Pivot is at Z=0. Bob is at Z=0.0012.
// That's basically 0.
// Is it swinging in XY plane?
// "摆动是在yz平面上" (Swing in YZ plane).
// If swing in YZ, and Pivot (0,0,0), and Start (0.03, 0.0012).
// Distance from pivot = sqrt(0^2 + 0.03^2 + 0.0012^2) ~ 0.03.
// But Length is 0.38?
// So the starting position dist (0.03) << Length (0.38).
// Impossible for a taught string.
// UNLESS the "Pivot" is NOT (0,0,0).
//
// "擺線上端連接座標 (Pivot)" is EXPLICITY (-0.35,0,0).
//
// Okay, I will implement a "Physical" model that satisfies the "Period" and "Structure" (8 balls, X distributed).
// I will place Pivots at `(table_pivot_x, 0, height_offset)`.
// I will determine height_offset such that Bobs are at roughly sensible Z.
// OR, I'll just use the `L` and `T` from the table and run the physics.
// `theta` is angle from vertical.
// `y = L * sin(theta)`
// `z = -L * cos(theta)` (relative to pivot).
// Initial y = 0.03.
// `sin(theta_0) = 0.03 / L`. `theta_0 = asin(0.03/L)`.
//
// This is rigorous.
// I will render the pivots at `y=0, z=0` (User specified Z=0).
// Bobs will hang at `z < 0`.
//
// The chart:
// "Function y of time". Amplitude +-0.03m.
//


const CONSTANTS = {
    g: 9.81,
    timeStep: 0.01,   // seconds for physics integration
    totalResetTime: 30.0,
    startTime: 0
};

// Physics State
let pendulums = [];
let elapsedTime = 0;
let isRunning = false;
let animationId = null;

// Three.js Globals
let scene, camera, renderer, controls;
let threeObjects = []; // { line, mesh, trace? }
let equilibriumLine;

// Charts Globals
let chartContexts = [];
let chartHistory = []; // Array of arrays of {t, y}

function initPhysics() {
    pendulums = PENDULUMS_DATA.map(d => {
        // Calculate initial theta based on y=0.03 displacement
        // L * sin(theta) = 0.03 => theta = asin(0.03/L)
        const theta0 = Math.asin(0.03 / d.L);

        // VISUAL ADJUSTMENT: Align all Bobs at Z approx 0 (relative to a floor).
        // Standard hanging: Mesh Z = Pivot Z - L * cos(theta).
        // We want Mesh Z (at rest) = 0.
        // So 0 = Pivot Z - L * 1. (Small angle approx or at rest).
        // => Pivot Z = L.
        // We will OVERRIDE the user's table Pivot Z (which was all 0) to be L.
        // This makes shorter pendulums have lower pivots, longer have higher pivots.
        // All bobs align at Z=0.

        const adjustedPivot = d.pivot.clone();
        adjustedPivot.z = d.L;

        return {
            ...d,
            pivot: adjustedPivot,
            theta: theta0,
            omega: 0,
            initialTheta: theta0,
            peaks: []
        };
    });

    // Init chart history
    chartHistory = pendulums.map(() => []);
}

function resetPhysics() {
    elapsedTime = 0;
    pendulums.forEach(p => {
        p.theta = p.initialTheta;
        p.omega = 0;
        p.peaks = [];
    });
    chartHistory = pendulums.map(() => []);

    // Clear canvases
    const chartsContainer = document.getElementById('charts-container');
    const canvases = chartsContainer.querySelectorAll('canvas');
    canvases.forEach(c => {
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
    });

    updateTimeDisplay();
}

// RK4 Integration
function integrate(dt) {
    pendulums.forEach(p => {
        const state = { theta: p.theta, omega: p.omega };

        const evaluate = (st, dt_factor) => {
            const th = st.theta;
            const om = st.omega;
            const dTheta = om;
            const dOmega = -(CONSTANTS.g / p.L) * Math.sin(th);
            return { dTheta, dOmega };
        };

        const k1 = evaluate(state, 0);
        const k2 = evaluate({ theta: state.theta + k1.dTheta * dt * 0.5, omega: state.omega + k1.dOmega * dt * 0.5 }, dt * 0.5);
        const k3 = evaluate({ theta: state.theta + k2.dTheta * dt * 0.5, omega: state.omega + k2.dOmega * dt * 0.5 }, dt * 0.5);
        const k4 = evaluate({ theta: state.theta + k3.dTheta * dt, omega: state.omega + k3.dOmega * dt }, dt);

        p.theta += (dt / 6) * (k1.dTheta + 2 * k2.dTheta + 2 * k3.dTheta + k4.dTheta);
        p.omega += (dt / 6) * (k1.dOmega + 2 * k2.dOmega + 2 * k3.dOmega + k4.dOmega);
    });
}

// --- THREE.JS ---

function initThree() {
    const container = document.getElementById('canvas-3d');
    const w = container.clientWidth;
    const h = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera: Top-ish View
    // User coords: +x left-down, +y right, +z up.
    // Let's position camera at (+1, 0, 1) looking at center? 
    // Pendulums are at x ~ -0.35 to 0.
    // Camera: Updated based on user preference
    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 10);
    camera.position.set(0.46, 0.31, 0.10);
    camera.up.set(0, 0, 1);
    camera.lookAt(-0.24, -0.04, 0.10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.24, -0.04, 0.10);
    controls.update();

    // Floor Grid (Optional, for reference)
    // const grid = new THREE.GridHelper(2, 20);
    // grid.rotation.x = Math.PI / 2; // Lie on XY plane? No, GridHelper is XZ by default.
    // scene.add(grid);

    // Lights
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // Equilibrium Line
    // (0.05, 0, 0) to (-0.40, 0, 0)
    // Adjusted: Draw at Z=0 (where bobs align) or at Pivots?
    // User said "Balanced Pos reference line". 
    // Bobs are now at Z=0. The Line should be at Z=0.
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.05, 0, 0),
        new THREE.Vector3(-0.40, 0, 0)
    ]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x555555, dashSize: 0.01, gapSize: 0.005 });
    equilibriumLine = new THREE.Line(lineGeo, lineMat);
    equilibriumLine.computeLineDistances();
    scene.add(equilibriumLine);

    // Pendulum Objects
    const sphereGeo = new THREE.SphereGeometry(0.01, 32, 32);
    const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff });

    pendulums.forEach((p, idx) => {
        // Color gradient?
        const color = new THREE.Color().setHSL(idx / 8, 1, 0.5);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.5 });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        scene.add(mesh);

        // String
        const lineG = new THREE.BufferGeometry().setFromPoints([
            p.pivot,
            new THREE.Vector3(p.pivot.x, p.pivot.y, p.pivot.z - p.L) // Temp end
        ]);
        const line = new THREE.Line(lineG, stringMat);
        scene.add(line);

        threeObjects.push({ mesh, line, p });
    });

    window.addEventListener('resize', onResize);
}

function onResize() {
    const container = document.getElementById('canvas-3d');
    if (!container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

function updateThree() {
    threeObjects.forEach(obj => {
        const { p, mesh, line } = obj;

        // Calculate Pos
        // y = L sin(theta)
        // z = -L cos(theta) (Assuming hanging down)
        // With Z-Alignment: Mesh Z = Pivot Z - L cos(theta)
        // Since Pivot Z = L, Mesh Z = L (1 - cos(theta)).
        // For small theta, cos(theta) ~ 1. Mesh Z ~ 0.

        const y = p.L * Math.sin(p.theta);
        const zDisplacement = -p.L * Math.cos(p.theta);

        mesh.position.set(p.pivot.x, p.pivot.y + y, p.pivot.z + zDisplacement);

        // Update Line
        const positions = line.geometry.attributes.position.array;
        // Start (Pivot)
        positions[0] = p.pivot.x;
        positions[1] = p.pivot.y;
        positions[2] = p.pivot.z;
        // End (Bob)
        positions[3] = mesh.position.x;
        positions[4] = mesh.position.y;
        positions[5] = mesh.position.z;
        line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

// --- CHARTS ---

function initCharts() {
    const container = document.getElementById('charts-container');
    container.innerHTML = ''; // Clear

    pendulums.forEach((p, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';

        const canvas = document.createElement('canvas');
        canvas.className = 'chart-canvas';

        // Initial sizing (will be fixed by ResizeObserver immediately usually, but good for safety)
        // We defer exact sizing to Observer or set basic here?
        // Let's rely on standard logic but we need dpr.
        // Observer handles it best.

        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        chartContexts.push({
            ctx: canvas.getContext('2d'),
            canvas: canvas,
            pIndex: i,
            color: new THREE.Color().setHSL(i / 8, 1, 0.5).getStyle()
        });
    });
}

function updateCharts() {
    // Record current data
    pendulums.forEach((p, i) => {
        // Y position is L * sin(theta)
        const y = p.L * Math.sin(p.theta);
        chartHistory[i].push({ t: elapsedTime, y: y });
    });

    // Prune history for memory? 
    // We only need last 30s relative to window? 
    // Spec says: "Once time > 30s, x-axis range is (t-30, t)."
    // We can keep data, just draw window. But to save memory, prune if t < current - 30.
    // Although keep a bit of buffer.

    const dpr = window.devicePixelRatio || 1;

    chartContexts.forEach(({ ctx, canvas, pIndex, color }) => {
        const history = chartHistory[pIndex];
        if (history.length === 0) return;

        // Use client dims -> Logical size
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        // Ensure buffer matches dpr (auto-resize check)
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
        }

        // Scale context to match logical coords
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // Draw Axis/Grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2); // Center line (y=0)
        ctx.stroke();

        // Determine Time Window
        // Use chartTimeWindow global
        let windowSize = typeof chartTimeWindow !== 'undefined' ? chartTimeWindow : 5;
        let tEnd = Math.max(windowSize, elapsedTime);
        let tStart = tEnd - windowSize;

        // Y Range: +- 0.03m
        const yMax = 0.04; // Little padding
        const yScale = (h / 2) / yMax;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        let first = true;

        // Optimization: Binary search start index? 
        // Just iterate is fine for N ~ 30*60 = 1800 points.
        for (let i = 0; i < history.length; i++) {
            const pt = history[i];
            if (pt.t < tStart) continue;

            // Map t to x [0, w]
            const x = ((pt.t - tStart) / windowSize) * w;
            // Map y to canvas y (invert because canvas y is down)
            const cy = (h / 2) - (pt.y * yScale);

            if (first) {
                ctx.moveTo(x, cy);
                first = false;
            } else {
                ctx.lineTo(x, cy);
            }
        }
        ctx.stroke();

        // Draw Peak Guides
        const peaks = pendulums[pIndex].peaks;
        if (peaks && peaks.length > 0) {
            ctx.strokeStyle = '#FFFF00'; // Yellow for visibility
            ctx.setLineDash([4, 4]); // Clearly dashed
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            peaks.forEach(tPeak => {
                // Relaxed check to include edges
                if (tPeak > tStart && tPeak < tEnd) {
                    const x = ((tPeak - tStart) / windowSize) * w;
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                }
            });

            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        ctx.fillText(`P${PENDULUMS_DATA[pIndex].id}`, 5, 15);
    });
}

// --- MAIN LOOP ---

function loop() {
    if (!isRunning) return;

    animationId = requestAnimationFrame(loop);

    // Save previous omegas
    const prevOmegas = pendulums.map(p => p.omega);

    // Physics Step
    integrate(CONSTANTS.timeStep);
    elapsedTime += CONSTANTS.timeStep;

    // Check Peaks: Zero crossing of Omega (Positive to Negative)
    const timeInCycle = elapsedTime % CONSTANTS.totalResetTime;

    // Suppress natural detection near reset (29.7s to 30s)
    if (timeInCycle < 29.7) {
        pendulums.forEach((p, i) => {
            if (prevOmegas[i] > 0 && p.omega <= 0) {
                p.peaks.push(elapsedTime);
            }
        });
    }

    // Check Reset
    const cycleIndex = Math.floor(elapsedTime / CONSTANTS.totalResetTime);
    // We need to store state to know if we already reset for this cycle 
    // Or just check if elapsedTime crossed the boundary within this step
    // prevTime was elapsedTime - timeStep.
    const prevTime = elapsedTime - CONSTANTS.timeStep;
    const prevCycle = Math.floor(prevTime / CONSTANTS.totalResetTime);

    if (cycleIndex > prevCycle) {
        // Prune chart history to save memory
        // Keep last 35 seconds (30s window + 5s buffer)
        const cutoff = elapsedTime - 35;

        pendulums.forEach(p => {
            p.theta = p.initialTheta;
            p.omega = 0;
            // FIXED: Prune instead of clear
            if (p.peaks) {
                p.peaks = p.peaks.filter(t => t > cutoff);
            }
            // FORCE A PEAK at reset
            p.peaks.push(elapsedTime);
        });

        chartHistory.forEach((hist, i) => {
            // Find index where t > cutoff
            const idx = hist.findIndex(pt => pt.t > cutoff);
            if (idx > 0) {
                chartHistory[i] = hist.slice(idx);
            }
        });
    }

    updateThree();
    updateCharts();
    updateTimeDisplay();
}

function updateTimeDisplay() {
    const el = document.getElementById('time-display');
    if (el) el.textContent = `Time: ${elapsedTime.toFixed(2)}s`;
}

// --- CONTROLS ---

// --- CONTROLS ---

let chartTimeWindow = 2; // Default 2s

document.getElementById('btn-toggle').addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) loop();
    else cancelAnimationFrame(animationId);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    isRunning = false;
    cancelAnimationFrame(animationId);
    resetPhysics();
    updateThree();
    updateCharts();
});

const sliderWindow = document.getElementById('slider-window');
const labelWindow = document.getElementById('val-window');

if (sliderWindow) {
    sliderWindow.value = chartTimeWindow; // Sync
    sliderWindow.addEventListener('input', (e) => {
        chartTimeWindow = parseInt(e.target.value, 10);
        labelWindow.textContent = `${chartTimeWindow}s`;
        if (!isRunning) updateCharts();
    });
}

function updateCameraInfo() {
    const info = document.getElementById('camera-info');
    if (info) {
        const p = camera.position;
        const t = controls.target;
        info.innerHTML = `Pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}<br>Target: ${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)}`;
    }
}

// Setup
initPhysics();
initThree();

// Hook controls change for camera info
if (controls) {
    controls.addEventListener('change', updateCameraInfo);
}
updateCameraInfo(); // Init
initCharts();
updateThree(); // Initial render
// Start
loop();
isRunning = false;
cancelAnimationFrame(animationId);
updateThree();
updateCharts();

// Resize observer for charts
const ro = new ResizeObserver(() => {
    // Re-set canvas dimensions to match High DPI
    const dpr = window.devicePixelRatio || 1;
    const containers = document.querySelectorAll('.chart-wrapper');
    containers.forEach((w, i) => {
        const c = w.querySelector('canvas');
        // We set the buffer size to client size * dpr
        // We do NOT set style.width/height here as they follow the parent validly (CSS: 100%).
        c.width = w.clientWidth * dpr;
        c.height = w.clientHeight * dpr;
    });
    if (!isRunning) updateCharts();
});
document.querySelectorAll('.chart-wrapper').forEach(el => ro.observe(el));
