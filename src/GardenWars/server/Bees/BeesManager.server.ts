import { Workspace } from "@rbxts/services";
import { Beehive } from "./Beehive";

const beehiveFolder = Workspace.WaitForChild("Beehives") as Folder;

// 🐝 Create Beehive instances for each hive model
for (const hiveModel of beehiveFolder.GetChildren()) {
    if (hiveModel.IsA("Model")) {
        const level = hiveModel.GetAttribute("Level") as number;

        new Beehive(hiveModel, level);
    }
}
