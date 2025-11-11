// Template.ts
export type PlantRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type PlantData = {
    plantId: string;
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


