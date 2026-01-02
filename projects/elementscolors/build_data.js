const fs = require('fs');
const path = require('path');

const csvPath = 'c:/dev/elements/elements.csv';
const mhtmlPath = 'c:/dev/elements/Color for all the elements in the Periodic Table.mhtml';
const outputPath = 'c:/dev/elements/data.js';

const zhNames = {
    1: '氫', 2: '氦', 3: '鋰', 4: '鈹', 5: '硼', 6: '碳', 7: '氮', 8: '氧', 9: '氟', 10: '氖',
    11: '鈉', 12: '鎂', 13: '鋁', 14: '矽', 15: '磷', 16: '硫', 17: '氯', 18: '氬', 19: '鉀', 20: '鈣',
    21: '鈧', 22: '鈦', 23: '釩', 24: '鉻', 25: '錳', 26: '鐵', 27: '鈷', 28: '鎳', 29: '銅', 30: '鋅',
    31: '鎵', 32: '鍺', 33: '砷', 36: '氪', 37: '銣', 47: '銀', 49: '銦', 50: '錫', 53: '碘', 54: '氙',
    55: '銫', 56: '鋇', 74: '鎢', 78: '鉑', 79: '金', 80: '汞', 82: '鉛', 86: '氡', 87: '鍅', 88: '鐳', 92: '鈾'
};

const colorMap = {
    'Colorless': '#FFFFFF',
    'Silver': '#C0C0C0',
    'SlateGray': '#708090',
    'Gray': '#808080',
    'Black': '#000000',
    'Yellow': '#FFFF00',
    'Copper': '#B87333',
    'Gold': '#FFD700',
    'Red': '#FF0000',
    'Violet': '#EE82EE',
    'Blue': '#0000FF',
    'Orange': '#FFA500',
    'Green': '#008000'
    // Add more if discovered
};

// Elements requiring light background (dark text)
const darkColors = new Set(['Black', 'SlateGray', 'Gray', 'Red', 'Blue', 'Green', 'Violet']);
// Actually let's use a simpler heuristic or just specific override?
// SlateGray on Black is low contrast? SlateGray is #708090. RGB ~112,128,144.
// Luminance is roughly 0.5. On Black (0), contrast is good.
// The user said: "當顯示深色系文字時，則將背景顏色轉為淺灰色" (When showing dark text, turn bg to light gray).
// 'Black' text definitely needs Light Gray BG.
// 'Gray' (#808080) on Black. Contrast ~5:1. Readable.
// But 'Black' is the main one. Let's start with Black requiring Light BG.

function parseCSV() {
    const data = fs.readFileSync(csvPath, 'utf8');
    return data.split(/\r?\n/).filter(l => l.trim()).map(line => {
        const parts = line.split(',');
        if (parts.length < 3) return null;
        return {
            atomicNumber: parseInt(parts[0], 10),
            symbol: parts[1].trim(),
            nameEN: parts[2].trim()
        };
    }).filter(x => x);
}

function parseColors() {
    const raw = fs.readFileSync(mhtmlPath, 'utf-8');
    // Pattern: >ElementEnglishName</a>... align=3D"left">ColorName</td>
    // Since it's quoted printable, we extract simply by removing =3D or parsing flexibly.
    // The simplified regex to catch the name in the link and the color in the next cell:
    // <a href=3D"...">Hydrogen</a>...<td ...>Colorless</td>

    // We will clean the string first to remove =3D and newlines to make regex easier?
    // MHTML lines end with =
    // Let's just regex on the raw chunks.

    // Regex explanation:
    // 1. Find anchor tag with element name: <a [^>]*>([A-Za-z]+)</a>
    // 2. Look ahead for the cell with color: .*?<td [^>]*>([A-Za-z]+)</td>
    // We need to be careful about not matching too much.

    const colors = {};
    const regex = /<a href=3D"[^"]*">([A-Za-z]+)<\/a><\/font><\/td><td[^>]*>([A-Za-z]+)<\/td>/g;

    // The file content has =3D breaks.
    // Let's crude parse: remove all =\r\n or =\n to join lines?
    // Quoted printable soft line breaks are =\n.

    let clean = raw.replace(/=\r\n/g, '').replace(/=\n/g, '');
    let match;
    while ((match = regex.exec(clean)) !== null) {
        colors[match[1]] = match[2];
    }
    return colors;
}

function main() {
    const elements = parseCSV();
    const colors = parseColors();

    const nameAliases = {
        'Caesium': 'Cesium',
        'Aluminium': 'Aluminum'
    };

    const output = elements.map(e => {
        const lookupName = nameAliases[e.nameEN] || e.nameEN;
        const colorName = colors[lookupName] || 'White'; // Default
        const zh = zhNames[e.atomicNumber] || e.nameEN;
        const hex = colorMap[colorName] || colorName;

        // Determine if we need light background
        // "Black" text on Black BG is invisible. 
        // "Blue" (#0000FF) on Black is hard to read.
        // "Red" (#FF0000) on Black is okay but dark.
        // Let's flag "Black" and maybe very dark colors.
        const useLightBg = (colorName === 'Black' || colorName === 'Blue' || colorName === 'Navy');

        return {
            n: e.atomicNumber,
            s: e.symbol,
            z: zh,
            e: e.nameEN,
            c: hex,
            l: useLightBg // l for LightBG needed
        };
    });

    const fileContent = `const elementsData = ${JSON.stringify(output, null, 2)};`;
    fs.writeFileSync(outputPath, fileContent);
    console.log(`Generated data.js for ${output.length} elements.`);
    console.log('Sample:', output[0]);

    // Check for missing colors
    const missing = output.filter(e => !colors[e.e]);
    if (missing.length > 0) {
        console.log('Elements with missing colors:', missing.map(e => e.e));
    }
}

main();
