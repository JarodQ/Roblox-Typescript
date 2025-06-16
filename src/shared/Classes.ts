
import { Workspace } from "@rbxts/services";

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

    public interact(player: Player, hitPos: Vector3, interactable: Instance): void {
        print(`${player.Name} is interacting with ${interactable} at the position ${hitPos}`);
    }
}
/*
export type Allotment = {
    instance: Instance;
}
/*
export class PlayerAllotment implements Interactable {
    public owner: Player;
    private allotment: Instance;

    constructor(newAllotment: Allotment) {
        this.allotment = newAllotment.instance;
        this.owner = newAllotment.owner;
    }
    public interact(player: Player, hitPos: Vector3) {
        const newPart = new Instance("Part");
        newPart.Size = new Vector3(4, 4, 4);
        newPart.Position = hitPos;
        newPart.Color = new Color3(0, 1, 0);
        newPart.Anchored = true;
        newPart.Parent = Workspace;
    }
}
*/