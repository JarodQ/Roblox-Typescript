import { Workspace } from "@rbxts/services";
import * as PREFABS from "./PREFABS";

export function isSeed(obj: unknown): obj is Seed {
    if (!obj || !typeIs(obj, "Instance")) return false;
    return "name" in obj && "PREFAB" in obj;
}
export type Seed = {
    name: String;
    PREFABS: Part[];
}

export type SeedMods = {
    seedType: String;
    day: Boolean
    night: Boolean;
    wet: Boolean;
    charged: Boolean;
    haste: Boolean
    fireAspect: Boolean;
}

export class SeedMaster {
    public seed: Seed;
    private seedPart: Part | undefined;
    private seedPosition: Vector3 = new Vector3(0, 0, 0);
    private growthStage: number = 0;
    private growthRate: number = 1;
    private growthTime: number = 1;


    constructor(seed: Seed) {
        this.seed = seed;
    }

    public plant(position: Vector3): void {
        this.seedPart = this.seed.PREFABS[0].Clone();
        this.seedPart.Parent = Workspace;
        this.seedPart.Position = position;
        this.seedPosition = position;
        this.growthTime = DateTime.now().UnixTimestamp;
        this.trackGrowth();
        return;
    }

    private evolveGrowth() {
        if (this.seedPart) {
            this.seedPart.Destroy();
            this.growthStage++;
            this.seedPart = this.seed.PREFABS[this.growthStage].Clone();
            this.seedPart.Parent = Workspace;
            this.seedPart.Position = this.seedPosition;
            if (this.seed.PREFABS[this.growthStage + 1]) this.trackGrowth();
        }
    }

    private trackGrowth(): void {
        const timeToGrow = 5 * this.growthRate;
        do {
            wait();
        } while (DateTime.now().UnixTimestamp - this.growthTime < timeToGrow);
        this.growthTime = DateTime.now().UnixTimestamp;
        this.evolveGrowth();
    }

}

export class TestSeed1 extends SeedMaster {
    seedType: String = "TestSeed1";
    wet: Boolean = true;
    charged: Boolean = false;
    haste: Boolean = false
    fireAspect: Boolean = false;
}
