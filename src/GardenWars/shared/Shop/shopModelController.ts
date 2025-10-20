// GardenWars/shared/Shop/ShopModelController.ts
import { getPREFAB } from "GardenWars/shared/PREFABS";
import { GuiElements } from "./guiManager";
import { Workspace } from "@rbxts/services";

const shopScene = Workspace.WaitForChild("ShopScene");
const placeItem = shopScene.WaitForChild("PlaceItem") as BasePart;

let previewModel: Model | undefined = shopScene.FindFirstChild("PreviewModel") as Model;

export function getPreviewModel() {
    return previewModel;
}

export function switchModel(instance: Instance, guiElements: GuiElements) {
    const modelFolder = getPREFAB("Shop", "Models") as Folder;
    const itemString = instance.GetAttribute("ShopModel") as string;
    if (!itemString) {
        print("ShopModel Not Found")
        return;
    }
    const newModel = modelFolder.FindFirstChild(itemString) as Model;

    if (!newModel) return;

    if (previewModel) previewModel.Destroy();
    previewModel = newModel.Clone();
    previewModel.Name = "PreviewModel";
    previewModel.PivotTo(new CFrame(placeItem.Position));
    previewModel.Parent = Workspace;
}