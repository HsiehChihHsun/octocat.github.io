// State
let state = {
    mode: 'ordered', // 'ordered' or 'random'
    display: 'zh',   // 'zh' or 'symbol'
    isPlaying: false,
    currentIndex: -1,
    sequence: [],     // Array of indices into elementsData
    history: [],      // History for random navigation
    historyIndex: -1
};

// DOM Elements
const els = {
    btnOrdered: document.getElementById('btn-ordered'),
    btnRandom: document.getElementById('btn-random'),
    btnZh: document.getElementById('btn-zh'),
    btnSymbol: document.getElementById('btn-symbol'),
    btnHome: document.getElementById('btn-home'),
    btnStart: document.getElementById('btn-start'),
    startOverlay: document.getElementById('start-overlay'),
    elementText: document.getElementById('element-text'),
    navLeft: document.getElementById('nav-left'),
    navRight: document.getElementById('nav-right'),
    body: document.body
};

// Init
function init() {
    bindEvents();
}

function bindEvents() {
    els.btnOrdered.addEventListener('click', () => { if (!state.isPlaying) setMode('ordered'); });
    els.btnRandom.addEventListener('click', () => { if (!state.isPlaying) setMode('random'); });
    els.btnZh.addEventListener('click', () => setDisplay('zh'));
    els.btnSymbol.addEventListener('click', () => setDisplay('symbol'));

    els.btnStart.addEventListener('click', startGame);
    els.btnHome.addEventListener('click', goHome);

    els.navLeft.addEventListener('click', onPrev);
    els.navRight.addEventListener('click', onNext);
}

function setMode(mode) {
    state.mode = mode;
    els.btnOrdered.classList.toggle('active', mode === 'ordered');
    els.btnRandom.classList.toggle('active', mode === 'random');
}

function setDisplay(type) {
    state.display = type;
    els.btnZh.classList.toggle('active', type === 'zh');
    els.btnSymbol.classList.toggle('active', type === 'symbol');
    if (state.isPlaying) {
        renderCurrent();
    }
}

function startGame() {
    state.isPlaying = true;
    els.startOverlay.classList.add('hidden');
    els.btnHome.classList.remove('hidden');

    // Disable Mode buttons
    els.btnOrdered.disabled = true;
    els.btnRandom.disabled = true;
    els.btnOrdered.style.opacity = '0.5';
    els.btnRandom.style.opacity = '0.5';

    // Hide controls except Home? User said "top has a small 'Back to Main' button regardless of when".
    // But didn't ask to hide the others. But usually in "game mode" we might hide settings.
    // The prompt says: "When start button is pressed... display huge text... regardless of when, top has a small home button".
    // It doesn't explicitly say hide the config buttons, but keeping them might be distracting. 
    // However, user example: "Select ordered + zh, Start...".
    // I'll keep them visible for now or maybe disable them? The user didn't specify hiding. I'll leave them.

    // Generate sequence
    if (state.mode === 'ordered') {
        state.sequence = elementsData.map((_, i) => i);
        state.currentIndex = 0;
    } else {
        // Random shuffle
        state.sequence = elementsData.map((_, i) => i);
        shuffleArray(state.sequence);
        state.history = []; // Clear history
        state.historyIndex = -1;

        // Pick first
        const nextIdx = state.sequence.shift(); // Remove from pool
        state.history.push(nextIdx);
        state.historyIndex = 0;
    }

    renderCurrent();
}

function goHome() {
    state.isPlaying = false;
    els.startOverlay.classList.remove('hidden');
    els.btnHome.classList.add('hidden');

    // Enable Mode buttons
    els.btnOrdered.disabled = false;
    els.btnRandom.disabled = false;
    els.btnOrdered.style.opacity = '1';
    els.btnRandom.style.opacity = '1';

    // Reset display
    els.elementText.textContent = '';
    els.body.classList.remove('light-mode');
    els.body.style.backgroundColor = '';
}

function onNext() {
    if (!state.isPlaying) return;

    if (state.mode === 'ordered') {
        if (state.currentIndex < elementsData.length - 1) {
            state.currentIndex++;
            renderCurrent();
        } else {
            // End of list? Loop or stop?
            // "until all elements are shown". 
            // In Album mode, usually stops or loops. I'll stop at the end.
        }
    } else {
        // Random
        // Check if we are browsing back history
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            renderCurrent();
        } else {
            // New random element
            if (state.sequence.length > 0) {
                const nextIdx = state.sequence.shift();
                state.history.push(nextIdx);
                state.historyIndex++;
                renderCurrent();
            } else {
                // All shown
                alert("All elements shown!");
            }
        }
    }
}

function onPrev() {
    if (!state.isPlaying) return;

    if (state.mode === 'ordered') {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            renderCurrent();
        }
    } else {
        // Random
        if (state.historyIndex > 0) {
            state.historyIndex--;
            renderCurrent();
        }
    }
}

function renderCurrent() {
    let dataIndex;
    if (state.mode === 'ordered') {
        dataIndex = state.sequence[state.currentIndex];
    } else {
        dataIndex = state.history[state.historyIndex];
    }

    const element = elementsData[dataIndex];
    if (!element) return;

    // Text
    const text = state.display === 'zh' ? element.z : element.s;
    els.elementText.textContent = text;

    // Color
    const color = element.c;
    const useLight = element.l;

    els.elementText.style.color = color;

    if (useLight) {
        els.body.classList.add('light-mode');
    } else {
        els.body.classList.remove('light-mode');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start
init();
