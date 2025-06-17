import { Workspace } from "@rbxts/services";
import * as PREFABS from "./PREFABS";

export function isSeed(obj: unknown): obj is Seed {
    if (!obj || !typeIs(obj, "Instance")) return false;
    return "name" in obj && "PREFAB" in obj;
}
export type Seed = {
    name: String;
    PREFAB: Part;
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


    constructor(seed: Seed) {
        this.seed = seed;
    }

    public plant(position: Vector3): void {
        const newSeed: Part = this.seed.PREFAB.Clone();
        newSeed.Parent = Workspace;
        newSeed.Position = position;
        return;
    }
}

export class TestSeed1 extends SeedMaster {
    seedType: String = "TestSeed1";
    wet: Boolean = true;
    charged: Boolean = false;
    haste: Boolean = false
    fireAspect: Boolean = false;
}
