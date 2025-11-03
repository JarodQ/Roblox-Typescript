import { ReplicatedStorage, Players } from "@rbxts/services";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const requestToolEquip = new Instance("RemoteEvent");
requestToolEquip.Name = "RequestToolEquip";
requestToolEquip.Parent = ReplicatedStorage;

requestToolEquip.OnServerEvent.Connect((...args) => {
    const [player, itemId] = args as [Player, string];

    const character = player.Character ?? player.CharacterAdded.Wait()[0];
    if (!character) return;
    const equippedTool = character.FindFirstChildOfClass("Tool");

    if (itemId) {
        const prefabFolder = getPREFAB("Tools", itemId) as Folder;
        const prefab = prefabFolder.FindFirstChildOfClass("Tool") as Tool;

        if (!prefab || !prefab.IsA("Tool")) return;




        // If the equipped tool matches the requested one, destroy it and skip equipping
        if (equippedTool && equippedTool.Name === prefab.Name) {
            equippedTool.Destroy();
            return;
        }

        // Otherwise, destroy the old tool and equip the new one


        const toolClone = prefab.Clone();
        toolClone.Parent = character;
    }
    // If the equipped tool matches the requested one, destroy it and skip equipping
    if (equippedTool) {
        equippedTool.Destroy();
    }

});
