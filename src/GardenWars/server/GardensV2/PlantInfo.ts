//Dictionary of all values relevant to the plants
import { PlantId, PlantRarity } from "Common/server/Data/Template";


export const PlantInfoDictionary = {
    // 🌟 Rarity to Color mapping
    RarityColors: {
        Common: new Color3(0.8, 0.8, 0.8),
        Uncommon: new Color3(0.4, 0.8, 0.4),
        Rare: new Color3(0.4, 0.4, 0.8),
        Epic: new Color3(0.7, 0.3, 0.8),
        Legendary: new Color3(1, 0.8, 0.2),
        Mythical: new Color3(1, 0.3, 0.3),
    } as Record<PlantRarity, Color3>,

    // 🌱 Base income rates
    PlantBaseRates: {
        carrotShooter: 5,
        blueberryBlaster: 10,
        maizeMauler: 25,
        heliosLaser: 50,
    } as Record<PlantId, number>,

    // 📈 Rarity multipliers
    RarityMultipliers: {
        Common: 1.0,
        Uncommon: 1.25,
        Rare: 1.5,
        Epic: 2.0,
        Legendary: 3.0,
        Mythical: 5.0,
    } as Record<PlantRarity, number>,

    // 🎯 Weighted rarity by level
    RarityWeightsByLevel: {
        1: { Common: 60, Uncommon: 30, Rare: 10 },
        2: { Common: 40, Uncommon: 35, Rare: 15, Epic: 10 },
        3: { Uncommon: 30, Rare: 30, Epic: 25, Legendary: 15 },
        4: { Rare: 25, Epic: 30, Legendary: 30, Mythical: 15 },
        5: { Epic: 20, Legendary: 40, Mythical: 40 },
    } as Record<number, Partial<Record<PlantRarity, number>>>,

    // 🌿 Weighted plant types by level
    PlantWeightsByLevel: {
        1: { carrotShooter: 70, blueberryBlaster: 30 },
        2: { carrotShooter: 40, blueberryBlaster: 40, maizeMauler: 20 },
        3: { blueberryBlaster: 30, maizeMauler: 40, heliosLaser: 30 },
        4: { maizeMauler: 40, heliosLaser: 60 },
        5: { heliosLaser: 100 },
    } as Record<number, Partial<Record<PlantId, number>>>,

    // 💰 Income calculator
    getIncomeRate(plantId: PlantId, rarity: PlantRarity, level: number): number {
        const baseRate = this.PlantBaseRates[plantId];
        const rarityMult = this.RarityMultipliers[rarity] ?? 1;
        return math.ceil(baseRate * level * rarityMult);
    },

    // 💸 Upgrade cost calculator
    getLevelUpCost(plantId: PlantId, rarity: PlantRarity, level: number): number {
        const baseRate = this.PlantBaseRates[plantId];
        const rarityMult = this.RarityMultipliers[rarity] ?? 1;
        const rawCost = (baseRate * 100 * math.pow(level, 2) + level + baseRate * 100) * rarityMult;
        return math.ceil(rawCost);
    },

    weightedRandom<T extends string>(weights: Partial<Record<T, number>>): T {
        let totalWeight = 0;
        const keys = [] as T[];
        const values = [] as number[];

        // roblox-ts-compatible dictionary iteration
        for (const [key, value] of pairs(weights)) {
            if (typeIs(value, "number")) {
                totalWeight += value;
                keys.push(key as T);
                values.push(value);
            }
        }

        const roll = math.random() * totalWeight;
        let cumulative = 0;

        for (let i = 0; i < keys.size(); i++) {
            cumulative += values[i];
            if (roll <= cumulative) {
                return keys[i];
            }
        }
        return keys[0]; // fallback
    }
};


