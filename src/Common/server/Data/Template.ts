// Template.ts
export type PlantRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type GrownPlantData = {
    plantId: string;
    allotmentIndex: number;
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
    GrownPlants: GrownPlantData[];
};

export const templateData: PlayerTemplate = {
    Gold: 10,
    Valor: 5,
    Inventory: [],
    GrownPlants: [],
};


