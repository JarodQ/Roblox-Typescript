import { Workspace } from "@rbxts/services";
import { Field } from "./Field";

const fieldFolder = Workspace.WaitForChild("FieldRegions") as Folder;
const totalPlantCount = 50;
const respawnDelay = 20;

const fieldModels = fieldFolder.GetChildren().filter((child) => child.IsA("BasePart")) as BasePart[];
const plantsPerField = math.floor(totalPlantCount / fieldModels.size());

for (const fieldPart of fieldModels) {
    const level = fieldPart.GetAttribute("Level") as number ?? 1;
    const region = new Region3(
        fieldPart.Position.sub(fieldPart.Size.div(2)),
        fieldPart.Position.add(fieldPart.Size.div(2))
    );
    new Field(region, level, plantsPerField, respawnDelay);
}

