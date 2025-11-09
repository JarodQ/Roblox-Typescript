import { PlantRarity } from "Common/server/Data/Template";

export interface PlantIncomeConfig {
    baseRate: number;
}

const rarityMultipliers: Record<PlantRarity, number> = {
    Common: 1.0,
    Uncommon: 1.25,
    Rare: 1.5,
    Epic: 2.0,
    Legendary: 3.0,
};

// Optional: nonlinear level curve
export function getLevelMultiplier(level: number): number {
    return 1 + level * 0.1; // e.g. level 5 = 1.5x
    // Or use a curve: return math.pow(1.05, level);
}

const plantBaseRates: Record<string, PlantIncomeConfig> = {
    carrot_weapon: { baseRate: 1 },
    blueberry_weapon: { baseRate: 2 },
    corn_weapon: { baseRate: 3 },
    sunflower_weapon: { baseRate: 4 },
};

export function getIncomeRate(plantId: string, rarity: PlantRarity, level: number): number {
    const config = plantBaseRates[plantId];
    if (!config) return 0;

    const rarityMult = rarityMultipliers[rarity] ?? 1;
    const levelMult = getLevelMultiplier(level);

    return config.baseRate * rarityMult * levelMult;
}

