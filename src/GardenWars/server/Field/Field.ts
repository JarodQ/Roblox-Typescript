import { FieldPlant } from "./FieldPlant";
import { PlantId, PlantRarity } from "Common/server/Data/Template";
import { PlantInfoDictionary } from "../GardensV2/PlantInfo";

export class Field {
    constructor(
        private readonly fieldRegion: Region3,
        private readonly level: number,
        private readonly spawnCount: number,
        private readonly respawnDelay: number
    ) {
        this.spawnInitialPlants();
    }

    private getWeightedPlantId(): PlantId {
        const weights = PlantInfoDictionary.PlantWeightsByLevel[this.level];
        return PlantInfoDictionary.weightedRandom(weights);
    }

    private getWeightedRarity(): PlantRarity {
        const weights = PlantInfoDictionary.RarityWeightsByLevel[this.level];
        return PlantInfoDictionary.weightedRandom(weights);
    }

    private getRandomLevel(): number {
        return math.random(this.level, this.level + 2); // slight variation
    }

    private spawnInitialPlants() {
        for (let i = 0; i < this.spawnCount; i++) {
            const plantId = this.getWeightedPlantId();
            const rarity = this.getWeightedRarity();
            const level = this.getRandomLevel();

            new FieldPlant(this.fieldRegion, plantId, rarity, level, this.respawnDelay);
        }
    }
}
