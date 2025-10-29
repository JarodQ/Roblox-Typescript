import { Players } from "@rbxts/services";
import { getTrueFlags } from "Common/shared/PlayerData/playerDataUtils";

export class MainGui {
    protected screenGui: ScreenGui;
    constructor() {
        this.screenGui = new Instance("ScreenGui");
        this.screenGui.Name = "ScreenGui";
        this.screenGui.ResetOnSpawn = false;
        this.screenGui.IgnoreGuiInset = true;
        this.screenGui.Parent = Players.LocalPlayer!.WaitForChild("PlayerGui");
    }
}