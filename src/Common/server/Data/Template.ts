// Template.ts
export type PlantRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical";
export type PlantId = "carrotShooter" | "blueberryBlaster" | "maizeMauler" | "heliosLaser";

export type PlantData = {
    plantId: PlantId;
    plantName: string;
    allotmentIndex: string;
    plantedAt: number;
    growthDuration: number;
    rarity: PlantRarity;
    level: number;
    lastCollectedAt?: number; // optional, for income tracking
};



export type PlayerTemplate = {
    Gold: number;
    Valor: number;
    Inventory: string[];
    Plants: PlantData[];
};

export const templateData: PlayerTemplate = {
    Gold: 10,
    Valor: 5,
    Inventory: [],
    Plants: [],
};


