const elementsData = [
  {
    "n": 1,
    "s": "H",
    "z": "氫",
    "e": "Hydrogen",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 2,
    "s": "He",
    "z": "氦",
    "e": "Helium",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 3,
    "s": "Li",
    "z": "鋰",
    "e": "Lithium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 4,
    "s": "Be",
    "z": "鈹",
    "e": "Beryllium",
    "c": "#708090",
    "l": false
  },
  {
    "n": 5,
    "s": "B",
    "z": "硼",
    "e": "Boron",
    "c": "#000000",
    "l": true
  },
  {
    "n": 6,
    "s": "C",
    "z": "碳",
    "e": "Carbon",
    "c": "#000000",
    "l": true
  },
  {
    "n": 7,
    "s": "N",
    "z": "氮",
    "e": "Nitrogen",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 8,
    "s": "O",
    "z": "氧",
    "e": "Oxygen",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 9,
    "s": "F",
    "z": "氟",
    "e": "Fluorine",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 10,
    "s": "Ne",
    "z": "氖",
    "e": "Neon",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 11,
    "s": "Na",
    "z": "鈉",
    "e": "Sodium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 12,
    "s": "Mg",
    "z": "鎂",
    "e": "Magnesium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 13,
    "s": "Al",
    "z": "鋁",
    "e": "Aluminium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 14,
    "s": "Si",
    "z": "矽",
    "e": "Silicon",
    "c": "#808080",
    "l": false
  },
  {
    "n": 15,
    "s": "P",
    "z": "磷",
    "e": "Phosphorus",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 16,
    "s": "S",
    "z": "硫",
    "e": "Sulfur",
    "c": "#FFFF00",
    "l": false
  },
  {
    "n": 17,
    "s": "Cl",
    "z": "氯",
    "e": "Chlorine",
    "c": "#FFFF00",
    "l": false
  },
  {
    "n": 18,
    "s": "Ar",
    "z": "氬",
    "e": "Argon",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 19,
    "s": "K",
    "z": "鉀",
    "e": "Potassium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 20,
    "s": "Ca",
    "z": "鈣",
    "e": "Calcium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 21,
    "s": "Sc",
    "z": "鈧",
    "e": "Scandium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 22,
    "s": "Ti",
    "z": "鈦",
    "e": "Titanium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 23,
    "s": "V",
    "z": "釩",
    "e": "Vanadium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 24,
    "s": "Cr",
    "z": "鉻",
    "e": "Chromium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 25,
    "s": "Mn",
    "z": "錳",
    "e": "Manganese",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 26,
    "s": "Fe",
    "z": "鐵",
    "e": "Iron",
    "c": "#808080",
    "l": false
  },
  {
    "n": 27,
    "s": "Co",
    "z": "鈷",
    "e": "Cobalt",
    "c": "#808080",
    "l": false
  },
  {
    "n": 28,
    "s": "Ni",
    "z": "鎳",
    "e": "Nickel",
    "c": "#808080",
    "l": false
  },
  {
    "n": 29,
    "s": "Cu",
    "z": "銅",
    "e": "Copper",
    "c": "#B87333",
    "l": false
  },
  {
    "n": 30,
    "s": "Zn",
    "z": "鋅",
    "e": "Zinc",
    "c": "#708090",
    "l": false
  },
  {
    "n": 31,
    "s": "Ga",
    "z": "鎵",
    "e": "Gallium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 32,
    "s": "Ge",
    "z": "鍺",
    "e": "Germanium",
    "c": "#808080",
    "l": false
  },
  {
    "n": 33,
    "s": "As",
    "z": "砷",
    "e": "Arsenic",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 36,
    "s": "Kr",
    "z": "氪",
    "e": "Krypton",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 37,
    "s": "Rb",
    "z": "銣",
    "e": "Rubidium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 47,
    "s": "Ag",
    "z": "銀",
    "e": "Silver",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 49,
    "s": "In",
    "z": "銦",
    "e": "Indium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 50,
    "s": "Sn",
    "z": "錫",
    "e": "Tin",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 53,
    "s": "I",
    "z": "碘",
    "e": "Iodine",
    "c": "#708090",
    "l": false
  },
  {
    "n": 54,
    "s": "Xe",
    "z": "氙",
    "e": "Xenon",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 55,
    "s": "Cs",
    "z": "銫",
    "e": "Caesium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 56,
    "s": "Ba",
    "z": "鋇",
    "e": "Barium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 74,
    "s": "W",
    "z": "鎢",
    "e": "Tungsten",
    "c": "#808080",
    "l": false
  },
  {
    "n": 78,
    "s": "Pt",
    "z": "鉑",
    "e": "Platinum",
    "c": "#808080",
    "l": false
  },
  {
    "n": 79,
    "s": "Au",
    "z": "金",
    "e": "Gold",
    "c": "#FFD700",
    "l": false
  },
  {
    "n": 80,
    "s": "Hg",
    "z": "汞",
    "e": "Mercury",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 82,
    "s": "Pb",
    "z": "鉛",
    "e": "Lead",
    "c": "#708090",
    "l": false
  },
  {
    "n": 86,
    "s": "Rn",
    "z": "氡",
    "e": "Radon",
    "c": "#FFFFFF",
    "l": false
  },
  {
    "n": 87,
    "s": "Fr",
    "z": "鍅",
    "e": "Francium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 88,
    "s": "Ra",
    "z": "鐳",
    "e": "Radium",
    "c": "#C0C0C0",
    "l": false
  },
  {
    "n": 92,
    "s": "U",
    "z": "鈾",
    "e": "Uranium",
    "c": "#C0C0C0",
    "l": false
  }
];