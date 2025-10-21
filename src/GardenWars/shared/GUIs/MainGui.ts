import { Players } from "@rbxts/services";

export class MainGui {
    protected screenGui: ScreenGui;
    constructor() {
        this.screenGui = new Instance("ScreenGui");
        this.screenGui.Name = "ShopGuiVersionX";
        this.screenGui.ResetOnSpawn = false;
        this.screenGui.Parent = Players.LocalPlayer!.WaitForChild("PlayerGui");
    }
}