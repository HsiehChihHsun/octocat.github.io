/**
 * main.js
 * Atomic Spectrum Project Entry Point
 */

// =======================
// Global State & Config
// =======================
const CONFIG = {
    opticAxisY: 0, // Calculated in resize
    sourceX: 50,    // Shifted left
    slitX: 200,     // Shifted left
    lensX: 300,     // Shifted left
    prismX: 500,    // Shifted left
    screenY: 0,     // To be calculated (Floor)
    prismSize: 150,
    prismAngle: Math.PI / 3,
    prismRotation: 15 * (Math.PI / 180),
    dynamicRange: 3.0,
    dispersionScale: 0.3
};

// Data Store
const DATA = {
    elements: [],       // List of element metadata
    spectralLines: {},  // Map of ElementID -> Array of Lines
    currentElement: null
};

// Canvas
const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const barCanvas = document.getElementById('spectrumBarCanvas');
const barCtx = barCanvas.getContext('2d');

// UI Elements
const elementSelect = document.getElementById('elementSelect');
const rangeInput = document.getElementById('dynamicRange');
const rangeValue = document.getElementById('dynamicRangeValue');
// Dispersion Control
const dispersionInput = document.getElementById('dispersionScale');
const dispersionValue = document.getElementById('dispersionScaleValue');

const tooltip = document.getElementById('tooltip');
const hoverWavelengthDisplay = document.getElementById('hoverWavelength');

// =======================
// Initialization
// =======================

async function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load Data
    await loadElements();
    await loadSpectralLines();

    // Setup UI
    populateDropdown();
    setupEventListeners();

    // Start Loop
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    // High-DPI Support
    const dpr = window.devicePixelRatio || 1;

    // Main Canvas (Full Screen)
    // For main canvas, we want it to be window size, so setting style is okay/needed if position:absolute
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.resetTransform(); // Reset before scaling
    ctx.scale(dpr, dpr);

    // Spectrum Bar Canvas
    // Rely on CSS (width: 96%) for the display size.
    // Do NOT set barCanvas.style.width explicitly here or it breaks responsiveness/zoom.
    const barW = barCanvas.clientWidth;
    const barH = 60; // Fixed CSS height usually, or read clientHeight

    barCanvas.width = barW * dpr;
    barCanvas.height = barH * dpr;

    // Reset transform before new scale
    barCtx.resetTransform();
    barCtx.scale(dpr, dpr);

    // Optic Axis is vertically centered
    CONFIG.opticAxisY = window.innerHeight / 2 - 50;
    // Screen is now a "Floor" above the spectrum bar
    // Bar is ~100px high at bottom. Let's put screen at canvas.height - 120
    // Use logical pixels (divided by dpr if using canvas.height, but canvas.height is physical)
    // Better to use window.innerHeight
    CONFIG.screenY = window.innerHeight - 110;

    drawSpectrumBar(); // Redraw static bar if resized
}

// =======================
// Data Loading (Embedded)
// =======================

async function loadElements() {
    // Import from elements.csv
    const rawData = [
        { id: "H", name: "氫", atomicNumber: "1", desc: "宇宙中最豐富的元素...", note: "非金屬" },
        { id: "He", name: "氦", atomicNumber: "2", desc: "惰性氣體", note: "惰性氣體" },
        { id: "Li", name: "鋰", atomicNumber: "3", desc: "最輕的金屬", note: "鹼金屬" },
        { id: "Ne", name: "氖", atomicNumber: "10", desc: "霓虹燈中的氣體", note: "惰性氣體" },
        { id: "Na", name: "鈉", atomicNumber: "11", desc: "活性很強的鹼金屬", note: "鹼金屬" },
        { id: "K", name: "鉀", atomicNumber: "19", desc: "植物生長必需", note: "鹼金屬" },
        { id: "Ca", name: "鈣", atomicNumber: "20", desc: "骨骼和牙齒的主要成分", note: "鹼土金屬" },
        { id: "Fe", name: "鐵", atomicNumber: "26", desc: "最常用的結構金屬", note: "過渡金屬" },
        { id: "Hg", name: "汞", atomicNumber: "80", desc: "液態金屬", note: "過渡金屬" }
    ];
    DATA.elements = rawData;
}

async function loadSpectralLines() {
    // Import from spectral_lines.csv
    const rawLines = [
        // H
        { id: "H", wl: 656.28, i: 1.0000 }, { id: "H", wl: 486.13, i: 0.3600 }, { id: "H", wl: 434.05, i: 0.1800 },
        { id: "H", wl: 410.17, i: 0.1400 }, { id: "H", wl: 397.01, i: 0.0600 }, { id: "H", wl: 388.91, i: 0.1400 },
        { id: "H", wl: 383.54, i: 0.0600 },
        // He
        { id: "He", wl: 587.56, i: 1.0000 }, { id: "He", wl: 706.52, i: 0.4000 }, { id: "He", wl: 501.57, i: 0.2000 },
        { id: "He", wl: 492.19, i: 0.0400 }, { id: "He", wl: 471.31, i: 0.0600 }, { id: "He", wl: 447.15, i: 0.4000 },
        { id: "He", wl: 402.62, i: 0.1000 }, { id: "He", wl: 396.47, i: 0.0400 }, { id: "He", wl: 387.18, i: 1.0000 },
        // Li
        { id: "Li", wl: 670.79, i: 1.0000 }, { id: "Li", wl: 670.78, i: 1.0000 }, { id: "Li", wl: 610.37, i: 0.0900 },
        { id: "Li", wl: 610.35, i: 0.0900 }, { id: "Li", wl: 497.17, i: 0.0050 }, { id: "Li", wl: 460.29, i: 0.0080 },
        { id: "Li", wl: 427.31, i: 0.0120 }, { id: "Li", wl: 413.26, i: 0.0230 }, { id: "Li", wl: 391.53, i: 0.0200 },
        // Ne (Updated)
        { id: "Ne", wl: 350.12, i: 0.02 }, { id: "Ne", wl: 351.52, i: 0.02 }, { id: "Ne", wl: 352.05, i: 0.1 },
        { id: "Ne", wl: 359.35, i: 0.05 }, { id: "Ne", wl: 359.36, i: 0.03 }, { id: "Ne", wl: 360.02, i: 0.01 },
        { id: "Ne", wl: 363.37, i: 0.01 }, { id: "Ne", wl: 368.22, i: 0.01 }, { id: "Ne", wl: 368.57, i: 0.01 },
        { id: "Ne", wl: 370.12, i: 0.004 }, { id: "Ne", wl: 453.78, i: 0.1 }, { id: "Ne", wl: 470.44, i: 0.15 },
        { id: "Ne", wl: 470.89, i: 0.12 }, { id: "Ne", wl: 471.01, i: 0.1 }, { id: "Ne", wl: 471.21, i: 0.15 },
        { id: "Ne", wl: 471.53, i: 0.15 }, { id: "Ne", wl: 475.27, i: 0.05 }, { id: "Ne", wl: 478.89, i: 0.1 },
        { id: "Ne", wl: 479.02, i: 0.05 }, { id: "Ne", wl: 482.73, i: 0.1 }, { id: "Ne", wl: 488.49, i: 0.1 },
        { id: "Ne", wl: 500.52, i: 0.05 }, { id: "Ne", wl: 503.78, i: 0.05 }, { id: "Ne", wl: 514.49, i: 0.05 },
        { id: "Ne", wl: 533.08, i: 0.06 }, { id: "Ne", wl: 534.11, i: 0.1 }, { id: "Ne", wl: 534.33, i: 0.06 },
        { id: "Ne", wl: 540.06, i: 0.2 }, { id: "Ne", wl: 556.28, i: 0.05 }, { id: "Ne", wl: 565.67, i: 0.05 },
        { id: "Ne", wl: 571.92, i: 0.05 }, { id: "Ne", wl: 574.83, i: 0.05 }, { id: "Ne", wl: 576.44, i: 0.07 },
        { id: "Ne", wl: 580.44, i: 0.05 }, { id: "Ne", wl: 582.02, i: 0.05 }, { id: "Ne", wl: 585.25, i: 0.2 },
        { id: "Ne", wl: 587.28, i: 0.05 }, { id: "Ne", wl: 588.19, i: 0.1 }, { id: "Ne", wl: 590.25, i: 0.005 },
        { id: "Ne", wl: 590.64, i: 0.005 }, { id: "Ne", wl: 594.48, i: 0.05 }, { id: "Ne", wl: 596.55, i: 0.05 },
        { id: "Ne", wl: 597.46, i: 0.05 }, { id: "Ne", wl: 597.55, i: 0.06 }, { id: "Ne", wl: 598.79, i: 0.015 },
        { id: "Ne", wl: 603.00, i: 0.1 }, { id: "Ne", wl: 607.43, i: 0.1 }, { id: "Ne", wl: 609.62, i: 0.03 },
        { id: "Ne", wl: 612.84, i: 0.01 }, { id: "Ne", wl: 614.31, i: 0.1 }, { id: "Ne", wl: 616.36, i: 0.1 },
        { id: "Ne", wl: 618.21, i: 0.015 }, { id: "Ne", wl: 621.73, i: 0.1 }, { id: "Ne", wl: 626.65, i: 0.1 },
        { id: "Ne", wl: 630.48, i: 0.01 }, { id: "Ne", wl: 632.82, i: 0.03 }, { id: "Ne", wl: 633.44, i: 0.1 },
        { id: "Ne", wl: 638.30, i: 0.1 }, { id: "Ne", wl: 640.22, i: 0.2 }, { id: "Ne", wl: 650.65, i: 0.15 },
        { id: "Ne", wl: 653.29, i: 0.01 }, { id: "Ne", wl: 659.90, i: 0.1 }, { id: "Ne", wl: 665.21, i: 0.015 },
        { id: "Ne", wl: 667.83, i: 0.05 }, { id: "Ne", wl: 671.70, i: 0.007 }, { id: "Ne", wl: 692.95, i: 1 },
        { id: "Ne", wl: 702.41, i: 0.3 }, { id: "Ne", wl: 703.24, i: 0.8 }, { id: "Ne", wl: 705.13, i: 0.02 },
        { id: "Ne", wl: 705.91, i: 0.1 }, { id: "Ne", wl: 717.39, i: 0.8 }, { id: "Ne", wl: 724.52, i: 0.8 },
        { id: "Ne", wl: 747.24, i: 0.03 }, { id: "Ne", wl: 748.89, i: 0.3 }, { id: "Ne", wl: 753.58, i: 0.3 },
        { id: "Ne", wl: 754.40, i: 0.13 }, { id: "Ne", wl: 772.46, i: 0.001 },
        // Na
        { id: "Na", wl: 589.59, i: 0.5000 }, { id: "Na", wl: 589.00, i: 1.0000 }, { id: "Na", wl: 562.10, i: 0.0005 },
        { id: "Na", wl: 516.25, i: 0.0010 }, { id: "Na", wl: 507.12, i: 0.0034 }, { id: "Na", wl: 443.23, i: 0.0040 },
        { id: "Na", wl: 428.67, i: 0.0005 }, { id: "Na", wl: 420.49, i: 0.0006 }, { id: "Na", wl: 418.55, i: 0.0020 },
        { id: "Na", wl: 417.67, i: 0.0010 }, { id: "Na", wl: 392.56, i: 0.0010 }, { id: "Na", wl: 391.79, i: 0.0020 },
        { id: "Na", wl: 388.18, i: 0.0052 }, { id: "Na", wl: 386.55, i: 0.0016 },
        // K
        { id: "K", wl: 404.41, i: 0.7000 }, { id: "K", wl: 404.72, i: 0.7000 }, { id: "K", wl: 464.19, i: 0.4000 },
        { id: "K", wl: 464.24, i: 0.4000 }, { id: "K", wl: 474.09, i: 0.1500 }, { id: "K", wl: 474.44, i: 0.2500 },
        { id: "K", wl: 475.39, i: 0.2000 }, { id: "K", wl: 475.74, i: 0.3000 }, { id: "K", wl: 478.65, i: 0.2000 },
        { id: "K", wl: 479.11, i: 0.3000 }, { id: "K", wl: 479.98, i: 0.2500 }, { id: "K", wl: 480.44, i: 0.3000 },
        { id: "K", wl: 484.99, i: 0.3000 }, { id: "K", wl: 485.61, i: 0.3000 }, { id: "K", wl: 486.35, i: 0.3000 },
        { id: "K", wl: 486.98, i: 0.4000 }, { id: "K", wl: 494.20, i: 0.3000 }, { id: "K", wl: 495.08, i: 0.4000 },
        { id: "K", wl: 495.62, i: 0.4000 }, { id: "K", wl: 496.50, i: 0.4000 }, { id: "K", wl: 508.42, i: 0.4000 },
        { id: "K", wl: 509.72, i: 0.4000 }, { id: "K", wl: 509.92, i: 0.4000 }, { id: "K", wl: 511.23, i: 0.5000 },
        { id: "K", wl: 532.33, i: 0.5000 }, { id: "K", wl: 533.97, i: 0.5000 }, { id: "K", wl: 534.30, i: 0.5000 },
        { id: "K", wl: 535.96, i: 0.6000 }, { id: "K", wl: 578.24, i: 0.6000 }, { id: "K", wl: 580.18, i: 0.7000 },
        { id: "K", wl: 581.22, i: 0.6000 }, { id: "K", wl: 583.19, i: 0.7000 }, { id: "K", wl: 691.11, i: 0.8000 },
        { id: "K", wl: 693.63, i: 0.5000 }, { id: "K", wl: 693.88, i: 0.8000 }, { id: "K", wl: 696.42, i: 0.3000 },
        { id: "K", wl: 696.47, i: 0.5000 }, { id: "K", wl: 766.49, i: 1.0000 }, { id: "K", wl: 769.90, i: 1.0000 },
        // Ca
        { id: "Ca", wl: 422.67, i: 1.0000 }, { id: "Ca", wl: 430.25, i: 0.5000 }, { id: "Ca", wl: 430.77, i: 0.5000 },
        { id: "Ca", wl: 442.54, i: 0.5000 }, { id: "Ca", wl: 443.50, i: 0.5000 }, { id: "Ca", wl: 443.57, i: 0.5000 },
        { id: "Ca", wl: 445.48, i: 0.6000 }, { id: "Ca", wl: 445.59, i: 0.6000 }, { id: "Ca", wl: 445.66, i: 0.4000 },
        { id: "Ca", wl: 487.81, i: 0.5000 }, { id: "Ca", wl: 518.88, i: 0.5000 }, { id: "Ca", wl: 526.56, i: 0.5000 },
        { id: "Ca", wl: 527.03, i: 0.5000 }, { id: "Ca", wl: 534.95, i: 0.5000 }, { id: "Ca", wl: 558.20, i: 0.5000 },
        { id: "Ca", wl: 558.88, i: 0.5000 }, { id: "Ca", wl: 559.01, i: 0.5000 }, { id: "Ca", wl: 559.45, i: 0.5000 },
        { id: "Ca", wl: 559.85, i: 0.5000 }, { id: "Ca", wl: 585.75, i: 0.6000 }, { id: "Ca", wl: 610.27, i: 0.5000 },
        { id: "Ca", wl: 612.22, i: 0.6000 }, { id: "Ca", wl: 616.22, i: 0.6000 }, { id: "Ca", wl: 616.91, i: 0.5000 },
        { id: "Ca", wl: 616.96, i: 0.6000 }, { id: "Ca", wl: 643.91, i: 0.7000 }, { id: "Ca", wl: 644.98, i: 0.6000 },
        { id: "Ca", wl: 646.26, i: 0.7000 }, { id: "Ca", wl: 647.17, i: 0.6000 }, { id: "Ca", wl: 649.38, i: 0.6000 },
        { id: "Ca", wl: 649.96, i: 0.6000 }, { id: "Ca", wl: 657.28, i: 0.5000 }, { id: "Ca", wl: 671.77, i: 0.6000 },
        { id: "Ca", wl: 714.81, i: 0.7000 }, { id: "Ca", wl: 720.22, i: 0.6000 }, { id: "Ca", wl: 732.61, i: 0.7000 },
        // Hg
        { id: "Hg", wl: 365.02, i: 0.6000 }, { id: "Hg", wl: 365.48, i: 0.0700 }, { id: "Hg", wl: 366.33, i: 0.0500 },
        { id: "Hg", wl: 404.66, i: 0.4000 }, { id: "Hg", wl: 433.92, i: 0.0600 }, { id: "Hg", wl: 434.75, i: 0.1000 },
        { id: "Hg", wl: 435.83, i: 1.0000 }, { id: "Hg", wl: 546.07, i: 0.5000 }, { id: "Hg", wl: 576.96, i: 0.0500 },
        { id: "Hg", wl: 579.07, i: 0.0600 }, { id: "Hg", wl: 708.19, i: 0.0250 },
        // Fe
        { id: "Fe", wl: 352.13, i: 0.0430 }, { id: "Fe", wl: 352.60, i: 0.0570 }, { id: "Fe", wl: 354.11, i: 0.0430 },
        { id: "Fe", wl: 355.49, i: 0.0570 }, { id: "Fe", wl: 355.85, i: 0.0570 }, { id: "Fe", wl: 356.54, i: 0.1430 },
        { id: "Fe", wl: 357.01, i: 0.1710 }, { id: "Fe", wl: 357.03, i: 0.1140 }, { id: "Fe", wl: 358.12, i: 0.8570 },
        { id: "Fe", wl: 358.53, i: 0.0430 }, { id: "Fe", wl: 358.70, i: 0.0570 }, { id: "Fe", wl: 360.67, i: 0.0710 },
        { id: "Fe", wl: 360.89, i: 0.2140 }, { id: "Fe", wl: 361.88, i: 0.2140 }, { id: "Fe", wl: 363.15, i: 0.1710 },
        { id: "Fe", wl: 364.78, i: 0.2140 }, { id: "Fe", wl: 367.99, i: 0.2140 }, { id: "Fe", wl: 368.75, i: 0.0710 },
        { id: "Fe", wl: 370.56, i: 0.1710 }, { id: "Fe", wl: 370.79, i: 0.0430 }, { id: "Fe", wl: 370.92, i: 0.0860 },
        { id: "Fe", wl: 371.99, i: 0.8570 }, { id: "Fe", wl: 372.26, i: 0.2140 }, { id: "Fe", wl: 372.76, i: 0.0710 },
        { id: "Fe", wl: 373.33, i: 0.1710 }, { id: "Fe", wl: 373.49, i: 1.0000 }, { id: "Fe", wl: 373.71, i: 0.8570 },
        { id: "Fe", wl: 374.34, i: 0.0570 }, { id: "Fe", wl: 374.56, i: 0.8570 }, { id: "Fe", wl: 374.59, i: 0.1710 },
        { id: "Fe", wl: 374.83, i: 0.4290 }, { id: "Fe", wl: 374.95, i: 0.5710 }, { id: "Fe", wl: 375.82, i: 0.4290 },
        { id: "Fe", wl: 376.00, i: 0.0570 }, { id: "Fe", wl: 376.38, i: 0.2140 }, { id: "Fe", wl: 376.55, i: 0.0570 },
        { id: "Fe", wl: 376.72, i: 0.0860 }, { id: "Fe", wl: 379.50, i: 0.0570 }, { id: "Fe", wl: 379.95, i: 0.0570 },
        { id: "Fe", wl: 381.30, i: 0.0860 }, { id: "Fe", wl: 381.58, i: 0.2140 }, { id: "Fe", wl: 382.04, i: 0.7140 },
        { id: "Fe", wl: 382.44, i: 0.3570 }, { id: "Fe", wl: 382.59, i: 0.2140 }, { id: "Fe", wl: 382.78, i: 0.1710 },
        { id: "Fe", wl: 383.42, i: 0.1430 }, { id: "Fe", wl: 384.04, i: 0.0710 }, { id: "Fe", wl: 384.10, i: 0.1140 },
        { id: "Fe", wl: 385.64, i: 0.3570 }, { id: "Fe", wl: 385.99, i: 0.7140 }, { id: "Fe", wl: 387.86, i: 0.2140 },
        { id: "Fe", wl: 388.63, i: 0.4290 }, { id: "Fe", wl: 388.85, i: 0.0430 }, { id: "Fe", wl: 389.57, i: 0.1140 },
        { id: "Fe", wl: 389.97, i: 0.1710 }, { id: "Fe", wl: 390.29, i: 0.0570 }, { id: "Fe", wl: 392.03, i: 0.0860 },
        { id: "Fe", wl: 392.29, i: 0.1710 }, { id: "Fe", wl: 392.79, i: 0.1710 }, { id: "Fe", wl: 393.03, i: 0.2860 },
        { id: "Fe", wl: 400.52, i: 0.0570 }, { id: "Fe", wl: 404.58, i: 0.4290 }, { id: "Fe", wl: 406.36, i: 0.2140 },
        { id: "Fe", wl: 407.17, i: 0.1710 }, { id: "Fe", wl: 413.21, i: 0.0570 }, { id: "Fe", wl: 414.39, i: 0.1140 },
        { id: "Fe", wl: 420.20, i: 0.0430 }, { id: "Fe", wl: 421.62, i: 0.0570 }, { id: "Fe", wl: 425.08, i: 0.0430 },
        { id: "Fe", wl: 426.05, i: 0.1140 }, { id: "Fe", wl: 427.18, i: 0.1710 }, { id: "Fe", wl: 428.24, i: 0.1710 },
        { id: "Fe", wl: 430.79, i: 0.1710 }, { id: "Fe", wl: 432.58, i: 0.2140 }, { id: "Fe", wl: 437.59, i: 0.1140 },
        { id: "Fe", wl: 438.35, i: 0.2860 }, { id: "Fe", wl: 440.48, i: 0.1710 }, { id: "Fe", wl: 441.51, i: 0.0430 },
        { id: "Fe", wl: 442.73, i: 0.0860 }, { id: "Fe", wl: 446.17, i: 0.0570 }, { id: "Fe", wl: 492.05, i: 0.0710 },
        { id: "Fe", wl: 495.76, i: 0.2140 }, { id: "Fe", wl: 516.75, i: 0.3570 }, { id: "Fe", wl: 517.16, i: 0.0710 },
        { id: "Fe", wl: 522.72, i: 0.1430 }, { id: "Fe", wl: 526.95, i: 0.1710 }, { id: "Fe", wl: 527.04, i: 0.1140 },
        { id: "Fe", wl: 532.80, i: 0.1140 }, { id: "Fe", wl: 532.85, i: 0.0430 }, { id: "Fe", wl: 534.10, i: 0.0710 },
        { id: "Fe", wl: 537.15, i: 0.0570 }, { id: "Fe", wl: 539.71, i: 0.0430 }
    ];

    rawLines.forEach(line => {
        if (!DATA.spectralLines[line.id]) {
            DATA.spectralLines[line.id] = [];
        }
        DATA.spectralLines[line.id].push({
            wavelength: line.wl,
            intensity: line.i
        });
    });
}

function populateDropdown() {
    elementSelect.innerHTML = '';
    DATA.elements.forEach(el => {
        const option = document.createElement('option');
        option.value = el.id;
        option.textContent = `${el.atomicNumber}. ${el.name} (${el.id}) - ${el.note}`;
        elementSelect.appendChild(option);
    });

    if (DATA.elements.length > 0) {
        elementSelect.value = "H";
        onElementChange("H");
    }
}

// =======================
// Logic & Interaction
// =======================

function setupEventListeners() {
    elementSelect.addEventListener('change', (e) => {
        onElementChange(e.target.value);
    });

    rangeInput.addEventListener('input', (e) => {
        CONFIG.dynamicRange = parseFloat(e.target.value);
        rangeValue.textContent = CONFIG.dynamicRange.toFixed(1);
        drawSpectrumBar();
    });

    dispersionInput.addEventListener('input', (e) => {
        CONFIG.dispersionScale = parseFloat(e.target.value);
        dispersionValue.textContent = CONFIG.dispersionScale.toFixed(1);
    });

    barCanvas.addEventListener('mousemove', (e) => {
        const rect = barCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        // Updated Range: 350 - 780
        const wl = 350 + (x / width) * (780 - 350);

        hoverWavelengthDisplay.textContent = `${Math.round(wl)} nm`;

        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY - 30}px`;

        const color = spectralColorConverter(wl, 1.0, 1.0).css;
        tooltip.style.borderColor = color;
        tooltip.innerHTML = `<span style="color:${color}">●</span> ${wl.toFixed(1)} nm`;
    });

    barCanvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        hoverWavelengthDisplay.textContent = '-- nm';
    });
}

function onElementChange(id) {
    const el = DATA.elements.find(e => e.id === id);
    DATA.currentElement = {
        meta: el,
        lines: DATA.spectralLines[id] || []
    };
    drawSpectrumBar();
}

// =======================
// Main Drawing Loop
// =======================

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBench();

    if (DATA.currentElement) {
        drawSource();
        drawRays();
    }

    requestAnimationFrame(animate);
}

// --- Drawing Helpers ---

function drawBench() {
    const axisY = CONFIG.opticAxisY;

    // 1. Lamp Box
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(CONFIG.sourceX - 20, axisY - 60, 40, 120);

    // 2. Slit
    ctx.fillStyle = '#222';
    ctx.fillRect(CONFIG.slitX - 2, axisY - 50, 4, 100);
    ctx.fillStyle = '#000';
    ctx.fillRect(CONFIG.slitX - 2, axisY - 2, 4, 4);

    // 3. Lens
    ctx.beginPath();
    ctx.ellipse(CONFIG.lensX, axisY, 5, 40, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(200, 240, 255, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 240, 255, 0.4)";
    ctx.stroke();

    // 4. Prism (Vertex Up)
    const size = CONFIG.prismSize;
    // H = S * sin(60).
    const h = size * Math.sin(Math.PI / 3);

    ctx.save();
    ctx.translate(CONFIG.prismX, axisY);
    ctx.rotate(CONFIG.prismRotation); // Apply matching rotation (CW)

    ctx.beginPath();
    ctx.moveTo(0, -h / 2); // Top
    ctx.lineTo(size / 2, h / 2); // Bottom Right
    ctx.lineTo(-size / 2, h / 2); // Bottom Left
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.stroke();

    ctx.restore();

    ctx.restore();

    // 5. Screen (Floor)
    const floorY = CONFIG.screenY;
    ctx.fillStyle = '#222';
    // Draw a long horizontal bar representing the screen
    ctx.fillRect(CONFIG.prismX + 50, floorY, canvas.width - (CONFIG.prismX + 50), 4);
}

function drawSource() {
    const colorObj = calculateMixedColor(DATA.currentElement.lines);
    const axisY = CONFIG.opticAxisY;

    // Construct CSS strings
    const baseRgb = `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;
    // Dynamic alpha based on fallback status
    const alphaStart = colorObj.isFallback ? 0.2 : 0.8;
    const alphaEnd = colorObj.isFallback ? 0.05 : 0.1;

    const baseRgbaStart = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alphaStart})`;
    const baseRgbaEnd = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alphaEnd})`;

    // Tube Glow
    ctx.save();
    ctx.shadowColor = baseRgb;
    ctx.shadowBlur = 20;
    ctx.fillStyle = baseRgb;
    ctx.fillRect(CONFIG.sourceX - 5, axisY - 50, 10, 100);
    ctx.restore();

    // Light Cone (Source -> Slit)
    const grad = ctx.createLinearGradient(CONFIG.sourceX, axisY, CONFIG.slitX, axisY);
    grad.addColorStop(0, baseRgbaStart);
    grad.addColorStop(1, baseRgbaEnd);

    // APPLY THE GRADIENT!
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(CONFIG.sourceX + 10, axisY - 10);
    ctx.lineTo(CONFIG.slitX, axisY - 40);
    ctx.lineTo(CONFIG.slitX, axisY + 40);
    ctx.lineTo(CONFIG.sourceX + 10, axisY + 10);
    ctx.fill();
}

// =======================
// Vector Math Helpers
// =======================
function vecSub(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y }; }
function vecAdd(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y }; }
function vecScale(v, s) { return { x: v.x * s, y: v.y * s }; }
function vecDot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
function vecCross(v1, v2) { return v1.x * v2.y - v1.y * v2.x; }
function vecLen(v) { return Math.sqrt(v.x * v.x + v.y * v.y); }
function vecNorm(v) {
    const l = vecLen(v);
    return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
}

// Vector Refraction (Snell's Law)
function refract(I, N, n1, n2) {
    const r = n1 / n2;
    const c = -vecDot(N, I); // cos(theta1)

    // Determine effective Normal (must oppose I)
    let effN = N;
    let cosTheta1 = c;
    if (c < 0) {
        effN = vecScale(N, -1);
        cosTheta1 = -c;
    }

    const sin2Theta2 = r * r * (1 - cosTheta1 * cosTheta1);

    if (sin2Theta2 > 1.0) {
        return { ray: { x: 0, y: 0 }, tir: true }; // TIR
    }

    const cosTheta2 = Math.sqrt(1 - sin2Theta2);

    // T = r*I + (r*c - sqrt(1-r^2(1-c^2))) * N
    const term1 = vecScale(I, r);
    const term2 = vecScale(effN, (r * cosTheta1 - cosTheta2));
    const output = vecAdd(term1, term2);

    return { ray: vecNorm(output), tir: false };
}

// Intersect Ray P + t*D with Segment A-B
function intersectRaySegmentVector(P, D, A, B) {
    const v1 = vecSub(P, A);
    const v2 = vecSub(B, A);
    const v3 = { x: -D.y, y: D.x }; // Perpendicular to D

    const dot = vecDot(v2, v3);
    if (Math.abs(dot) < 1e-6) return null;

    const AP = vecSub(A, P);
    const AB = vecSub(B, A);

    const D_x_AB = vecCross(D, AB);
    if (Math.abs(D_x_AB) < 1e-6) return null;

    const t = vecCross(AP, AB) / D_x_AB;
    const u = vecCross(AP, D) / D_x_AB;

    if (t > 1e-3 && u >= 0 && u <= 1) {
        return {
            pos: vecAdd(P, vecScale(D, t)),
            dist: t,
            normal: vecNorm({ x: -AB.y, y: AB.x })
        };
    }
    return null;
}

function drawRays() {
    const axisY = CONFIG.opticAxisY;
    const lines = DATA.currentElement.lines;
    // Calculate Base Color for Initial Beam
    const colorObj = calculateMixedColor(lines);
    const beamColor = `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;

    let maxWidth = 0;
    lines.forEach(line => {
        let w = 1 + 3 * line.intensity * CONFIG.dynamicRange;
        w = Math.min(w, 4.0);
        if (w > maxWidth) maxWidth = w;
    });
    // Strict Cap for Initial Beam to match brightest possible line
    maxWidth = Math.min(maxWidth, 4.0);
    // Ensure at least visible
    maxWidth = Math.max(maxWidth, 1.0);

    // --- Define Prism Geometry (Vertices) ---
    // User wants CW rotation. In Canvas (Y down), +Angle is CW rotation.
    const size = CONFIG.prismSize;
    const h = size * Math.sin(Math.PI / 3);
    const rot = CONFIG.prismRotation;

    const cx = CONFIG.prismX;
    const cy = axisY;

    function rotatePt(x, y) {
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        return {
            x: cx + (x * c - y * s),
            y: cy + (x * s + y * c)
        };
    }

    const pTop = rotatePt(0, -h / 2);
    const pBotLeft = rotatePt(-size / 2, h / 2);
    const pBotRight = rotatePt(size / 2, h / 2);

    // --- Segment 1: Ray Lens -> Prism ---
    const origin = { x: CONFIG.lensX, y: axisY };
    const initialDir = { x: 1, y: 0 };

    // Intersect with Left Face (Top -> BotLeft)
    let hit1 = intersectRaySegmentVector(origin, initialDir, pTop, pBotLeft);

    // Fallback?
    if (!hit1) {
        hit1 = { pos: { x: CONFIG.prismX - 20, y: axisY }, normal: { x: -1, y: 0 } };
    }

    // Draw Beam 1
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = maxWidth;
    ctx.globalCompositeOperation = 'screen';
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(CONFIG.slitX, axisY);
    ctx.lineTo(hit1.pos.x, hit1.pos.y);
    ctx.stroke();

    // Iterate Lines
    lines.forEach(line => {
        const colorObj = spectralColorConverter(line.wavelength, line.intensity, CONFIG.dynamicRange);
        const nGlass = getRefractiveIndex(line.wavelength, CONFIG.dispersionScale);

        // 1. Refract at Left Face (Air -> Glass)
        let N1 = hit1.normal;
        if (vecDot(N1, initialDir) > 0) N1 = vecScale(N1, -1);

        const ref1 = refract(initialDir, N1, 1.0, nGlass);
        if (ref1.tir) return;
        const dirInside = ref1.ray;

        // 2. Intersect Right Face (Top -> BotRight)
        const nudge = vecScale(dirInside, 0.1);
        const startInside = vecAdd(hit1.pos, nudge);

        const hit2 = intersectRaySegmentVector(startInside, dirInside, pTop, pBotRight);

        if (hit2) {
            // 3. Refract at Right Face (Glass -> Air)
            let N2 = hit2.normal;

            const ref2 = refract(dirInside, N2, nGlass, 1.0);

            if (!ref2.tir) {
                const dirOut = ref2.ray;

                // Screen is now horizontal at Y = CONFIG.screenY
                // Ray: P = hit2.pos, D = dirOut
                // Intersection with Y = floorY: P.y + t*D.y = floorY => t = (floorY - P.y) / D.y

                // We only care if ray is going DOWN (D.y > 0)
                if (dirOut.y > 0) {
                    const tScreen = (CONFIG.screenY - hit2.pos.y) / dirOut.y;

                    if (tScreen > 0) {
                        const hitScreenX = hit2.pos.x + tScreen * dirOut.x;

                        // Draw Internal
                        ctx.strokeStyle = colorObj.css;
                        let w = 1 + 3 * line.intensity * CONFIG.dynamicRange;
                        w = Math.min(w, 4.0); // Strict Cap
                        ctx.lineWidth = w;

                        ctx.beginPath();
                        ctx.moveTo(hit1.pos.x, hit1.pos.y);
                        ctx.lineTo(hit2.pos.x, hit2.pos.y);
                        ctx.stroke();

                        // Draw External
                        ctx.beginPath();
                        ctx.moveTo(hit2.pos.x, hit2.pos.y);
                        ctx.lineTo(hitScreenX, CONFIG.screenY);
                        ctx.stroke();

                        // Spot
                        ctx.save();
                        ctx.shadowColor = colorObj.css;
                        ctx.shadowBlur = 10 * line.intensity + 5;
                        ctx.fillStyle = colorObj.css;

                        // Horizontal spot on floor
                        ctx.beginPath();
                        ctx.ellipse(hitScreenX, CONFIG.screenY, 4 + 10 * line.intensity, 3, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }
        }
    });
}

function drawSpectrumBar() {
    // Use logical CSS width
    const w = barCanvas.clientWidth;
    const h = barCanvas.clientHeight; // Fixed 60 usually

    barCtx.clearRect(0, 0, w, h);

    const grad = barCtx.createLinearGradient(0, 0, w, 0);
    // Updated Loop for 350-780 range
    for (let wl = 350; wl <= 780; wl += 10) {
        const t = (wl - 350) / (780 - 350);
        const color = spectralColorConverter(wl, 1.0, 1.0).css;
        grad.addColorStop(t, color);
    }
    barCtx.fillStyle = grad;
    barCtx.fillRect(0, 0, w, h);

    barCtx.fillStyle = '#000';
    barCtx.fillRect(0, 0, w, h);

    if (DATA.currentElement) {
        DATA.currentElement.lines.forEach(line => {
            const wl = line.wavelength;
            if (wl < 350 || wl > 780) return; // Update limits

            const x = ((wl - 350) / (780 - 350)) * w;
            const colorObj = spectralColorConverter(wl, line.intensity, CONFIG.dynamicRange);

            let lineWidth = 1 + 3 * line.intensity * CONFIG.dynamicRange;
            lineWidth = Math.min(lineWidth, 4.0);

            barCtx.save();
            barCtx.globalCompositeOperation = 'screen';
            barCtx.shadowColor = colorObj.css;
            barCtx.shadowBlur = 5;
            barCtx.fillStyle = colorObj.css;
            barCtx.fillRect(x - lineWidth / 2, 0, lineWidth, h);
            barCtx.restore();
        });
    }
}

// Start
init();
