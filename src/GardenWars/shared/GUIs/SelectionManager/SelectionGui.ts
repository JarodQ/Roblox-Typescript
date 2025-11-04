import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../../../../Common/shared/Guis/MainGui";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { ItemData } from "Common/shared/ItemData";
import { InventoryGui } from "../Inventory/InventoryGui";
import { HotbarGui } from "../HotBar/HotbarGui";
import { ShopGui } from "../ShopV2/ShopGui";
import { GuiElementDescriptor } from "../ShopV2/Frames/buildGuiComponent";
import { buildGuiComponent } from "../ShopV2/Frames/buildGuiComponent";
import {
    createUICorner,
    createUIGradient,
    createUIstroke,
    createImageLabel,
    createTextLabel,
    createTextButton,
    createImageButton
} from "../../../../Common/shared/Guis/Util/GuiPresets";
import { hoverEffect, unhoverEffect, clickEffect, playSound } from "Common/shared/Guis/Util/GuiEffects";

const teleportToGarden = ReplicatedStorage.WaitForChild("TeleportToGarden") as RemoteEvent;
const teleportToShop = ReplicatedStorage.WaitForChild("TeleportToShop") as RemoteEvent;

export class SelectionManager extends MainGui {
    private selectionFrame: Frame;
    // private inventorySelector: ImageButton;
    // private shopSelector: ImageButton;
    private inventoryGui: InventoryGui;
    private hotBarGui: HotbarGui;
    // private shopGui: ShopGui;

    constructor() {
        super();
        this.screenGui.Name = "SelectionManagerGui";
        this.inventoryGui = new InventoryGui(() => this.updateHotbar());
        this.hotBarGui = new HotbarGui(this.inventoryGui.inventoryDisplay.hotbarItems);
        // this.shopGui = new ShopGui();
        const layout = this.populateLayout();
        this.selectionFrame = buildGuiComponent(layout, this.screenGui) as Frame;
    }

    public updateHotbar() {
        this.hotBarGui.updateHotbarItems(this.inventoryGui.inventoryDisplay.hotbarItems);
        const hotbarScreen = this.hotBarGui.getScreenGui();
        hotbarScreen.Enabled = true;
    }

    private populateLayout(): GuiElementDescriptor<"Frame"> {
        const buttonInstances: (TextButton | ImageButton)[] = [];

        const attachEffects = (button: TextButton | ImageButton) => {
            buttonInstances.push(button);
            button.MouseEnter.Connect(() => hoverEffect(button));
            button.MouseLeave.Connect(() => unhoverEffect(button));
            button.Activated.Connect(() => clickEffect(button, buttonInstances));
        };


        return {
            type: "Frame",
            name: "SelectionFrame",
            properties: {
                AnchorPoint: new Vector2(0, 0.5),
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
                BackgroundTransparency: 1,
                Position: UDim2.fromScale(0.006, 0.481),
                Size: UDim2.fromScale(0.057, 0.305),
            },
            children: [
                // createUICorner({ radius: 8 }),
                // createUIstroke({
                //     color: Color3.fromRGB(130, 80, 0),
                //     thickness: 3,
                // }),
                createImageButton({
                    name: "Shop",
                    position: UDim2.fromScale(0.5, 0.165),
                    size: UDim2.fromScale(1, 0.333),
                    image: "rbxassetid://102667665656517",
                    onMount: (button) => {
                        button.MouseEnter.Connect(() => hoverEffect(button));
                        button.MouseLeave.Connect(() => unhoverEffect(button));
                        button.Activated.Connect(() => {
                            playSound("rbxassetid://96721760461704");
                            clickEffect(button, buttonInstances);
                            teleportToShop.FireServer();
                        });
                    }
                }),
                createImageButton({
                    name: "Garden",
                    position: UDim2.fromScale(0.5, .5),
                    size: UDim2.fromScale(1, 0.333),
                    image: "rbxassetid://116628885994374",
                    onMount: (button) => {
                        button.MouseEnter.Connect(() => hoverEffect(button));
                        button.MouseLeave.Connect(() => unhoverEffect(button));
                        button.Activated.Connect(() => {
                            playSound("rbxassetid://98888775996495");
                            clickEffect(button, buttonInstances);
                            teleportToGarden.FireServer();
                        });
                    }
                }),
                createImageButton({
                    name: "Inventory",
                    position: UDim2.fromScale(0.5, 0.832),
                    size: UDim2.fromScale(1, 0.333),
                    image: "rbxassetid://98405619153543",
                    onMount: (button) => {
                        button.MouseEnter.Connect(() => hoverEffect(button));
                        button.MouseLeave.Connect(() => unhoverEffect(button));
                        button.Activated.Connect(() => {
                            playSound("rbxassetid://81659213909958");
                            clickEffect(button, buttonInstances);
                            const inventoryScreen = this.inventoryGui.getScreenGui();
                            inventoryScreen.Enabled = true;
                            const hotbarScreen = this.hotBarGui.getScreenGui();
                            hotbarScreen.Enabled = false;
                        });
                    }
                }),
            ],
        }
    }
}
