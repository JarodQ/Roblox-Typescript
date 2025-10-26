import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import { ItemData, getShopItemsForCategory } from "Common/shared/ItemData";
import { PlayerData, PlayerItemData } from "Common/shared/PlayerData/PlayerData";
import {
    createFrame,
    createUICorner,
    createUIGradient,
    createTextButton,
    createImageButton,
    createTextLabel,
    createScrollingFrame,
    createUIGridLayout,
    createUIPadding,
    createUIstroke,
    createImageLabel
} from "../GuiPresets";
import {
    hoverEffect,
    unhoverEffect,
    hoverGridEffect,
    unhoverGridEffect,
    clickEffect,
    clickGridEffect,
} from "../GuiEffects";

export class ItemsFrame {
    private frame: Frame;
    private onItemSelect: (item: ItemData) => void;
    private modeLabel: TextLabel | undefined;
    private contentFrame: ScrollingFrame | undefined;
    private seedsSelect: TextButton | undefined;
    private cropsSelect: TextButton | undefined;
    private playerData: PlayerData | undefined;


    constructor(
        parent: ScreenGui,
        onModeChange: (mode: "seeds" | "crops") => void,
        onItemSelect: (item: ItemData) => void,
        playerData: PlayerData // ✅ Add this
    ) {
        this.onItemSelect = onItemSelect;
        this.frame = buildGuiComponent(this.populateLayout(onModeChange), parent) as Frame;
        this.playerData = playerData
    }

    private initializeFrame() {
        this.populateShopLayout("seeds"); // Optional: rebuild layout
    }

    public setDisplayMode(mode: "buy" | "sell", category: "seeds" | "crops") {

        if (mode === "buy") {
            print("Setting Buy mode")
            this.populateShopLayout(category);
            if (this.seedsSelect) this.seedsSelect.Visible = true;
            if (this.cropsSelect) this.cropsSelect.Visible = true;
        } else if (mode === "sell") {
            print("Setting Sell mode")

            this.populateMyItemsLayout();
            if (this.modeLabel) this.modeLabel.Text = "My Items";
            if (this.seedsSelect) this.seedsSelect.Visible = false;
            if (this.cropsSelect) this.cropsSelect.Visible = false;
        }
    }

    private getSellableItems(category: "seeds" | "crops"): ItemData[] {
        const result: ItemData[] = [];
        print("PlayerData: ", this.playerData)
        if (!this.playerData) return result;

        const shopItems = getShopItemsForCategory(category);

        for (const item of shopItems) {
            let ownedQuantity = 0;

            for (const [_, entry] of pairs(this.playerData.items)) {

                for (const [_, variant] of pairs(entry.variants)) {
                    if (variant.id === item.id) {
                        print("Searching for item: ", item, " Item has quantity: ", variant.ownedQuantity);

                        ownedQuantity = variant.ownedQuantity;
                    }
                }
            }

            if (ownedQuantity > 0) {
                result.push({
                    ...item,
                    ownedQuantity, // ✅ Inject runtime field
                });
            }
        }

        return result;
    }

    public populateShopLayout(mode: "seeds" | "crops") {
        if (!this.contentFrame) {
            print("ContentFrame not mounted yet!");
            return;
        }
        this.contentFrame.ClearAllChildren();

        if (this.modeLabel && mode === "seeds") this.modeLabel.Text = "Seeds";
        if (this.modeLabel && mode === "crops") this.modeLabel.Text = "Crops";


        const gridLayout = buildGuiComponent(createUIGridLayout()) as UIGridLayout;
        gridLayout.Parent = this.contentFrame;
        const gridPadding = buildGuiComponent(createUIPadding()) as UIPadding;
        gridPadding.Parent = this.contentFrame;

        const shopItems: ItemData[] = getShopItemsForCategory(mode);
        for (const item of shopItems) {
            const button = buildGuiComponent(this.createShopItemButton(item)) as TextButton | ImageButton;
            button.Parent = this.contentFrame;
        }
    }

    public populateMyItemsLayout() {
        if (!this.contentFrame) {
            print("ContentFrame not mounted yet!");
            return;
        }
        this.contentFrame.ClearAllChildren();

        const gridLayout = buildGuiComponent(createUIGridLayout()) as UIGridLayout;
        gridLayout.Parent = this.contentFrame;
        const gridPadding = buildGuiComponent(createUIPadding()) as UIPadding;
        gridPadding.Parent = this.contentFrame;

        // const sellableItems = this.getSellableItems("seeds"); // or "crops", or both
        const allSellableItems: ItemData[] = [
            ...this.getSellableItems("seeds"),
            ...this.getSellableItems("crops"),
        ];

        for (const item of allSellableItems) {
            const button = buildGuiComponent(this.createShopItemButton(item)) as TextButton | ImageButton;
            button.Parent = this.contentFrame;
        }
    }


    // private getPlayerOwnedItems(): PlayerItemData[] {
    //     const result: PlayerItemData[] = [];

    //     for (const [_, entry] of pairs(this.playerData.items)) {
    //         for (const [_, variant] of pairs(entry.variants)) {
    //             if (variant && variant.ownedQuantity > 0) {
    //                 result.push(variant); // ✅ variant is already PlayerItemData
    //             }
    //         }
    //     }

    //     return result;
    // }

    private createShopItemButton(item: ItemData): GuiElementDescriptor<"ImageButton"> {
        const children = [
            createUICorner({ radius: 8 }),
            createUIstroke({ applyStrokeMode: Enum.ApplyStrokeMode.Border, thickness: 3 }),
            createTextLabel({
                text: item.name,
                textWrapped: true,
                textSize: 14,
                position: UDim2.fromScale(0.5, 1),
                anchorPoint: new Vector2(0.5, 1),
                size: UDim2.fromScale(1, 0.3),
            }),
        ];

        if (item.ownedQuantity !== undefined) {
            children.push(
                createTextLabel({
                    text: `x${item.ownedQuantity}`,
                    textSize: 12,
                    position: UDim2.fromScale(1, 0),
                    anchorPoint: new Vector2(1, 0),
                    size: UDim2.fromScale(0.5, 0.3),
                    textColor: Color3.fromRGB(200, 200, 200),
                })
            );
        }

        return createImageButton({
            name: item.id,
            image: item.image,
            backgroundTransparency: .75,
            size: UDim2.fromOffset(100, 100),
            onClick: () => this.onItemSelect(item),
            onMount: (btn) => {
                btn.MouseEnter.Connect(() => hoverGridEffect(btn));
                btn.MouseLeave.Connect(() => unhoverGridEffect(btn));
                btn.Activated.Connect(() => {
                    clickGridEffect(btn, [btn]);
                    this.onItemSelect(item);
                });
            },
            children,
        });
    }

    // private createInventoryItemButton(item: PlayerItemData): GuiElementDescriptor<"ImageButton"> {
    //     return createImageButton({
    //         name: item.id,
    //         image: item.image,
    //         backgroundTransparency: 0.75,
    //         size: UDim2.fromOffset(100, 100),
    //         onClick: () => this.onItemSelect(item), // ✅ You may need to adapt this
    //         onMount: (btn) => {
    //             btn.MouseEnter.Connect(() => hoverGridEffect(btn));
    //             btn.MouseLeave.Connect(() => unhoverGridEffect(btn));
    //             btn.Activated.Connect(() => {
    //                 clickGridEffect(btn, [btn]);
    //                 this.onItemSelect(item);
    //             });
    //         },
    //         children: [
    //             createUICorner({ radius: 8 }),
    //             createUIstroke({
    //                 applyStrokeMode: Enum.ApplyStrokeMode.Border,
    //                 thickness: 3,
    //             }),
    //             createTextLabel({
    //                 text: item.name,
    //                 textWrapped: true,
    //                 textSize: 14,
    //                 position: UDim2.fromScale(0.5, 1),
    //                 anchorPoint: new Vector2(0.5, 1),
    //                 size: UDim2.fromScale(1, 0.3),
    //             }),
    //             createTextLabel({
    //                 text: `x${item.ownedQuantity}`,
    //                 textSize: 12,
    //                 position: UDim2.fromScale(1, 0),
    //                 anchorPoint: new Vector2(1, 0),
    //                 size: UDim2.fromScale(0.5, 0.3),
    //                 textColor: Color3.fromRGB(200, 200, 200),
    //                 // textXAlignment: Enum.TextXAlignment.Right,
    //             }),
    //         ],
    //     });
    // }


    private populateLayout(onModeChange: (mode: "seeds" | "crops") => void): GuiElementDescriptor<"Frame"> {
        const buttonInstances: TextButton[] = [];

        // Helper to attach effects
        //const attachEffects = (button: TextButton, mode: "seeds" | "crops") => {
        const attachEffects = (button: TextButton) => {
            buttonInstances.push(button);
            button.MouseEnter.Connect(() => hoverEffect(button));
            button.MouseLeave.Connect(() => unhoverEffect(button));
            button.Activated.Connect(() => {
                clickEffect(button, buttonInstances);
                //this.setMode(mode); // ✅ Use the passed mode
            });
        };
        return {
            type: "Frame",
            name: "ItemsFrame",
            properties: {
                BackgroundColor3: new Color3(0, 0, 0),
                BackgroundTransparency: 0.55,
                Position: UDim2.fromScale(0.039, 0.194),
                Size: UDim2.fromScale(0.254, 0.752),
            },
            onMount: () => this.initializeFrame(), // ✅ Wait until mounted
            children: [
                createUICorner({ radius: 8 }),
                createTextLabel({
                    name: "SelectedFrame",
                    anchorPoint: new Vector2(0.5, 0),
                    position: UDim2.fromScale(0.494, 0.022),
                    size: UDim2.fromScale(0.925, 0.14),
                    text: "Seeds",
                    textSize: 40,
                    textStrokeTransparency: 0,
                    onMount: (label) => {
                        this.modeLabel = label;
                    },
                }),
                createImageLabel({
                    name: "Separator",
                    imageId: "",
                    backgroundTransparency: .5,
                    position: UDim2.fromScale(.018, 0.17),
                    size: UDim2.fromScale(0.954, 0.025),
                    children: [
                        createUICorner({ radius: 8 })
                    ]
                }),
                createScrollingFrame({
                    name: "ContentFrame",
                    position: UDim2.fromScale(0, 0.2),
                    size: UDim2.fromScale(1.0, 0.8),
                    backgroundTransparency: 1,
                    canvasSize: new UDim2(0, 0, 0, 0),
                    automaticCanvasSize: Enum.AutomaticSize.Y,
                    scrollingDirection: Enum.ScrollingDirection.Y,
                    scrollBarThickness: 6,
                    onMount: (frame) => {
                        this.contentFrame = frame;
                    },
                    children: [],
                }),
                createFrame({
                    name: "SeedsSelectFrame",
                    position: UDim2.fromScale(0.024, -0.103),
                    size: UDim2.fromScale(0.476, 0.103),
                    clipDescendants: true,
                    backgroundTransparency: 1,
                    children: [
                        createTextButton({
                            name: "SeedSelect",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.5, 0.2),
                            size: UDim2.fromScale(1, 0.982),
                            backgroundTransparency: 0.2,
                            onClick: () => onModeChange("seeds"),
                            // onMount: (btn) => attachEffects(btn, "seeds"),
                            onMount: (label) => {
                                attachEffects;
                                this.seedsSelect = label;
                            },
                            //onMount: attachEffects,
                            children: [
                                createUICorner({ radius: 8 }),
                                createImageLabel({
                                    name: "ImageLabel",
                                    position: UDim2.fromScale(0.0, -0.178),
                                    size: UDim2.fromScale(0.357, 1.131),
                                    imageId: "rbxassetid://108601628629100",
                                }),
                                createTextLabel({
                                    name: "TextLabel",
                                    position: UDim2.fromScale(0.297, 0.0),
                                    size: UDim2.fromScale(0.703, 0.808),
                                    text: "Seeds",
                                    textSize: 25,
                                    textStrokeTransparency: 0,
                                }),
                            ],
                        }),
                    ],
                }),
                createFrame({
                    name: "CropsSelectFrame",
                    position: UDim2.fromScale(0.501, -0.103),
                    size: UDim2.fromScale(0.476, 0.103),
                    clipDescendants: true,
                    backgroundTransparency: 1,
                    children: [
                        createTextButton({
                            name: "CropSelect",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.5, 0.2),
                            size: UDim2.fromScale(1, 0.982),
                            onClick: () => onModeChange("crops"),
                            onMount: (label) => {
                                attachEffects;
                                this.cropsSelect = label;
                            },
                            // onMount: (btn) => attachEffects(btn, "crops"),
                            //onMount: attachEffects,
                            children: [
                                createUICorner({ radius: 8 }),
                                createImageLabel({
                                    name: "ImageLabel",
                                    position: UDim2.fromScale(0.0, -0.178),
                                    size: UDim2.fromScale(0.357, 1.131),
                                    imageId: "rbxassetid://108601628629100",
                                }),
                                createTextLabel({
                                    name: "TextLabel",
                                    position: UDim2.fromScale(0.297, 0.0),
                                    size: UDim2.fromScale(0.703, 0.808),
                                    text: "Crops",
                                    textSize: 25,
                                    textStrokeTransparency: 0,
                                }),
                            ],
                        }),
                    ],
                })
            ],
        };
    }
}
