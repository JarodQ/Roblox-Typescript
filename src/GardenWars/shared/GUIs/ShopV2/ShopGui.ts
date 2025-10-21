import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../MainGui";
import { ItemData } from "Common/server/ItemInfo/ItemData";
import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { SelectionFrame } from "./Frames/SelectionFrame";
import { ItemsFrame } from "./Frames/ItemsFrame";
import { ItemInfoFrame } from "./Frames/ItemInfoFrame";
import { CurrencyFrame } from "./Frames/CurrencyFrame";

const requestPlayerData = ReplicatedStorage.FindFirstChild("RequestPlayerData") as RemoteFunction;

export class ShopGui extends MainGui {
    private selectionFrame: SelectionFrame;
    private itemsFrame: ItemsFrame;
    private itemInfoFrame: ItemInfoFrame;
    private currencyFrame: CurrencyFrame;

    private selectedItem: ItemData | undefined;
    private mode: "buy" | "sell" = "buy";
    private playerData: PlayerData;

    constructor() {
        super();
        this.playerData = requestPlayerData.InvokeServer() as PlayerData;

        this.selectionFrame = new SelectionFrame(this.screenGui, mode => this.setMode(mode));
        this.itemsFrame = new ItemsFrame(this.screenGui, item => this.setSelectedItem(item));
        this.itemInfoFrame = new ItemInfoFrame(this.screenGui, () => this.selectedItem, this.playerData);
        this.currencyFrame = new CurrencyFrame(this.screenGui, this.playerData);
    }

    private setMode(mode: "buy" | "sell") {
        this.mode = mode;
        this.itemsFrame.setMode(mode);
    }
    private setSelectedItem(item: ItemData) {
        this.selectedItem = item;
        this.itemInfoFrame.updateItem(item);
    }
}