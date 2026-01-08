
const canvas = document.getElementById('atom-canvas');
const ctx = canvas.getContext('2d');
const atomicNumberSelect = document.getElementById('atomic-number');
const isotopeSelect = document.getElementById('isotope');
const elementNameDiv = document.getElementById('element-name');
const elementSymbolDiv = document.getElementById('element-symbol');
const massNumberSpan = document.getElementById('mass-number');
const atomicNumberDisplaySpan = document.getElementById('atomic-number-display');
const exportBtn = document.getElementById('export-btn');

function log(msg) {
    // Debug logging disabled
}

window.onerror = null;

// Element Data (1-102)
const elementsData = [
    { z: 1, symbol: 'H', name: '氫', isotopes: [1, 2, 3] },
    { z: 2, symbol: 'He', name: '氦', isotopes: [3, 4] },
    { z: 3, symbol: 'Li', name: '鋰', isotopes: [6, 7] },
    { z: 4, symbol: 'Be', name: '鈹', isotopes: [9] },
    { z: 5, symbol: 'B', name: '硼', isotopes: [10, 11] },
    { z: 6, symbol: 'C', name: '碳', isotopes: [12, 13, 14] },
    { z: 7, symbol: 'N', name: '氮', isotopes: [14, 15] },
    { z: 8, symbol: 'O', name: '氧', isotopes: [16, 17, 18] },
    { z: 9, symbol: 'F', name: '氟', isotopes: [19] },
    { z: 10, symbol: 'Ne', name: '氖', isotopes: [20, 21, 22] },
    { z: 11, symbol: 'Na', name: '鈉', isotopes: [23] },
    { z: 12, symbol: 'Mg', name: '鎂', isotopes: [24, 25, 26] },
    { z: 13, symbol: 'Al', name: '鋁', isotopes: [27] },
    { z: 14, symbol: 'Si', name: '矽', isotopes: [28, 29, 30] },
    { z: 15, symbol: 'P', name: '磷', isotopes: [31] },
    { z: 16, symbol: 'S', name: '硫', isotopes: [32, 33, 34, 36] },
    { z: 17, symbol: 'Cl', name: '氯', isotopes: [35, 37] },
    { z: 18, symbol: 'Ar', name: '氬', isotopes: [36, 38, 40] },
    { z: 19, symbol: 'K', name: '鉀', isotopes: [39, 41] },
    { z: 20, symbol: 'Ca', name: '鈣', isotopes: [40, 42, 43, 44, 46, 48] },
    { z: 21, symbol: 'Sc', name: '鈧', isotopes: [45] },
    { z: 22, symbol: 'Ti', name: '鈦', isotopes: [46, 47, 48, 49, 50] },
    { z: 23, symbol: 'V', name: '釩', isotopes: [50, 51] },
    { z: 24, symbol: 'Cr', name: '鉻', isotopes: [50, 52, 53, 54] },
    { z: 25, symbol: 'Mn', name: '錳', isotopes: [55] },
    { z: 26, symbol: 'Fe', name: '鐵', isotopes: [54, 56, 57, 58] },
    { z: 27, symbol: 'Co', name: '鈷', isotopes: [59] },
    { z: 28, symbol: 'Ni', name: '鎳', isotopes: [58, 60, 61, 62, 64] },
    { z: 29, symbol: 'Cu', name: '銅', isotopes: [63, 65] },
    { z: 30, symbol: 'Zn', name: '鋅', isotopes: [64, 66, 67, 68, 70] },
    { z: 31, symbol: 'Ga', name: '鎵', isotopes: [69, 71] },
    { z: 32, symbol: 'Ge', name: '鍺', isotopes: [70, 72, 73, 74, 76] },
    { z: 33, symbol: 'As', name: '砷', isotopes: [75] },
    { z: 34, symbol: 'Se', name: '硒', isotopes: [74, 76, 77, 78, 80, 82] },
    { z: 35, symbol: 'Br', name: '溴', isotopes: [79, 81] },
    { z: 36, symbol: 'Kr', name: '氪', isotopes: [78, 80, 82, 83, 84, 86] },
    { z: 37, symbol: 'Rb', name: '銣', isotopes: [85, 87] },
    { z: 38, symbol: 'Sr', name: '鍶', isotopes: [84, 86, 87, 88] },
    { z: 39, symbol: 'Y', name: '釔', isotopes: [89] },
    { z: 40, symbol: 'Zr', name: '鋯', isotopes: [90, 91, 92, 94, 96] },
    { z: 41, symbol: 'Nb', name: '鈮', isotopes: [93] },
    { z: 42, symbol: 'Mo', name: '鉬', isotopes: [92, 94, 95, 96, 97, 98, 100] },
    { z: 43, symbol: 'Tc', name: '鎝', isotopes: [97, 98, 99] },
    { z: 44, symbol: 'Ru', name: '釕', isotopes: [96, 98, 99, 100, 101, 102, 104] },
    { z: 45, symbol: 'Rh', name: '銠', isotopes: [103] },
    { z: 46, symbol: 'Pd', name: '鈀', isotopes: [102, 104, 105, 106, 108, 110] },
    { z: 47, symbol: 'Ag', name: '銀', isotopes: [107, 109] },
    { z: 48, symbol: 'Cd', name: '鎘', isotopes: [106, 108, 110, 111, 112, 113, 114, 116] },
    { z: 49, symbol: 'In', name: '銦', isotopes: [113, 115] },
    { z: 50, symbol: 'Sn', name: '錫', isotopes: [112, 114, 115, 116, 117, 118, 119, 120, 122, 124] },
    { z: 51, symbol: 'Sb', name: '銻', isotopes: [121, 123] },
    { z: 52, symbol: 'Te', name: '碲', isotopes: [120, 122, 123, 124, 125, 126, 128, 130] },
    { z: 53, symbol: 'I', name: '碘', isotopes: [127] },
    { z: 54, symbol: 'Xe', name: '氙', isotopes: [124, 126, 128, 129, 130, 131, 132, 134, 136] },
    { z: 55, symbol: 'Cs', name: '銫', isotopes: [133] },
    { z: 56, symbol: 'Ba', name: '鋇', isotopes: [130, 132, 134, 135, 136, 137, 138] },
    { z: 57, symbol: 'La', name: '鑭', isotopes: [138, 139] },
    { z: 58, symbol: 'Ce', name: '鈰', isotopes: [136, 138, 140, 142] },
    { z: 59, symbol: 'Pr', name: '鐠', isotopes: [141] },
    { z: 60, symbol: 'Nd', name: '釹', isotopes: [142, 143, 144, 145, 146, 148, 150] },
    { z: 61, symbol: 'Pm', name: '鉕', isotopes: [145, 147] },
    { z: 62, symbol: 'Sm', name: '釤', isotopes: [144, 147, 148, 149, 150, 152, 154] },
    { z: 63, symbol: 'Eu', name: '銪', isotopes: [151, 153] },
    { z: 64, symbol: 'Gd', name: '釓', isotopes: [152, 154, 155, 156, 157, 158, 160] },
    { z: 65, symbol: 'Tb', name: '鋱', isotopes: [159] },
    { z: 66, symbol: 'Dy', name: '鏑', isotopes: [156, 158, 160, 161, 162, 163, 164] },
    { z: 67, symbol: 'Ho', name: '鈥', isotopes: [165] },
    { z: 68, symbol: 'Er', name: '鉺', isotopes: [162, 164, 166, 167, 168, 170] },
    { z: 69, symbol: 'Tm', name: '銩', isotopes: [169] },
    { z: 70, symbol: 'Yb', name: '鐿', isotopes: [168, 170, 171, 172, 173, 174, 176] },
    { z: 71, symbol: 'Lu', name: '鎦', isotopes: [175, 176] },
    { z: 72, symbol: 'Hf', name: '鉿', isotopes: [174, 176, 177, 178, 179, 180] },
    { z: 73, symbol: 'Ta', name: '鉭', isotopes: [180, 181] },
    { z: 74, symbol: 'W', name: '鎢', isotopes: [180, 182, 183, 184, 186] },
    { z: 75, symbol: 'Re', name: '錸', isotopes: [185, 187] },
    { z: 76, symbol: 'Os', name: '鋨', isotopes: [184, 186, 187, 188, 189, 190, 192] },
    { z: 77, symbol: 'Ir', name: '銥', isotopes: [191, 193] },
    { z: 78, symbol: 'Pt', name: '鉑', isotopes: [190, 192, 194, 195, 196, 198] },
    { z: 79, symbol: 'Au', name: '金', isotopes: [197] },
    { z: 80, symbol: 'Hg', name: '汞', isotopes: [196, 198, 199, 200, 201, 202, 204] },
    { z: 81, symbol: 'Tl', name: '鉈', isotopes: [203, 205] },
    { z: 82, symbol: 'Pb', name: '鉛', isotopes: [204, 206, 207, 208] },
    { z: 83, symbol: 'Bi', name: '鉍', isotopes: [209] },
    { z: 84, symbol: 'Po', name: '釙', isotopes: [209, 210] },
    { z: 85, symbol: 'At', name: '砈', isotopes: [210, 211] },
    { z: 86, symbol: 'Rn', name: '氡', isotopes: [222] },
    { z: 87, symbol: 'Fr', name: '鍅', isotopes: [223] },
    { z: 88, symbol: 'Ra', name: '鐳', isotopes: [226] },
    { z: 89, symbol: 'Ac', name: '錒', isotopes: [227] },
    { z: 90, symbol: 'Th', name: '釷', isotopes: [232] },
    { z: 91, symbol: 'Pa', name: ' protactinium', isotopes: [231] }, // Pa name fix -> 鏷
    { z: 92, symbol: 'U', name: '鈾', isotopes: [234, 235, 238] },
    { z: 93, symbol: 'Np', name: '錼', isotopes: [237] },
    { z: 94, symbol: 'Pu', name: '鈽', isotopes: [238, 239, 240, 241, 242, 244] },
    { z: 95, symbol: 'Am', name: '鋂', isotopes: [241, 243] },
    { z: 96, symbol: 'Cm', name: '鋦', isotopes: [247] },
    { z: 97, symbol: 'Bk', name: '鍆', isotopes: [247] },
    { z: 98, symbol: 'Cf', name: '鉲', isotopes: [251] },
    { z: 99, symbol: 'Es', name: '鑀', isotopes: [252] },
    { z: 100, symbol: 'Fm', name: '鐨', isotopes: [257] },
    { z: 101, symbol: 'Md', name: '鍆', isotopes: [256] }, // Fixed name: 鍆 (Mendelevium)
    { z: 102, symbol: 'No', name: '鍩', isotopes: [259] },
];

// Fix for Pa and duplicate names if any
const elementPa = elementsData.find(e => e.z === 91);
if (elementPa) elementPa.name = '鏷';
const elementBk = elementsData.find(e => e.z === 97);
if (elementBk) elementBk.name = '鉳';
const elementMd = elementsData.find(e => e.z === 101);
if (elementMd) elementMd.name = '鍆';


// Shell capacities (simplified standard model: 2n^2 rule or periodic based)
// Period lengths: 2, 8, 8, 18, 18, 32, 32
const SHELL_CAPACITIES = [2, 8, 8, 18, 18, 32, 32];

let currentScale = 1;

// Directions for Hex Packing
const DIRECTIONS = [
    { dx: 2, dy: 0 }, // 0 deg
    { dx: 1, dy: Math.sqrt(3) }, // 60 deg
    { dx: -1, dy: Math.sqrt(3) }, // 120 deg
    { dx: -2, dy: 0 }, // 180 deg
    { dx: -1, dy: -Math.sqrt(3) }, // 240 deg
    { dx: 1, dy: -Math.sqrt(3) }, // 300 deg
];

function generateNucleusPositions(massNumber) {
    const positions = [];
    if (massNumber === 0) return positions;

    // Center
    positions.push({ x: 0, y: 0 });

    if (massNumber === 1) return positions;

    let count = 1;
    let layer = 1;

    while (count < massNumber) {
        // Start at Rightmost point of the hex ring: (layer * 2, 0)
        let cx = layer * 2;
        let cy = 0;

        const correctSideDirs = [
            DIRECTIONS[2],
            DIRECTIONS[3],
            DIRECTIONS[4],
            DIRECTIONS[5],
            DIRECTIONS[0],
            DIRECTIONS[1]
        ];

        for (let side = 0; side < 6; side++) {
            for (let step = 0; step < layer; step++) {
                if (count >= massNumber) return positions;

                positions.push({ x: cx, y: cy });
                count++;

                cx += correctSideDirs[side].dx;
                cy += correctSideDirs[side].dy;
            }
        }

        layer++;
    }

    return positions;
}

// Initialize
function init() {
    // Populate Atomic Number Select
    elementsData.forEach(element => {
        const option = document.createElement('option');
        option.value = element.z;
        option.textContent = `${element.z} - ${element.name} (${element.symbol})`
        atomicNumberSelect.appendChild(option);
    });

    // Default to Hydrogen (or first element)
    atomicNumberSelect.value = 1;

    // Event Listeners
    atomicNumberSelect.addEventListener('change', handleElementChange);
    isotopeSelect.addEventListener('change', handleIsotopeChange);
    exportBtn.addEventListener('click', exportImage);
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawCurrentAtom();
    });

    handleElementChange(); // Initial Update
    resizeCanvas();
}

function handleElementChange() {
    const z = parseInt(atomicNumberSelect.value);
    const element = elementsData.find(e => e.z === z);

    if (!element) {
        return;
    }

    // Clear and populate Isotope select
    isotopeSelect.innerHTML = '';
    element.isotopes.forEach(mass => {
        const option = document.createElement('option');
        option.value = mass;
        option.textContent = `${element.name}-${mass} (${element.symbol}-${mass})`;
        isotopeSelect.appendChild(option);
    });

    // Select default isotope (usually the first one or common one)
    isotopeSelect.selectedIndex = 0;

    handleIsotopeChange();
}

function handleIsotopeChange() {
    updateDisplay();
    drawCurrentAtom();
}

function updateDisplay() {
    const z = parseInt(atomicNumberSelect.value);
    const mass = parseInt(isotopeSelect.value);
    const element = elementsData.find(e => e.z === z);

    elementNameDiv.textContent = `${element.name}-${mass}`;
    elementSymbolDiv.textContent = element.symbol;
    massNumberSpan.textContent = mass;
    atomicNumberDisplaySpan.textContent = z;
}

function resizeCanvas() {
    const rightPanel = document.querySelector('.right-panel');
    if (rightPanel) {
        // High DPI Support with Supersampling (2x)
        const dpr = window.devicePixelRatio || 1;
        const superSample = 2; // Supersample factor for ultra-crisp edges
        const scaleFactor = dpr * superSample;

        const rect = rightPanel.getBoundingClientRect();

        // Physical pixels = CSS size * dpr * supersample
        canvas.width = rect.width * scaleFactor;
        canvas.height = rect.height * scaleFactor;

        // CSS display size matches the container
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Reset scale and apply scaleFactor
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Identity
        ctx.scale(scaleFactor, scaleFactor);

        // Ensure smoothing is enabled
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
    drawCurrentAtom();
}

function drawCurrentAtom() {
    const z = parseInt(atomicNumberSelect.value);
    const mass = parseInt(isotopeSelect.value);

    if (isNaN(z) || isNaN(mass)) return;

    // Clear Canvas Area (Bounding Rect in logical pixels)
    // We scaled context, so we clear logical dimensions
    const rightPanel = document.querySelector('.right-panel');
    const width = rightPanel ? rightPanel.clientWidth : canvas.width;
    const height = rightPanel ? rightPanel.clientHeight : canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Calculate Nucleus
    const nucleusPositions = generateNucleusPositions(mass);

    // Assign protons randomly
    const indices = Array.from({ length: mass }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const protonIndices = new Set(indices.slice(0, z));

    // 2. Calculate Shells
    const shells = [];
    let electronsLeft = z;
    for (const cap of SHELL_CAPACITIES) {
        if (electronsLeft <= 0) break;
        const count = Math.min(electronsLeft, cap);
        shells.push(count);
        electronsLeft -= count;
    }

    // 3. Determine Scale
    const nucleusLayers = Math.ceil((Math.sqrt(mass / 3.0)) || 1);
    const particleRadius = 10;
    const nucleusVisualRadius = nucleusLayers * 2 * particleRadius + 10;

    const shellGap = 40;
    const maxShellRadius = nucleusVisualRadius + shells.length * shellGap;

    // Fit to Canvas
    const padding = 50;
    const minDim = Math.min(width, height);
    const requiredSize = 2 * maxShellRadius + padding;

    currentScale = minDim / requiredSize;
    if (currentScale <= 0 || !isFinite(currentScale)) currentScale = 1;

    // Center of canvas (logical)
    const cx = width / 2;
    const cy = height / 2;

    // Draw Nucleus
    nucleusPositions.forEach((pos, index) => {
        const isProton = protonIndices.has(index);

        const visualScale = 0.85;

        const px = cx + pos.x * particleRadius * currentScale * 0.9;
        const py = cy + pos.y * particleRadius * currentScale * 0.9;

        const r = particleRadius * currentScale * visualScale;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = isProton ? '#ff8080' : '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 * currentScale;
        ctx.fill();
        ctx.stroke();

        // Symbols - Draw geometric paths instead of text
        if (isProton) {
            ctx.beginPath();
            const symbolSize = r * 0.6; // Size relative to radius
            // Vertical line
            ctx.moveTo(px, py - symbolSize / 2);
            ctx.lineTo(px, py + symbolSize / 2);
            // Horizontal line
            ctx.moveTo(px - symbolSize / 2, py);
            ctx.lineTo(px + symbolSize / 2, py);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2 * currentScale;
            ctx.stroke();
        }
    });

    // Draw Shells and Electrons
    let shellRadius = nucleusVisualRadius * currentScale;

    shells.forEach((eCount, i) => {
        shellRadius += shellGap * currentScale;

        // Draw Track
        ctx.beginPath();
        ctx.arc(cx, cy, shellRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1 * currentScale;
        ctx.stroke();

        // Draw Electrons
        for (let j = 0; j < eCount; j++) {
            const angle = (Math.PI * 2 * j) / eCount - Math.PI / 2;
            const ex = cx + Math.cos(angle) * shellRadius;
            const ey = cy + Math.sin(angle) * shellRadius;
            const er = particleRadius * currentScale * 0.8;

            ctx.beginPath();
            ctx.arc(ex, ey, er, 0, Math.PI * 2);
            ctx.fillStyle = '#80aaff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2 * currentScale;
            ctx.fill();
            ctx.stroke();

            // Draw Minus Sign (Geometric)
            ctx.beginPath();
            const symbolSize = er * 0.6;
            ctx.moveTo(ex - symbolSize / 2, ey);
            ctx.lineTo(ex + symbolSize / 2, ey);

            ctx.strokeStyle = '#000000ff';
            ctx.lineWidth = 2 * currentScale;
            ctx.stroke();
        }
    });

    // log('Drawn Atom Z=' + z);
}

function exportImage() {
    const link = document.createElement('a');
    link.download = `atom_${elementNameDiv.textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Start
init();
