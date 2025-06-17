
import { Workspace, ReplicatedStorage } from "@rbxts/services";
import * as SeedModule from "./Seeds";
import * as PREFABS from "./PREFABS";
import { Seed, SeedMods } from "./Seeds";
import { Interactable } from "./interactInterface";

export type Garden = {
    owner: Player;
    gardenFolder: Folder;
    allotmentFolder: Folder;
    allotments: Instance[];
}

export class PlayerGarden implements Interactable {
    public garden: Garden;

    constructor(garden: Garden) {
        this.garden = garden;
    }

    public getOwner(): Player {
        return this.garden.owner;
    }

    public getAllotments(): Instance[] {
        return this.garden.allotments;
    }

    public interact(player: Player, hitPos: Vector3, interactable: Instance, interactee?: Tool): void {
        if (interactee === undefined) return;
        const PREFAB: Part | undefined = PREFABS.getPREFAB("seeds", interactee.Name);
        if (PREFAB) {
            const definedSeed: Seed = {
                name: "TestSeed1",
                PREFAB: PREFAB,
            }
            const newSeed: SeedModule.TestSeed1 = new SeedModule.TestSeed1(definedSeed);
            newSeed.plant(hitPos);
            print(`${player.Name} is planting at ${interactable} with a(n) ${interactee} at the position ${hitPos}`);

        }
    }
}


