import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../MainGui";
import { ItemData } from "Common/shared/ItemData";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
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

    public selectedItem?: ItemData;
    private mode: "buy" | "sell" = "buy";
    private itemsMode: "seeds" | "crops" = "seeds";
    private playerData: PlayerData;

    constructor(onItemSelected: (itemId: string) => void) {
        super();
        this.playerData = requestPlayerData.InvokeServer() as PlayerData;
        print(this.playerData);
        this.selectionFrame = new SelectionFrame(this.screenGui, mode => this.setMode(mode));
        this.itemsFrame = new ItemsFrame(
            this.screenGui,
            itemsMode => this.setItemsMode(itemsMode),
            item => this.setSelectedItem(item, onItemSelected), // ✅ Callback from ItemsFrame
            this.playerData,
        );
        this.itemInfoFrame = new ItemInfoFrame(this.screenGui, () => this.selectedItem, this.playerData);
        this.currencyFrame = new CurrencyFrame(this.screenGui, this.playerData);
    }

    private setMode(mode: "buy" | "sell") {
        this.mode = mode;
        this.itemInfoFrame.updateItem(undefined, this.mode);

        this.itemsFrame.setDisplayMode(this.mode, this.itemsMode);
        //this.itemsFrame.setMode(mode);
    }
    private setItemsMode(itemsMode: "seeds" | "crops") {
        print("Setting Mode");
        this.itemsMode = itemsMode;
        this.itemsFrame.populateShopLayout(this.itemsMode);
        this.itemInfoFrame.updateItem(undefined, this.mode);
        //this.selectedItem = itemsMode;
        //this.itemInfoFrame.updateItem(itemsMode);
    }

    private setSelectedItem(item: ItemData, onItemSelected: (itemId: string) => void) {
        this.selectedItem = item;
        this.itemInfoFrame.updateItem(item, this.mode); // ✅ Update info panel
        onItemSelected(item.id);
    }
}