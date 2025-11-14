import { Bee, AllBeeTypes, BeeType } from "./Bees";
import { Workspace } from "@rbxts/services";

export class Beehive {
    private readonly model: Model;
    private readonly level: number;
    private readonly maxBees: number;
    private readonly spawnDelay = 5; // seconds
    private readonly activeBees = new Set<Bee>();

    constructor(model: Model, level: number) {
        this.model = model;
        this.level = level;
        this.maxBees = this.getMaxBeeCountForLevel(level);

        this.spawnInitialBees();
    }

    private getMaxBeeCountForLevel(level: number): number {
        if (level === 1) return 1;
        if (level === 2) return 1;
        if (level === 3) return 1;
        if (level === 4) return 1;
        return 0
    }

    private getBeeTypesForLevel(level: number): BeeType[] {
        if (level === 1) return ["WorkerBee"];
        if (level === 2) return ["WorkerBee", "DroneBee"];
        if (level === 3) return ["DroneBee", "KingBee"];
        if (level === 4) return ["QueenBee"];
        return AllBeeTypes;
    }

    private spawnInitialBees() {
        for (let i = 0; i < this.maxBees; i++) {
            this.spawnBee();
        }
    }

    private spawnBee() {
        const beeTypes = this.getBeeTypesForLevel(this.level);
        const randomType = beeTypes[math.random(0, beeTypes.size() - 1)];
        const bee = new Bee(randomType, this.model);

        this.activeBees.add(bee);

        // 🧼 Listen for death
        const model = bee["model"];
        model.Destroying.Connect(() => {
            this.activeBees.delete(bee);
            this.scheduleRespawn();
        });
    }

    private scheduleRespawn() {
        task.delay(this.spawnDelay, () => {
            if (this.activeBees.size() < this.maxBees) {
                this.spawnBee();
            }
        });
    }
}
