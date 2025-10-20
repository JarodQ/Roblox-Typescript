
import { Workspace, ReplicatedStorage } from "@rbxts/services";
import * as PlantModule from "./Plants";
import * as PREFABS from "./PREFABS";
import { Seed, SeedMods } from "./Plants";
import * as InteractInterface from "./InteractInterface"
import { Interactable } from "./InteractInterface";

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

    public onInteract(player: Player, hitPos: Vector3, interactable: Instance, interactee?: Tool): void {
        if (interactee === undefined) return;
        const PREFABList: Part[] = PREFABS.getPREFAB("seeds", interactee.Name) as Part[];
        const progressBar: BillboardGui[] = PREFABS.getPREFAB("UI", "ProgressBar") as BillboardGui[];
        // print(PREFABList);
        if (PREFABList && progressBar) {
            const definedSeed: Seed = {
                name: interactee.Name,
                PREFABS: PREFABList,
                plantProgress: progressBar[0],
            }
            const newSeed: PlantModule.TestSeed1 = new PlantModule.TestSeed1(definedSeed);
            newSeed.plant(this.getOwner(), hitPos, false);
            // print(`${player.Name} is planting at ${interactable} with a(n) ${interactee} at the position ${hitPos}`);
        }
    }
}


