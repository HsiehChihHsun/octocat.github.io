// DOM Elements
const espressoSlider = document.getElementById('espresso-range');
const milkSlider = document.getElementById('milk-range');
const foamSlider = document.getElementById('foam-range');

const espressoValDisplay = document.getElementById('espresso-val');
const milkValDisplay = document.getElementById('milk-val');
const foamValDisplay = document.getElementById('foam-val');

const espressoLayer = document.getElementById('espresso-layer');
const milkLayer = document.getElementById('milk-layer');
const foamLayer = document.getElementById('foam-layer');

const resultText = document.getElementById('result-text');

// Constants
// Note: Height scaling. The cup is 200px tall. Total max volume ~500ml.
// Let's approximate 1mL = 0.5px height for visualisation fits.
const PX_PER_ML = 0.5;

// Recipes from list.txt and common knowledge
/*
1. Espresso: 30ml
2. Macchiato: 30ml Esp + 15ml Foam
3. Cortado: 30ml Esp + 30ml Milk (No Foam or very little)
4. Flat White: 60ml Esp + 120ml Milk (Microfoam < 0.5cm)
5. Cappuccino: 30ml Esp + 60ml Milk + 60ml Foam (1:1:1 approx) or 1:2:2
6. Latte: 30ml Esp + 240-300ml Milk + Little Foam
*/

const recipes = [
    {
        name: "濃縮咖啡 (Espresso)",
        check: (e, m, f) => {
            // High espresso purity. Little to no milk/foam.
            return m < 10 && f < 10;
        }
    },
    {
        name: "瑪奇朵 (Espresso Macchiato)",
        check: (e, m, f) => {
            // Espresso base, small amount of foam, very little milk
            // Ratio approx 2:1 (Esp:Foam) or 1:0.5
            // Allow some tolerance
            return m < 15 && f > 10 && f < 40;
        }
    },
    {
        name: "告爾多 (Cortado)",
        check: (e, m, f) => {
            // 1:1 Espresso to Milk. Little foam.
            const ratio = m / e;
            return ratio >= 0.8 && ratio <= 1.5 && f < 20;
        }
    },
    {
        name: "馥芮白 (Flat White)",
        check: (e, m, f) => {
            // 2 shots (60ml) + 120ml Milk. Ratio 1:2. Little foam.
            // Or 1 shot (30ml) + 60-90ml Milk.
            const ratio = m / e;
            return e >= 40 && ratio >= 1.8 && ratio <= 2.5 && f < 30; // Usually double shot
        }
    },
    {
        name: "卡布奇諾 (Cappuccino)",
        check: (e, m, f) => {
            // 1:1:1 or 1:2:2. Key is significant foam equal to milk roughly.
            if (m < 20 || f < 20) return false;
            const milkFoamRatio = m / f;
            return milkFoamRatio >= 0.5 && milkFoamRatio <= 2.0;
        }
    },
    {
        name: "義式拿鐵 (Caffè Latte)",
        check: (e, m, f) => {
            // High milk content. > 1:3 ratio. Low foam relative to milk.
            if (m < 60) return false;
            const ratio = m / e;
            return ratio > 3.0 && f < (m * 0.5); // Foam is less than half of milk
        }
    }
];

// Advanced Similarity Algorithm
function findMatch(e, m, f) {
    // 1. Calculate ratios
    const totalLiquid = e + m + f;
    if (totalLiquid === 0) return { match: null, confidence: 100 };

    // Normalize input vector
    // Weighting: Espresso is potent, but volumetrically small. 
    // We should compare ratios mostly.

    // Let's use a scoring system based on specific target points for simplicity and robustness
    // Targets [Espresso, Milk, Foam] normalized ratios
    const targets = [
        { name: "濃縮咖啡", nameEn: "Espresso", vec: [1.0, 0.0, 0.0], weight: 1.0 }, // Pure Espresso
        { name: "瑪奇朵", nameEn: "Espresso Macchiato", vec: [0.66, 0.0, 0.33], weight: 1.0 }, // 2:1 Esp:Foam
        { name: "告爾多", nameEn: "Cortado", vec: [0.5, 0.5, 0.0], weight: 1.0 }, // 1:1 Esp:Milk
        { name: "馥芮白", nameEn: "Flat White", vec: [0.33, 0.66, 0.0], weight: 1.0 }, // 1:2 Esp:Milk
        { name: "卡布奇諾", nameEn: "Cappuccino", vec: [0.33, 0.33, 0.33], weight: 1.0 }, // 1:1:1
        { name: "義式拿鐵", nameEn: "Caffè Latte", vec: [0.15, 0.8, 0.05], weight: 1.0 }, // ~1:5 Esp:Milk
    ];

    const currentVec = [e / totalLiquid, m / totalLiquid, f / totalLiquid];

    let bestMatch = null;
    let maxScore = -Infinity; // Using cosine similarity, range -1 to 1

    targets.forEach(t => {
        // Cosine Similarity
        const dot = (currentVec[0] * t.vec[0]) + (currentVec[1] * t.vec[1]) + (currentVec[2] * t.vec[2]);
        const mag1 = Math.sqrt(currentVec[0] ** 2 + currentVec[1] ** 2 + currentVec[2] ** 2);
        const mag2 = Math.sqrt(t.vec[0] ** 2 + t.vec[1] ** 2 + t.vec[2] ** 2);

        // Avoid divide by zero
        let similarity = 0;
        if (mag1 > 0 && mag2 > 0) {
            similarity = dot / (mag1 * mag2);
        }

        // Apply penalties for absolute constraints
        // For example, if Latte matches well by ratio but volume is tiny (e.g. 5ml milk), penalty.
        // Or if Espresso matches ratio (1:0:0) but volume is 300ml (impossible for standard espresso), penalty.

        let penalty = 0;

        // Espresso constraint
        if (t.name === "濃縮咖啡" && (m > 10 || f > 10)) penalty += 0.5; // Strict impurity penalty

        const score = similarity - penalty;

        if (score > maxScore) {
            maxScore = score;
            bestMatch = t;
        }
    });

    return { match: bestMatch, confidence: maxScore * 100 }; // Score is roughly 0-1
}


function update() {
    // Get values
    const e = parseInt(espressoSlider.value);
    const m = parseInt(milkSlider.value);
    const f = parseInt(foamSlider.value);

    // Update Text Displays
    espressoValDisplay.textContent = `${e} mL`;
    milkValDisplay.textContent = `${m} mL`;
    foamValDisplay.textContent = `${f} mL`;

    // Update Visuals (Heights)
    // We update the CSS 'height' property or 'flex-basis'
    espressoLayer.style.height = `${e * PX_PER_ML}px`;
    milkLayer.style.height = `${m * PX_PER_ML}px`;
    foamLayer.style.height = `${f * PX_PER_ML}px`;

    // Visibility check (hide label if too small)
    espressoLayer.querySelector('.label').style.opacity = e > 10 ? 1 : 0;
    milkLayer.querySelector('.label').style.opacity = m > 10 ? 1 : 0;
    foamLayer.querySelector('.label').style.opacity = f > 10 ? 1 : 0;

    // Run Algorithm
    const result = findMatch(e, m, f);

    displayResult(result);
}

function displayResult(result) {
    let mainText = "";
    let subText = "";

    // Safety check if bestMatch is null (shouldn't happen with targets but possible if all filtered)
    if (!result.match) {
        resultText.innerHTML = "請加入咖啡或牛奶...<br><span style='font-size:0.6em; color:#888;'>Please add coffee or milk...</span>";
        return;
    }

    const name = result.match.name;
    const nameEn = result.match.nameEn;
    const conf = result.confidence;

    if (conf >= 98) {
        mainText = `這杯是... <span style="color:var(--accent-color);">${name}</span>！`;
        subText = `It looks like... ${nameEn}!`;
    } else if (conf >= 85) {
        mainText = `這杯更像是... <span style="color:var(--accent-color);">${name}</span>`;
        subText = `It's more like... ${nameEn}`;
    } else if (conf >= 70) {
        mainText = `這杯有點像... ${name}`;
        subText = `It somewhat resembles... ${nameEn}`;
    } else {
        mainText = "這杯什麼都不像... 這是你的特調嗎？";
        subText = "It doesn't look like anything familiar... Your special?";
    }

    resultText.innerHTML = `
        <div>${mainText}</div>
        <div style="font-size: 0.6em; color: #8c7b70; font-weight: normal; margin-top: 5px;">${subText}</div>
    `;
}

// Event Listeners
espressoSlider.addEventListener('input', update);
milkSlider.addEventListener('input', update);
foamSlider.addEventListener('input', update);

// Init
update();
