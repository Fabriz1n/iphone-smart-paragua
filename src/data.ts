export const MODELS = [
  "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus",
  "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus",
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 16e", "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
  "iPhone 18", "iPhone 18 Pro", "iPhone 18 Pro Max",
];

export interface PriceEntry {
  id: string;
  category: string;
  models: string[];
  price: number;
  variant?: string;
}

type PriceRow = [models: string[], price: number, label?: string];

const normalizeModel = (model: string) =>
  model.toLowerCase().replace(/^iphone\s*/i, "").replace(/[\s._/-]+/g, "");

const entries: PriceEntry[] = [];

function addPrices(category: string, rows: PriceRow[], variant?: string) {
  rows.forEach(([models, price, rowLabel], index) => {
    entries.push({
      id: `${normalizeModel(category)}-${variant ? normalizeModel(variant) : "std"}-${index}`,
      category,
      models: models.map(normalizeModel),
      price,
      variant: rowLabel ?? variant,
    });
  });
}

const pantallasIncell: [string[], number][] = [
  [["6"], 250],
  [["6s", "6 Plus", "6s Plus"], 280],
  [["7", "7 Plus"], 280],
  [["8", "8 Plus"], 280],
  [["X", "XS"], 350],
  [["XR"], 350],
  [["11"], 400],
  [["XS Max"], 410],
  [["11 Pro"], 420],
  [["11 Pro Max"], 480],
  [["12 mini"], 520],
  [["12", "12 Pro"], 455],
  [["12 Pro Max"], 580],
  [["13 mini"], 490],
  [["13"], 550],
  [["13 Pro"], 600],
  [["13 Pro Max"], 830],
  [["14"], 530],
  [["14 Pro"], 720],
  [["14 Pro Max"], 830],
  [["14 Plus"], 550],
  [["15"], 600],
  [["15 Pro"], 680],
  [["15 Pro Max"], 890],
  [["16"], 820],
  [["16 Pro"], 900],
  [["16 Pro Max"], 950],
];

const pantallasOled: [string[], number][] = [
  [["X", "XS"], 480],
  [["XS Max"], 590],
  [["11 Pro"], 585],
  [["11 Pro Max"], 650],
  [["12 mini"], 700],
  [["12", "12 Pro"], 620],
  [["12 Pro Max"], 750],
  [["13 mini"], 700],
  [["13"], 860],
  [["13 Pro"], 900],
  [["13 Pro Max"], 1100],
  [["14"], 850],
  [["14 Pro"], 1000],
  [["14 Pro Max"], 1100],
  [["14 Plus"], 870],
  [["15"], 900],
  [["15 Pro"], 890],
  [["15 Pro Max"], 1200],
  [["16"], 1050],
  [["16 Pro"], 1050],
  [["16 Pro Max"], 1250],
  [["17 Pro Max"], 1590],
];

addPrices("Pantalla", pantallasIncell, "Incell");
addPrices("Pantalla", pantallasOled, "OLED");
addPrices("Parlante", [
  [["6", "7", "7 Plus"], 100],
  [["8", "8 Plus"], 120],
  [["X", "XS", "XR", "11"], 200, "Grupo X · XS · XR · 11"],
  [["11", "11 Pro", "11 Pro Max"], 220, "Grupo 11 · 11 Pro · 11 Pro Max"],
  [["12", "12 Pro", "12 Pro Max"], 270],
  [["13"], 280],
  [["13 Pro"], 300],
  [["13 Pro Max"], 330],
  [["14", "14 Pro", "14 Pro Max"], 380],
  [["15", "15 Pro", "15 Pro Max"], 380],
]);
addPrices("Batería", [
  [["6", "6s", "6 Plus"], 280],
  [["7", "7 Plus", "8", "8 Plus"], 280],
  [["X", "XS"], 280],
  [["XS Max"], 350],
  [["XR", "11 Pro"], 350],
  [["11", "11 Pro Max"], 390],
  [["12", "12 Pro"], 480],
  [["12 Pro Max"], 480],
  [["13"], 480],
  [["13 Pro"], 490],
  [["12 mini", "13 mini"], 370],
  [["13 Pro Max"], 550],
  [["14"], 550],
  [["14 Pro"], 550],
  [["14 Pro Max"], 550],
  [["14 Plus"], 420],
  [["15"], 400],
  [["15 Pro"], 450],
  [["15 Pro Max"], 550],
  [["16 Pro Max"], 650],
]);
addPrices("Glass", [
  [["11"], 350],
  [["11 Pro", "11 Pro Max"], 450],
  [["12", "12 Pro"], 450],
  [["12 Pro Max"], 550],
  [["13", "13 Pro"], 550],
  [["13 Pro Max"], 700],
  [["14", "14 Pro"], 650],
  [["14 Pro Max"], 800],
  [["15", "15 Pro"], 700],
  [["15 Pro Max"], 850],
  [["16", "16 Pro"], 800],
  [["16 Pro Max"], 900],
  [["17", "17 Pro"], 1100],
  [["17 Pro Max"], 1200],
]);
addPrices("Tapa cristal", [
  [["8", "8 Plus", "X", "XS"], 150],
  [["XR", "XS Max", "11"], 200],
  [["11 Pro"], 230],
  [["11 Pro Max"], 250],
  [["12", "12 mini"], 230],
  [["12 Pro", "12 Pro Max"], 280],
  [["13", "13 Pro"], 280],
  [["13 Pro Max", "14 Pro Max"], 280],
  [["14", "14 Pro"], 290],
]);
addPrices("Tapa con visor", [
  [["14", "14 Pro"], 360],
  [["15", "15 Pro", "15 Pro Max"], 360],
  [["16 Pro", "16 Pro Max"], 360],
  [["16", "16 Plus"], 300],
]);
addPrices("Cámara selfie", [
  [["6", "6s", "6 Plus"], 100],
  [["6 Plus", "6s Plus"], 120],
  [["7"], 170],
  [["7 Plus"], 170],
  [["8"], 200],
  [["8 Plus"], 230],
  [["X", "XR"], 250],
  [["XS Max", "XS"], 280],
  [["11", "11 Pro"], 350],
  [["11 Pro Max"], 350],
  [["12", "12 Pro"], 420],
  [["12 Pro Max"], 450],
  [["13", "13 Pro"], 320],
  [["13 Pro Max"], 350],
  [["14", "14 Pro"], 370],
  [["14 Pro Max"], 400],
  [["15", "15 Pro"], 450],
  [["15 Pro Max"], 470],
]);
addPrices("Entrada de carga", [
  [["6", "6s", "6 Plus"], 100],
  [["6s Plus"], 120],
  [["7", "7 Plus"], 150],
  [["8", "8 Plus"], 180],
  [["X", "XS", "XS Max"], 190],
  [["XR"], 250],
  [["11"], 250],
  [["12", "12 Pro Max"], 280],
  [["13", "13 Pro"], 320],
  [["13 Pro Max"], 350],
  [["14", "14 Pro"], 370],
  [["14 Pro Max"], 400],
  [["15", "15 Pro"], 450],
  [["15 Pro Max"], 470],
]);
addPrices("Carcasa", [
  [["6", "6s", "6 Plus"], 120],
  [["7", "7 Plus"], 200],
  [["8", "8 Plus"], 350],
  [["X", "XS", "XR"], 450],
  [["XS Max"], 450],
  [["11"], 480],
  [["11 Pro", "11 Pro Max"], 500],
  [["12", "12 Pro"], 650],
  [["12 Pro Max"], 650],
  [["13"], 650],
  [["13 Pro"], 670],
  [["13 Pro Max"], 700],
  [["14 Pro Max"], 750],
  [["15 Pro Max"], 850],
]);
addPrices("Flex de audio", [
  [["X", "XS", "XS Max"], 320],
  [["11", "11 Pro", "11 Pro Max"], 350],
  [["12", "12 Pro", "12 Pro Max"], 370],
  [["13", "13 Pro", "13 Pro Max"], 370],
  [["14", "14 Pro", "14 Pro Max"], 400],
  [["15", "15 Pro", "15 Pro Max"], 470],
]);
addPrices("Cámara trasera", [
  [["6s Plus", "7", "7 Plus"], 170],
  [["8", "8 Plus"], 250],
  [["X", "XS"], 250],
  [["XS Max"], 320],
  [["11", "11 Pro", "11 Pro Max"], 350],
  [["12", "12 Pro"], 400],
  [["12 Pro Max"], 400],
  [["13", "13 Pro"], 470],
  [["13 Pro Max"], 550],
  [["14 Pro Max"], 500],
  [["15 Pro Max"], 550],
]);
addPrices("Flex de power", [
  [["X", "XS", "XR", "XS Max"], 250],
  [["11", "11 Pro", "11 Pro Max"], 280],
  [["12 mini", "12", "12 Pro"], 290],
  [["12 Pro Max"], 300],
  [["13 mini", "13 Pro"], 320],
  [["13 Pro Max"], 350],
  [["14", "14 Pro", "14 Pro Max"], 350],
  [["15", "15 Pro", "15 Pro Max"], 420],
]);
addPrices("Flash", [
  [["11 Pro Max"], 150],
  [["12"], 170],
  [["12 Pro Max"], 200],
  [["13 Pro"], 220],
  [["13 Pro Max"], 230],
  [["14", "14 Pro"], 240],
  [["14 Pro Max"], 250],
]);
addPrices("Antena WiFi", [
  [["X"], 120],
  [["11"], 150],
  [["11 Pro"], 160],
  [["11 Pro Max"], 170],
  [["12", "12 Pro"], 200],
  [["12 Pro Max"], 200],
]);
addPrices("Accesorios", [
  [["*"], 50],
  [["*"], 70],
  [["*"], 70],
  [["*"], 80],
  [["*"], 50],
], "Vidrio templado 9D|Vidrio 9D antiespía|Cable USB-C a USB-C|Cubo|Funda");

export const PRICE_LIST_DATE = "6/10/26";
export const PRICE_LIST: PriceEntry[] = entries;
export const PRICE_CATEGORIES = [...new Set(entries.map((entry) => entry.category))];

export function getModelKey(model: string): string {
  return normalizeModel(model);
}

export function getPricesForModel(model: string): PriceEntry[] {
  const modelKey = getModelKey(model);
  return PRICE_LIST.filter((entry) => entry.models.includes(modelKey) || entry.models.includes("*"));
}

export function getPriceLabel(entry: PriceEntry): string {
  if (entry.category === "Accesorios") {
    const labels = entry.variant?.split("|") ?? [];
    return labels[Number(entry.id.split("-").at(-1))] ?? entry.category;
  }
  return entry.variant ? `${entry.category} · ${entry.variant}` : entry.category;
}
