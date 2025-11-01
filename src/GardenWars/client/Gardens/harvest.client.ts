import { Workspace, ReplicatedStorage, TweenService, Players, RunService } from "@rbxts/services";
import { lowercaseFirst, findPlayerDataKeyPath } from "Common/shared/PlayerData/playerDataUtils";
import { tweenArcPop } from "GardenWars/shared/Gardens/VisualUtils";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const harvestVisualEvent = ReplicatedStorage.WaitForChild("HarvestVisualEvent") as RemoteEvent;
const player = Players.LocalPlayer;

harvestVisualEvent.OnClientEvent.Connect((seedName: string, position: Vector3) => {
    const prefab = getPREFAB("Drops", seedName) as Model | Part;
    const plantPrefab = prefab.Clone();
    const clone = prefab.Clone();
    clone.Parent = Workspace;

    // Run your tweenArcPop or other visual logic here
    tweenArcPop(player, seedName, position, clone);
});
