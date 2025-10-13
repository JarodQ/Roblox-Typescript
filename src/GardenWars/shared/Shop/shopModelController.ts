// GardenWars/shared/Shop/ShopModelController.ts
import { getPREFAB } from "GardenWars/shared/PREFABS";
import { GuiElements } from "./shopFunctions";
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
    print("ItemString: ", itemString)
    if (!itemString) return;
    const newModel = modelFolder.FindFirstChild(itemString) as Model;
    print("New Model: ", newModel)

    if (!newModel) return;

    if (previewModel) previewModel.Destroy();
    print("Creating new model")
    previewModel = newModel.Clone();
    previewModel.Name = "PreviewModel";
    previewModel.PivotTo(new CFrame(placeItem.Position));
    previewModel.Parent = Workspace;
}