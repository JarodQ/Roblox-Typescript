//Dictionary of all values relevant to the plants
import { PlantId, PlantRarity } from "Common/server/Data/Template";


const PlantInfoDictionary = {
    // 🌟 Rarity to Color mapping
    RarityColors: {
        Common: new Color3(0.8, 0.8, 0.8),       // light gray
        Uncommon: new Color3(0.4, 0.8, 0.4),     // green
        Rare: new Color3(0.4, 0.4, 0.8),         // blue
        Epic: new Color3(0.7, 0.3, 0.8),         // purple
        Legendary: new Color3(1, 0.8, 0.2),      // gold
        Mythical: new Color3(1, 0.3, 0.3),       // red
    } as Record<PlantRarity, Color3>,

    // 🌱 Base income rates per plant
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

    // 🔢 Level scaling function
    // getLevelIncomeMultiplier(level: number): number {
    //     return math.pow(1.1, level);
    // },
    // getLevelMultiplier(level: number, baseRate: number): number {
    //     const baseBoost = math.log(baseRate + 1); // higher base = stronger multiplier
    //     // return math.pow(1.15 + baseBoost * 0.05, level);
    //     // return
    // },

    getLevelUpCost(plantId: PlantId, rarity: PlantRarity, level: number): number {
        const baseRate = PlantInfoDictionary.PlantBaseRates[plantId];
        if (!baseRate) return 0;

        const rarityMult = PlantInfoDictionary.RarityMultipliers[rarity] ?? 1;

        // Cost grows faster than income to encourage strategic upgrades
        const costMultiplier = math.pow(1.15, level); // steeper than income curve

        // const rawCost = baseRate * rarityMult * this.getLevelMultiplier(level, baseRate) * 10; // base cost scale
        const rawCost = (baseRate * 100 * math.pow(level, 2) + level + baseRate * 100) * rarityMult
        return math.ceil(rawCost);
    },


    // 💰 Final income rate calculator
    getIncomeRate(plantId: PlantId, rarity: PlantRarity, level: number): number {
        const baseRate = PlantInfoDictionary.PlantBaseRates[plantId];
        if (!baseRate) return 0;

        const rarityMult = PlantInfoDictionary.RarityMultipliers[rarity] ?? 1;
        // const levelMult = PlantInfoDictionary.getLevelMultiplier(level, baseRate);

        const rawIncome = baseRate * level * rarityMult//levelMult;
        return math.ceil(rawIncome);
    },

};

export = PlantInfoDictionary;
