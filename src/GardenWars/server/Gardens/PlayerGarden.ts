
import { Workspace, ReplicatedStorage } from "@rbxts/services";
import * as PREFABS from "../../shared/PREFABS";
import * as InteractInterface from "../../shared/InteractInterface"
import { Interactable } from "../../shared/InteractInterface";
// import { handlePlantSeedEvent } from "./Plants";

const plantSeedEvent = new Instance("RemoteEvent")
plantSeedEvent.Name = "PlantSeed"
plantSeedEvent.Parent = ReplicatedStorage
// const plantSeedEvent = ReplicatedStorage.WaitForChild("PlantSeed") as RemoteEvent;

export type Garden = {
    owner: Player;
    gardenFolder: Folder;
    allotmentFolder: Folder;
    allotments: Instance[];
}

export class PlayerGarden {
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

    // public onInteract(player: Player, hitPos: Vector3, interactable: Instance, interactee?: Tool): void {
    //     if (!interactee) return;

    //     // plantSeedEvent.FireServer(interactee.Name, hitPos);
    //     handlePlantSeedEvent(player, interactee.GetAttribute("Item"), hitPos)
    // }
}


