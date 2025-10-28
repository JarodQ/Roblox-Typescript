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
    public seedsSelect: TextButton | undefined;
    public cropsSelect: TextButton | undefined;
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

    public updatePlayerData(playerData: PlayerData) {
        this.playerData = playerData;
    }

    public setDisplayMode(mode: "buy" | "sell", category: "seeds" | "crops") {

        if (mode === "buy") {
            print("Setting Buy mode")
            this.populateShopLayout(category);
            if (this.seedsSelect) this.seedsSelect.Visible = true;
            if (this.cropsSelect) this.cropsSelect.Visible = true;
        } else if (mode === "sell") {
            print("Setting Sell mode")

            this.populateMyItemsLayout(mode);
            if (this.modeLabel) this.modeLabel.Text = "My Items";
            if (this.seedsSelect) this.seedsSelect.Visible = false;
            if (this.cropsSelect) this.cropsSelect.Visible = false;
        }
    }

    private getSellableItems(category: "seeds" | "crops"): ItemData[] {
        const result: ItemData[] = [];
        if (!this.playerData) return result;

        const shopItems = getShopItemsForCategory(category);

        for (const item of shopItems) {
            let ownedQuantity = 0;

            for (const [_, entry] of pairs(this.playerData.items)) {
                for (const [_, variant] of pairs(entry.variants)) {

                    if (variant.id === item.id) {

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

    public populateMyItemsLayout(mode: "buy" | "sell") {
        if (!this.contentFrame || mode !== "sell") {
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

        // ✅ Sort alphabetically by item name
        allSellableItems.sort((a, b) => a.name.lower() < b.name.lower());

        for (const item of allSellableItems) {
            const button = buildGuiComponent(this.createShopItemButton(item)) as TextButton | ImageButton;
            button.Parent = this.contentFrame;
        }
    }

    private createShopItemButton(item: ItemData): GuiElementDescriptor<"ImageButton"> {
        const children = [
            createUICorner({ radius: 8 }),
            createUIstroke({
                applyStrokeMode: Enum.ApplyStrokeMode.Border,
                thickness: 3,
                color: Color3.fromRGB(130, 80, 0)
            }),
            createTextLabel({
                text: item.name,
                textWrapped: true,
                textSize: 14,
                position: UDim2.fromScale(0.5, 1),
                anchorPoint: new Vector2(0.5, 1),
                size: UDim2.fromScale(1, 0.3),
                textStrokeTransparency: 0,
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
                    textColor: Color3.fromRGB(255, 255, 255),
                    textStrokeTransparency: 0,
                })
            );
        }

        return createImageButton({
            name: item.id,
            image: item.image,
            backgroundColor: Color3.fromRGB(255, 180, 60),
            backgroundTransparency: 0,
            size: UDim2.fromOffset(100, 100),
            onClick: () => this.onItemSelect(item),
            onMount: (btn) => {
                btn.Activated.Connect(() => {
                    clickGridEffect(btn, [btn]);
                    this.onItemSelect(item);
                });
            },
            children,
        });
    }

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
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
                BackgroundTransparency: 0,
                Position: UDim2.fromScale(0.039, 0.194),
                Size: UDim2.fromScale(0.254, 0.752),
            },
            onMount: () => this.initializeFrame(), // ✅ Wait until mounted
            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                }),
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
                    backgroundColor: Color3.fromRGB(130, 80, 0),
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
                    position: UDim2.fromScale(0.028, -0.10),
                    size: UDim2.fromScale(0.472, 0.10),
                    clipDescendants: true,
                    backgroundTransparency: 1,
                    children: [
                        createTextButton({
                            name: "SeedSelect",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.504, 0.2),
                            size: UDim2.fromScale(0.897, 0.982),
                            backgroundColor: Color3.fromRGB(255, 200, 150),
                            backgroundTransparency: 0,
                            zIndex: 1,
                            onClick: () => onModeChange("seeds"),
                            // onMount: (btn) => attachEffects(btn, "seeds"),
                            onMount: (label) => {
                                attachEffects(label);
                                this.seedsSelect = label;
                            },
                            //onMount: attachEffects,
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({
                                    color: Color3.fromRGB(130, 80, 0),
                                    thickness: 3,
                                    applyStrokeMode: Enum.ApplyStrokeMode.Border,
                                }),
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
                    position: UDim2.fromScale(0.501, -0.1),
                    size: UDim2.fromScale(0.472, 0.1),
                    clipDescendants: true,
                    backgroundTransparency: 1,
                    children: [
                        createTextButton({
                            name: "CropSelect",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.5, 0.2),
                            size: UDim2.fromScale(0.897, 0.982),
                            backgroundColor: Color3.fromRGB(150, 100, 85),
                            backgroundTransparency: 0,
                            zIndex: 0,
                            onClick: () => onModeChange("crops"),
                            onMount: (label) => {
                                attachEffects(label);
                                this.cropsSelect = label;
                            },
                            // onMount: (btn) => attachEffects(btn, "crops"),
                            //onMount: attachEffects,
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({
                                    color: Color3.fromRGB(130, 80, 0),
                                    thickness: 3,
                                    applyStrokeMode: Enum.ApplyStrokeMode.Border,
                                }),
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
