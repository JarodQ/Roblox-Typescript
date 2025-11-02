import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../../../../Common/shared/Guis/MainGui";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { ItemData } from "Common/shared/ItemData";
import { InventoryDisplay } from "./Frames/InventoryDisplay";

const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;

export class InventoryGui extends MainGui {
    private playerData: PlayerData;
    public inventoryDisplay: InventoryDisplay;

    constructor(updateHotbar: () => void) {
        super();
        this.screenGui.Name = "InventoryGuiClass";
        this.screenGui.Enabled = false;
        this.playerData = this.getPlayerData();
        this.inventoryDisplay = new InventoryDisplay(
            this.screenGui,
            this.playerData,
            this.getPlayerData,
            this.closeInventory,
            () => updateHotbar());
    }

    public updatePlayerData(updated: PlayerData) {
        this.playerData = updated;
        //this.inventoryDisplay.updateItems(this.playerData);
    }

    private getPlayerData = (): PlayerData => {
        return requestPlayerData.InvokeServer() as PlayerData;
    };

    private closeInventory = (): void => {
        this.screenGui.Enabled = false;
        return;
    }
}
