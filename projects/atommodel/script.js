
const canvas = document.getElementById('atom-canvas');
const ctx = canvas.getContext('2d');
const atomicNumberSelect = document.getElementById('atomic-number');
const isotopeSelect = document.getElementById('isotope');
const chargeSelect = document.getElementById('charge'); // New Dropdown
const elementNameDiv = document.getElementById('element-name');
const elementSymbolDiv = document.getElementById('element-symbol');
const massNumberSpan = document.getElementById('mass-number');
const atomicNumberDisplaySpan = document.getElementById('atomic-number-display');
const exportBtn = document.getElementById('export-btn');

function log(msg) {
    // Debug logging disabled
}

window.onerror = null;

// Element Data (1-102) with Common Oxidation States (ions)
// Source: IUPAC and common chemistry tables
// 0 is always included.
// Format: ions: [0, 1, -1, ...]
const elementsData = [
    { z: 1, symbol: 'H', name: '氫', isotopes: [1, 2, 3], ions: [0, 1, -1] },
    { z: 2, symbol: 'He', name: '氦', isotopes: [3, 4], ions: [0] },
    { z: 3, symbol: 'Li', name: '鋰', isotopes: [6, 7], ions: [0, 1] },
    { z: 4, symbol: 'Be', name: '鈹', isotopes: [9], ions: [0, 2] },
    { z: 5, symbol: 'B', name: '硼', isotopes: [10, 11], ions: [0, 3] },
    { z: 6, symbol: 'C', name: '碳', isotopes: [12, 13, 14], ions: [0, 4, -4, 2] },
    { z: 7, symbol: 'N', name: '氮', isotopes: [14, 15], ions: [0, 5, 4, 3, 2, 1, -1, -2, -3] },
    { z: 8, symbol: 'O', name: '氧', isotopes: [16, 17, 18], ions: [0, -2, -1] },
    { z: 9, symbol: 'F', name: '氟', isotopes: [19], ions: [0, -1] },
    { z: 10, symbol: 'Ne', name: '氖', isotopes: [20, 21, 22], ions: [0] },
    { z: 11, symbol: 'Na', name: '鈉', isotopes: [23], ions: [0, 1] },
    { z: 12, symbol: 'Mg', name: '鎂', isotopes: [24, 25, 26], ions: [0, 2] },
    { z: 13, symbol: 'Al', name: '鋁', isotopes: [27], ions: [0, 3] },
    { z: 14, symbol: 'Si', name: '矽', isotopes: [28, 29, 30], ions: [0, 4, -4] },
    { z: 15, symbol: 'P', name: '磷', isotopes: [31], ions: [0, 5, 3, -3] },
    { z: 16, symbol: 'S', name: '硫', isotopes: [32, 33, 34, 36], ions: [0, 6, 4, 2, -2] },
    { z: 17, symbol: 'Cl', name: '氯', isotopes: [35, 37], ions: [0, 7, 5, 3, 1, -1] },
    { z: 18, symbol: 'Ar', name: '氬', isotopes: [36, 38, 40], ions: [0] },
    { z: 19, symbol: 'K', name: '鉀', isotopes: [39, 41], ions: [0, 1] },
    { z: 20, symbol: 'Ca', name: '鈣', isotopes: [40, 42, 43, 44, 46, 48], ions: [0, 2] },
    { z: 21, symbol: 'Sc', name: '鈧', isotopes: [45], ions: [0, 3] },
    { z: 22, symbol: 'Ti', name: '鈦', isotopes: [46, 47, 48, 49, 50], ions: [0, 4, 3] },
    { z: 23, symbol: 'V', name: '釩', isotopes: [50, 51], ions: [0, 5, 4, 3, 2] },
    { z: 24, symbol: 'Cr', name: '鉻', isotopes: [50, 52, 53, 54], ions: [0, 6, 3, 2] },
    { z: 25, symbol: 'Mn', name: '錳', isotopes: [55], ions: [0, 7, 6, 4, 2] },
    { z: 26, symbol: 'Fe', name: '鐵', isotopes: [54, 56, 57, 58], ions: [0, 3, 2] },
    { z: 27, symbol: 'Co', name: '鈷', isotopes: [59], ions: [0, 3, 2] },
    { z: 28, symbol: 'Ni', name: '鎳', isotopes: [58, 60, 61, 62, 64], ions: [0, 3, 2] },
    { z: 29, symbol: 'Cu', name: '銅', isotopes: [63, 65], ions: [0, 2, 1] },
    { z: 30, symbol: 'Zn', name: '鋅', isotopes: [64, 66, 67, 68, 70], ions: [0, 2] },
    { z: 31, symbol: 'Ga', name: '鎵', isotopes: [69, 71], ions: [0, 3] },
    { z: 32, symbol: 'Ge', name: '鍺', isotopes: [70, 72, 73, 74, 76], ions: [0, 4, 2] },
    { z: 33, symbol: 'As', name: '砷', isotopes: [75], ions: [0, 5, 3, -3] },
    { z: 34, symbol: 'Se', name: '硒', isotopes: [74, 76, 77, 78, 80, 82], ions: [0, 6, 4, -2] },
    { z: 35, symbol: 'Br', name: '溴', isotopes: [79, 81], ions: [0, 5, 1, -1] },
    { z: 36, symbol: 'Kr', name: '氪', isotopes: [78, 80, 82, 83, 84, 86], ions: [0, 2] },
    { z: 37, symbol: 'Rb', name: '銣', isotopes: [85, 87], ions: [0, 1] },
    { z: 38, symbol: 'Sr', name: '鍶', isotopes: [84, 86, 87, 88], ions: [0, 2] },
    { z: 39, symbol: 'Y', name: '釔', isotopes: [89], ions: [0, 3] },
    { z: 40, symbol: 'Zr', name: '鋯', isotopes: [90, 91, 92, 94, 96], ions: [0, 4] },
    { z: 41, symbol: 'Nb', name: '鈮', isotopes: [93], ions: [0, 5, 3] },
    { z: 42, symbol: 'Mo', name: '鉬', isotopes: [92, 94, 95, 96, 97, 98, 100], ions: [0, 6, 4] },
    { z: 43, symbol: 'Tc', name: '鎝', isotopes: [97, 98, 99], ions: [0, 7] },
    { z: 44, symbol: 'Ru', name: '釕', isotopes: [96, 98, 99, 100, 101, 102, 104], ions: [0, 8, 4, 3] },
    { z: 45, symbol: 'Rh', name: '銠', isotopes: [103], ions: [0, 3] },
    { z: 46, symbol: 'Pd', name: '鈀', isotopes: [102, 104, 105, 106, 108, 110], ions: [0, 4, 2] },
    { z: 47, symbol: 'Ag', name: '銀', isotopes: [107, 109], ions: [0, 1] },
    { z: 48, symbol: 'Cd', name: '鎘', isotopes: [106, 108, 110, 111, 112, 113, 114, 116], ions: [0, 2] },
    { z: 49, symbol: 'In', name: '銦', isotopes: [113, 115], ions: [0, 3] },
    { z: 50, symbol: 'Sn', name: '錫', isotopes: [112, 114, 115, 116, 117, 118, 119, 120, 122, 124], ions: [0, 4, 2] },
    { z: 51, symbol: 'Sb', name: '銻', isotopes: [121, 123], ions: [0, 5, 3, -3] },
    { z: 52, symbol: 'Te', name: '碲', isotopes: [120, 122, 123, 124, 125, 126, 128, 130], ions: [0, 6, 4, -2] },
    { z: 53, symbol: 'I', name: '碘', isotopes: [127], ions: [0, 7, 5, 1, -1] },
    { z: 54, symbol: 'Xe', name: '氙', isotopes: [124, 126, 128, 129, 130, 131, 132, 134, 136], ions: [0] },
    { z: 55, symbol: 'Cs', name: '銫', isotopes: [133], ions: [0, 1] },
    { z: 56, symbol: 'Ba', name: '鋇', isotopes: [130, 132, 134, 135, 136, 137, 138], ions: [0, 2] },
    { z: 57, symbol: 'La', name: '鑭', isotopes: [138, 139], ions: [0, 3] },
    { z: 58, symbol: 'Ce', name: '鈰', isotopes: [136, 138, 140, 142], ions: [0, 4, 3] },
    { z: 59, symbol: 'Pr', name: '鐠', isotopes: [141], ions: [0, 3] },
    { z: 60, symbol: 'Nd', name: '釹', isotopes: [142, 143, 144, 145, 146, 148, 150], ions: [0, 3] },
    { z: 61, symbol: 'Pm', name: '鉕', isotopes: [145, 147], ions: [0, 3] },
    { z: 62, symbol: 'Sm', name: '釤', isotopes: [144, 147, 148, 149, 150, 152, 154], ions: [0, 3, 2] },
    { z: 63, symbol: 'Eu', name: '銪', isotopes: [151, 153], ions: [0, 3, 2] },
    { z: 64, symbol: 'Gd', name: '釓', isotopes: [152, 154, 155, 156, 157, 158, 160], ions: [0, 3] },
    { z: 65, symbol: 'Tb', name: '鋱', isotopes: [159], ions: [0, 4, 3] },
    { z: 66, symbol: 'Dy', name: '鏑', isotopes: [156, 158, 160, 161, 162, 163, 164], ions: [0, 3] },
    { z: 67, symbol: 'Ho', name: '鈥', isotopes: [165], ions: [0, 3] },
    { z: 68, symbol: 'Er', name: '鉺', isotopes: [162, 164, 166, 167, 168, 170], ions: [0, 3] },
    { z: 69, symbol: 'Tm', name: '銩', isotopes: [169], ions: [0, 3, 2] },
    { z: 70, symbol: 'Yb', name: '鐿', isotopes: [168, 170, 171, 172, 173, 174, 176], ions: [0, 3, 2] },
    { z: 71, symbol: 'Lu', name: '鎦', isotopes: [175, 176], ions: [0, 3] },
    { z: 72, symbol: 'Hf', name: '鉿', isotopes: [174, 176, 177, 178, 179, 180], ions: [0, 4] },
    { z: 73, symbol: 'Ta', name: '鉭', isotopes: [180, 181], ions: [0, 5, 4] },
    { z: 74, symbol: 'W', name: '鎢', isotopes: [180, 182, 183, 184, 186], ions: [0, 6, 4] },
    { z: 75, symbol: 'Re', name: '錸', isotopes: [185, 187], ions: [0, 7, 4] },
    { z: 76, symbol: 'Os', name: '鋨', isotopes: [184, 186, 187, 188, 189, 190, 192], ions: [0, 4] },
    { z: 77, symbol: 'Ir', name: '銥', isotopes: [191, 193], ions: [0, 4, 3] },
    { z: 78, symbol: 'Pt', name: '鉑', isotopes: [190, 192, 194, 195, 196, 198], ions: [0, 4, 2] },
    { z: 79, symbol: 'Au', name: '金', isotopes: [197], ions: [0, 3, 1] },
    { z: 80, symbol: 'Hg', name: '汞', isotopes: [196, 198, 199, 200, 201, 202, 204], ions: [0, 2, 1] },
    { z: 81, symbol: 'Tl', name: '鉈', isotopes: [203, 205], ions: [0, 3, 1] },
    { z: 82, symbol: 'Pb', name: '鉛', isotopes: [204, 206, 207, 208], ions: [0, 4, 2] },
    { z: 83, symbol: 'Bi', name: '鉍', isotopes: [209], ions: [0, 5, 3] },
    { z: 84, symbol: 'Po', name: '釙', isotopes: [209, 210], ions: [0, 4, 2] },
    { z: 85, symbol: 'At', name: '砈', isotopes: [210, 211], ions: [0, -1] },
    { z: 86, symbol: 'Rn', name: '氡', isotopes: [222], ions: [0] },
    { z: 87, symbol: 'Fr', name: '鍅', isotopes: [223], ions: [0, 1] },
    { z: 88, symbol: 'Ra', name: '鐳', isotopes: [226], ions: [0, 2] },
    { z: 89, symbol: 'Ac', name: '錒', isotopes: [227], ions: [0, 3] },
    { z: 90, symbol: 'Th', name: '釷', isotopes: [232], ions: [0, 4] },
    { z: 91, symbol: 'Pa', name: '鏷', isotopes: [231], ions: [0, 5, 4] },
    { z: 92, symbol: 'U', name: '鈾', isotopes: [234, 235, 238], ions: [0, 6, 4] },
    { z: 93, symbol: 'Np', name: '錼', isotopes: [237], ions: [0, 5] },
    { z: 94, symbol: 'Pu', name: '鈽', isotopes: [238, 239, 240, 241, 242, 244], ions: [0, 4] },
    { z: 95, symbol: 'Am', name: '鋂', isotopes: [241, 243], ions: [0, 3] },
    { z: 96, symbol: 'Cm', name: '鋦', isotopes: [247], ions: [0, 3] },
    { z: 97, symbol: 'Bk', name: '鉳', isotopes: [247], ions: [0, 3] },
    { z: 98, symbol: 'Cf', name: '鉲', isotopes: [251], ions: [0, 3] },
    { z: 99, symbol: 'Es', name: '鑀', isotopes: [252], ions: [0, 3] },
    { z: 100, symbol: 'Fm', name: '鐨', isotopes: [257], ions: [0, 3] },
    { z: 101, symbol: 'Md', name: '鍆', isotopes: [256], ions: [0, 3] },
    { z: 102, symbol: 'No', name: '鍩', isotopes: [259], ions: [0, 2] },
];

// Fallback for elements without defined ions
elementsData.forEach(e => {
    if (!e.ions) e.ions = [0];
});


// Shell capabilities
const SHELL_CAPACITIES = [2, 8, 8, 18, 18, 32, 32];
let currentScale = 1;

// Directions for Hex Packing
const DIRECTIONS = [
    { dx: 2, dy: 0 },
    { dx: 1, dy: Math.sqrt(3) },
    { dx: -1, dy: Math.sqrt(3) },
    { dx: -2, dy: 0 },
    { dx: -1, dy: -Math.sqrt(3) },
    { dx: 1, dy: -Math.sqrt(3) },
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
        let cx = layer * 2;
        let cy = 0;

        const correctSideDirs = [
            DIRECTIONS[2], DIRECTIONS[3], DIRECTIONS[4],
            DIRECTIONS[5], DIRECTIONS[0], DIRECTIONS[1]
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
    elementsData.forEach(element => {
        const option = document.createElement('option');
        option.value = element.z;
        option.textContent = `${element.z} - ${element.name} (${element.symbol})`
        atomicNumberSelect.appendChild(option);
    });

    atomicNumberSelect.value = 1;

    atomicNumberSelect.addEventListener('change', handleElementChange);
    isotopeSelect.addEventListener('change', handleIsotopeChange);
    if (chargeSelect) {
        chargeSelect.addEventListener('change', handleChargeChange);
    }
    exportBtn.addEventListener('click', exportImage);

    // New Features
    const exportSymbolBtn = document.getElementById('export-symbol-btn');
    const copyLatexBtn = document.getElementById('copy-latex-btn');

    // Add Listeners if buttons exist (they should)
    if (exportSymbolBtn) exportSymbolBtn.addEventListener('click', exportSymbolImage);
    if (copyLatexBtn) copyLatexBtn.addEventListener('click', copyLatex);

    window.addEventListener('resize', () => {
        resizeCanvas();
        drawCurrentAtom();
    });

    handleElementChange();
    resizeCanvas();
}

function handleElementChange() {
    const z = parseInt(atomicNumberSelect.value);
    const element = elementsData.find(e => e.z === z);
    if (!element) return;

    isotopeSelect.innerHTML = '';
    element.isotopes.forEach(mass => {
        const option = document.createElement('option');
        option.value = mass;
        option.textContent = `${element.name}-${mass} (${element.symbol}-${mass})`;
        isotopeSelect.appendChild(option);
    });
    isotopeSelect.selectedIndex = 0;

    updateChargeOptions(element);

    handleIsotopeChange();
}

function updateChargeOptions(element) {
    if (!chargeSelect) return;
    chargeSelect.innerHTML = '';
    const ions = element.ions || [0];

    ions.forEach(charge => {
        const option = document.createElement('option');
        option.value = charge;

        let label = '';
        if (charge === 0) label = '+0 (中性/Neutral)';
        else if (charge > 0) label = `+${charge}`;
        else label = `${charge}`; // -x

        option.textContent = label;
        chargeSelect.appendChild(option);
    });
    chargeSelect.selectedIndex = 0;
}

function handleIsotopeChange() {
    updateDisplay();
    drawCurrentAtom();
}

function handleChargeChange() {
    updateDisplay();
    drawCurrentAtom();
}

function formatCharge(charge) {
    if (charge === 0) return '';
    const abs = Math.abs(charge);
    const sign = charge > 0 ? '⁺' : '⁻';
    const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

    if (abs === 1) return sign;

    // 2- -> ²⁻
    const numStr = abs.toString().split('').map(d => supers[parseInt(d)]).join('');
    return numStr + sign;
}

function updateDisplay() {
    const z = parseInt(atomicNumberSelect.value);
    const mass = parseInt(isotopeSelect.value);
    const charge = parseInt(chargeSelect ? chargeSelect.value : 0);
    const element = elementsData.find(e => e.z === z);

    let chargeStr = formatCharge(charge);

    elementNameDiv.textContent = `${element.name}-${mass}`;
    elementSymbolDiv.textContent = element.symbol + chargeStr;

    massNumberSpan.textContent = mass;
    atomicNumberDisplaySpan.textContent = z;

    // Update LaTeX
    const latexCodeInput = document.getElementById('latex-code');
    if (latexCodeInput) {
        // Format: {}^{mass}_{z}\text{Symbol}^{charge}
        // Charge Format for latex: 2+, -, + (standard notation) or ^{2+}
        let latexCharge = '';
        if (charge !== 0) {
            const abs = Math.abs(charge);
            const sign = charge > 0 ? '+' : '-';
            // Chemistry notation: 2+ or -
            if (abs === 1) latexCharge = `^{${sign}}`;
            else latexCharge = `^{${abs}${sign}}`;
        }

        // e.g. {}^{23}_{11}\text{Na}^{+}
        const latex = `{}^{${mass}}_{${z}}\\text{${element.symbol}}${latexCharge}`;
        latexCodeInput.value = latex;
    }
}

function copyLatex() {
    const latexCodeInput = document.getElementById('latex-code');
    const copyLatexBtn = document.getElementById('copy-latex-btn');
    if (!latexCodeInput) return;

    latexCodeInput.select();
    latexCodeInput.setSelectionRange(0, 99999); // Mobile

    // Modern Clipboard API
    navigator.clipboard.writeText(latexCodeInput.value).then(() => {
        const originalText = copyLatexBtn.textContent;
        copyLatexBtn.textContent = 'Copied!';
        setTimeout(() => copyLatexBtn.textContent = originalText, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function resizeCanvas() {
    const rightPanel = document.querySelector('.right-panel');
    if (rightPanel) {
        const dpr = window.devicePixelRatio || 1;
        const superSample = 2;
        const scaleFactor = dpr * superSample;

        const rect = rightPanel.getBoundingClientRect();

        canvas.width = rect.width * scaleFactor;
        canvas.height = rect.height * scaleFactor;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
    drawCurrentAtom();
}

function drawCurrentAtom() {
    const z = parseInt(atomicNumberSelect.value);
    const mass = parseInt(isotopeSelect.value);
    const charge = parseInt(chargeSelect ? chargeSelect.value : 0);

    if (isNaN(z) || isNaN(mass)) return;

    const rightPanel = document.querySelector('.right-panel');
    const width = rightPanel ? rightPanel.clientWidth : canvas.width;
    const height = rightPanel ? rightPanel.clientHeight : canvas.height;

    ctx.clearRect(0, 0, width, height);

    const nucleusPositions = generateNucleusPositions(mass);
    const indices = Array.from({ length: mass }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const protonIndices = new Set(indices.slice(0, z));

    let totalElectrons = z - charge;
    if (totalElectrons < 0) totalElectrons = 0;

    const shells = [];
    let electronsLeft = totalElectrons;
    for (const cap of SHELL_CAPACITIES) {
        if (electronsLeft <= 0) break;
        const count = Math.min(electronsLeft, cap);
        shells.push(count);
        electronsLeft -= count;
    }

    const nucleusLayers = Math.ceil((Math.sqrt(mass / 3.0)) || 1);
    const particleRadius = 10;
    const nucleusVisualRadius = nucleusLayers * 2 * particleRadius + 10;
    const shellGap = 40;
    const maxShellRadius = nucleusVisualRadius + shells.length * shellGap;

    const padding = 50;
    const minDim = Math.min(width, height);
    const requiredSize = 2 * maxShellRadius + padding;

    currentScale = minDim / requiredSize;
    if (currentScale <= 0 || !isFinite(currentScale)) currentScale = 1;

    const cx = width / 2;
    const cy = height / 2;

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

        if (isProton) {
            ctx.beginPath();
            const symbolSize = r * 0.6;
            ctx.moveTo(px, py - symbolSize / 2);
            ctx.lineTo(px, py + symbolSize / 2);
            ctx.moveTo(px - symbolSize / 2, py);
            ctx.lineTo(px + symbolSize / 2, py);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2 * currentScale;
            ctx.stroke();
        }
    });

    let shellRadius = nucleusVisualRadius * currentScale;
    shells.forEach((eCount, i) => {
        shellRadius += shellGap * currentScale;
        ctx.beginPath();
        ctx.arc(cx, cy, shellRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1 * currentScale;
        ctx.stroke();

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

            ctx.beginPath();
            const symbolSize = er * 0.6;
            ctx.moveTo(ex - symbolSize / 2, ey);
            ctx.lineTo(ex + symbolSize / 2, ey);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * currentScale;
            ctx.stroke();
        }
    });
}

function exportImage() {
    const link = document.createElement('a');
    let filename = `atom_${elementNameDiv.textContent}`;
    const charge = parseInt(chargeSelect ? chargeSelect.value : 0);
    if (charge !== 0) {
        filename += charge > 0 ? `_plus${charge}` : `_minus${Math.abs(charge)}`;
    }
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportSymbolImage() {
    const z = parseInt(atomicNumberSelect.value);
    const mass = parseInt(isotopeSelect.value);
    const charge = parseInt(chargeSelect ? chargeSelect.value : 0);
    const element = elementsData.find(e => e.z === z);

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tCtx = tempCanvas.getContext('2d');
    const size = 512; // High resolution
    tempCanvas.width = size;
    tempCanvas.height = size;

    // Transparent Background
    tCtx.clearRect(0, 0, size, size);

    // Measurements
    const cx = size / 2;
    const cy = size / 2;

    // Draw Symbol
    tCtx.fillStyle = 'black';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    // Adjust logic for 3-letter symbols (if any) or 2-letter
    // Standard Times New Roman for "Chemical" look
    tCtx.font = 'bold 250px "Times New Roman", Times, serif';
    tCtx.fillText(element.symbol, cx, cy + 20);

    // Measure Symbol width to place numbers around it
    const metrics = tCtx.measureText(element.symbol);
    const halfWidth = metrics.width / 2;

    // Mass Number (Top Left)
    tCtx.font = 'bold 100px "Times New Roman", Times, serif';
    tCtx.textAlign = 'right';
    // Position: Left of symbol, Top aligned (approx)
    tCtx.fillText(mass, cx - halfWidth - 10, cy - 80);

    // Atomic Number (Bottom Left)
    // Position: Left of symbol, Bottom aligned (approx)
    tCtx.fillText(z, cx - halfWidth - 10, cy + 100);

    // Charge (Top Right)
    if (charge !== 0) {
        const abs = Math.abs(charge);
        const sign = charge > 0 ? '+' : '-';
        // Format: 2+, -, + (Standard chemical notation)
        let label = '';
        if (abs === 1) label = sign;
        else label = abs + sign;

        tCtx.textAlign = 'left';
        tCtx.fillText(label, cx + halfWidth + 10, cy - 80);
    }

    // Download
    const link = document.createElement('a');
    let filename = `symbol_${element.symbol}_${mass}`;
    link.download = `${filename}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

init();
