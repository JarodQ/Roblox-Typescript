import { ReplicatedStorage } from "@rbxts/services";
import { MainGui } from "../../../../Common/shared/Guis/MainGui";
import { PlayerData, PlayerItemData } from "Common/shared/PlayerData/PlayerData";
import { ItemData } from "Common/shared/ItemData";
import { InventoryGui } from "../Inventory/InventoryGui";
import { ShopGui } from "../ShopV2/ShopGui";
import { GuiElementDescriptor } from "../ShopV2/Frames/buildGuiComponent";
import { buildGuiComponent } from "../ShopV2/Frames/buildGuiComponent";
import {
    createUICorner,
    createUIGradient,
    createUIPadding,
    createUIGridLayout,
    createUIstroke,
    createImageLabel,
    createTextLabel,
    createTextButton,
    createImageButton,
    createFrame
} from "../../../../Common/shared/Guis/Util/GuiPresets";
import { hoverEffect, unhoverEffect, clickEffect, playSound } from "Common/shared/Guis/Util/GuiEffects";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const hotbarUpdateEvent = ReplicatedStorage.WaitForChild("UpdateHotbarData") as RemoteEvent;
const requestToolEquip = ReplicatedStorage.WaitForChild("RequestToolEquip") as RemoteEvent;
const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;


export class HotbarGui extends MainGui {
    private hotbarFrame: Frame;
    private hotbarSlots: TextButton[] = [];
    private hotbarItems: string[] = [];
    private previousSlotSelect: TextButton | undefined;


    constructor(hotbarItems: (PlayerItemData | undefined)[] = []) {
        super();
        this.screenGui.Name = "HotBarGui";
        const layout = this.populateLayout();
        this.hotbarFrame = buildGuiComponent(layout, this.screenGui) as Frame;
        this.initializeHotbar();

        //Automatically equip the first item in the hotbar
        // this.previousSlotSelect = this.hotbarSlots[0];

    }

    private initializeHotbar() {
        const playerData = requestPlayerData.InvokeServer() as PlayerData;
        if (!playerData) return;

        const hotbarItems = playerData.hotbarItems;

        for (let i = 0; i < this.hotbarSlots.size(); i++) {
            const itemId = hotbarItems[i + 1];
            let matchedItem: PlayerItemData | undefined;

            // Search through player's items to find the matching variant by ID
            for (const [, entry] of pairs(playerData.items)) {
                for (const [, variant] of pairs(entry.variants)) {
                    if (variant.id === itemId) {
                        matchedItem = variant;
                        break;
                    }
                }
                if (matchedItem) {
                    this.hotbarItems[i] = matchedItem.id;
                    break;
                }
            }

            const slot = this.hotbarSlots[i];
            this.renderItemInHotbarSlot(slot, matchedItem);
        }
    }


    public updateHotbarItems(hotbarItems: (PlayerItemData | undefined)[]) {
        hotbarItems = hotbarItems;
        const hotbarDataUpdate: Record<number, string> = []
        for (let i = 0; i < this.hotbarSlots.size(); i++) {
            const slot = this.hotbarSlots[i];
            const item = hotbarItems[i];
            this.renderItemInHotbarSlot(slot, item);
            if (item && item.id) {
                hotbarDataUpdate[i + 1] = item?.id;
                this.hotbarItems[i] = item?.id
            }
            else { hotbarDataUpdate[i + 1] = "" }
        }
        hotbarUpdateEvent.FireServer(hotbarDataUpdate);

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
            name: "HotBarFrame",
            properties: {
                AnchorPoint: new Vector2(0.5, 0.5),
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
                BackgroundTransparency: 0,
                Position: UDim2.fromScale(0.5, 0.92),
                Size: UDim2.fromScale(0.55, 0.13),
                // onMount: (instance) => {
                //     this.hotbar = instance;
                // },
            },

            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                }),
                createUIPadding({
                    paddingTop: new UDim(0, 10),
                    paddingBottom: new UDim(0, 10),
                    paddingLeft: new UDim(0, 10),
                    paddingRight: new UDim(0, 10),
                }),
                createUIGridLayout({
                    cellSize: UDim2.fromOffset(60, 60),
                    cellPadding: UDim2.fromOffset(20, 20),
                    fillDirectionMaxCells: 8,
                    horizontalAlignment: Enum.HorizontalAlignment.Center,
                }),
                ...this.createHotbarLayout(),
            ],

        }
    }

    private createHotbarLayout(): GuiElementDescriptor<"TextButton">[] {
        const hotbar: GuiElementDescriptor<"TextButton">[] = [];
        for (let i = 0; i < 8; i++) {
            hotbar.push(
                createTextButton({
                    name: `HotbarSlot${i}`,
                    text: "", // Optional: leave empty or use a placeholder
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    size: UDim2.fromScale(0.109, 0.767),
                    onMount: (instance: Instance) => {
                        const slot = instance as TextButton;
                        this.hotbarSlots[i] = slot;
                        // Track item in slot
                        slot.MouseButton1Click.Connect(() => {
                            // Add click logic here
                            if (this.previousSlotSelect) {
                                const previousUIStroke = this.previousSlotSelect.FindFirstChild("UIStroke") as UIStroke;
                                if (previousUIStroke) {
                                    previousUIStroke.Color = Color3.fromRGB(130, 80, 0);
                                    previousUIStroke.Thickness = 3;
                                }
                            }

                            const currentUIStroke = slot.FindFirstChild("UIStroke") as UIStroke;
                            if (currentUIStroke) {
                                if (slot === this.previousSlotSelect) {
                                    currentUIStroke.Color = Color3.fromRGB(130, 80, 0);
                                    currentUIStroke.Thickness = 3;
                                    this.previousSlotSelect = undefined;
                                }
                                else {
                                    currentUIStroke.Color = Color3.fromRGB(255, 153, 0);
                                    currentUIStroke.Thickness = 4;
                                    this.previousSlotSelect = slot;
                                }
                            }

                            print(this.hotbarItems)
                            requestToolEquip.FireServer(this.hotbarItems[i]);
                        });
                    },
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border,
                        }),
                    ],
                }),
            );
        }

        return hotbar;
    }

    private renderItemInHotbarSlot(slot: TextButton, item: PlayerItemData | undefined) {
        if (!item) return;
        for (const child of slot.GetChildren()) {
            if (child.IsA("ImageLabel") || child.IsA("TextLabel")) {
                child.Destroy();
            }
        }
        slot.BackgroundColor3 = Color3.fromRGB(255, 180, 60);

        const icon = new Instance("ImageLabel");
        icon.Image = item.image;
        icon.Size = UDim2.fromScale(1, 1);
        icon.AnchorPoint = new Vector2(0.5, 0.5);
        icon.Position = UDim2.fromScale(0.5, 0.5);
        icon.BackgroundTransparency = 1;
        icon.Parent = slot;

        const label = new Instance("TextLabel");
        label.Text = `x ${item.ownedQuantity}`;
        label.TextColor3 = Color3.fromRGB(255, 255, 255);
        label.TextStrokeTransparency = 0;
        label.BackgroundTransparency = 1;
        label.AnchorPoint = new Vector2(1, 1);
        label.Position = UDim2.fromScale(1, 1);
        label.Size = UDim2.fromScale(0.6, 0.4);
        label.TextScaled = true;
        label.Font = Enum.Font.FredokaOne;
        label.ZIndex = icon.ZIndex + 1;
        label.Parent = icon;
    }

}
