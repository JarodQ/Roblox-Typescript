import { Workspace, Players } from "@rbxts/services";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const baseTrigger = Workspace.WaitForChild("BaseBarrier") as BasePart;

baseTrigger.Touched.Connect((hit) => {
    print("Checking Backpack");
    const player = Players.GetPlayerFromCharacter(hit.Parent as Model);
    if (!player) return;

    const carried = hit.Parent?.FindFirstChild("HarvestedPlant") as Model;
    if (carried) {
        const plantId = carried.GetAttribute("PlantId") as string;
        const plantRarity = carried.GetAttribute("PlantRarity") as string; // 👈 grab rarity before destroy

        carried.Destroy();

        const backpack = player.WaitForChild("Backpack") as Backpack;
        const toolPREFAB = getPREFAB("Tools", plantId) as Tool;
        const tool = toolPREFAB.Clone();

        // 👇 set rarity attribute on the tool
        tool.SetAttribute("PlantRarity", plantRarity);

        tool.Parent = backpack;
    }
});
