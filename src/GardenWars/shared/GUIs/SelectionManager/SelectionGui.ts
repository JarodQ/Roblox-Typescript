import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../../../../Common/shared/Guis/MainGui";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { ItemData } from "Common/shared/ItemData";
import { InventoryGui } from "../Inventory/InventoryGui";
import { ShopGui } from "../ShopV2/ShopGui";
import { GuiElementDescriptor } from "../ShopV2/Frames/buildGuiComponent";
import { buildGuiComponent } from "../ShopV2/Frames/buildGuiComponent";
import {
    createUICorner,
    createUIGradient,
    createUIstroke,
    createImageLabel,
    createTextLabel,
    createTextButton
} from "../../../../Common/shared/Guis/Util/GuiPresets";

export class SelectionManager extends MainGui {
    private selectionFrame: Frame;
    // private inventorySelector: ImageButton;
    // private shopSelector: ImageButton;
    private inventoryGui: InventoryGui;
    // private shopGui: ShopGui;

    constructor() {
        super();
        this.screenGui.Name = "SelectionManagerGui";
        this.inventoryGui = new InventoryGui();
        // this.shopGui = new ShopGui();
        const layout = this.populateLayout();
        this.selectionFrame = buildGuiComponent(layout, this.screenGui) as Frame;
    }

    private populateLayout(): GuiElementDescriptor<"Frame"> {
        return {
            type: "Frame",
            name: "SelectionFrame",
            properties: {
                AnchorPoint: new Vector2(0, 0.5),
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
                BackgroundTransparency: 0,
                Position: UDim2.fromScale(0.006, 0.5),
                Size: UDim2.fromScale(0.053, 0.38),
            },
            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                }),
            ],
        }
    }
}
