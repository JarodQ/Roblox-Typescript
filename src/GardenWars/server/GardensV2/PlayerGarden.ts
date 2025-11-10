
import { Workspace, ReplicatedStorage } from "@rbxts/services";
import * as PREFABS from "../../shared/PREFABS";
import * as InteractInterface from "../../shared/InteractInterface"
import { Interactable } from "../../shared/InteractInterface";

const plantSeedEvent = new Instance("RemoteEvent")
plantSeedEvent.Name = "PlantSeed"
plantSeedEvent.Parent = ReplicatedStorage
// const plantSeedEvent = ReplicatedStorage.WaitForChild("PlantSeed") as RemoteEvent;

export type Garden = {
    owner: Player;
    gardenFolder: Folder;
    allotmentFolder: Model;
    allotments: Model[];
}

export class PlayerGarden {
    public garden: Garden;

    constructor(garden: Garden) {
        this.garden = garden;

    }

    public getOwner(): Player {
        return this.garden.owner;
    }

    public getAllotmentFolder(): Model {
        return this.garden.allotmentFolder;
    }

}


