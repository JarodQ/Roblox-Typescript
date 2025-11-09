import { ReplicatedStorage } from "@rbxts/services";
import { buildGuiComponent, GuiElementDescriptor } from "../../ShopV2/Frames/buildGuiComponent";
import {
    createFrame,
    createUICorner,
    createUIstroke,
    createTextButton,
    createTextBox,
    createImageLabel,
    createTextLabel,
    createScrollingFrame,
    createUIGridLayout,
    createUIPadding,
    createImageButton,
} from "../../../../../Common/shared/Guis/Util/GuiPresets";
import { hoverEffect, unhoverEffect } from "../../../../../Common/shared/Guis/Util/GuiEffects";
import { PlayerData, ItemEntry, PlayerItemData } from "Common/shared/PlayerData/PlayerData";
import { ItemData } from "Common/shared/ItemData";

const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;

interface HotbarSlot {
    frame: Frame;
    item?: PlayerItemData;
}

export class InventoryDisplay {
    private frame: Frame;
    private playerData: PlayerData;
    private itemGrid?: ScrollingFrame;
    private itemFilter: "all" | "seeds" | "crops" | "weapons" = "all";
    private searchBoxRef?: TextBox;
    private searchImageRef?: ImageButton;
    private isSearchActive: boolean;
    private hotbar?: Frame;
    private hotbarFrames: TextButton[] = [];
    public hotbarItems: (PlayerItemData | undefined)[] = [];
    private draggedHotbarIndex: number | undefined = undefined;
    private isDragging: boolean = false;
    private draggedItem?: PlayerItemData;
    private dragIcon?: ImageLabel | Frame;
    private getPlayerData: () => PlayerData;
    private closeInventory: () => void;
    private updateHotbarItems: () => void;
    private dragMoveConnection?: RBXScriptConnection;



    constructor(
        parent: ScreenGui,
        playerData: PlayerData,
        getPlayerData: () => PlayerData,
        closeInventory: () => void,
        updateHotbar: () => void,
    ) {
        this.playerData = playerData;
        this.getPlayerData = getPlayerData;
        this.closeInventory = closeInventory;
        this.updateHotbarItems = updateHotbar;
        const layout = this.populateLayout(() => parent.Destroy());
        this.frame = buildGuiComponent(layout, parent) as Frame;
        this.isSearchActive = false;
        game.GetService("UserInputService").InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed || input.UserInputType !== Enum.UserInputType.MouseButton1) return;

            const mousePos = game.GetService("UserInputService").GetMouseLocation();
            this.tryPlaceDraggedItem(mousePos);
        });
        this.initializeHotbar();
        this.updateItems(this.getFilteredPlayerItems(this.itemFilter, ""));
    }

    public setDragging(item: PlayerItemData, hotbarSwap: boolean = false) {
        // ✅ Return previously dragged item if it wasn't placed
        if (this.draggedItem && !hotbarSwap) {
            this.addItemToInventory(this.draggedItem);
        }

        this.startDragging(item);
    }

    // private initializeHotbar() {
    //     const playerData = requestPlayerData.InvokeServer() as PlayerData;
    //     if (!playerData) return;

    //     const hotbarItems = playerData.hotbarItems;


    //     for (let i = 0; i < this.hotbarFrames.size(); i++) {
    //         const itemId = hotbarItems[i + 1];
    //         let matchedItem: PlayerItemData | undefined;

    //         // Search through player's items to find the matching variant by ID
    //         for (const [, entry] of pairs(playerData.items)) {
    //             for (const [, variant] of pairs(entry.variants)) {
    //                 if (variant.id === itemId) {
    //                     matchedItem = variant;
    //                     break;
    //                 }
    //             }
    //             if (matchedItem) {
    //                 hotbarItems[i] = matchedItem.id;
    //                 break;
    //             }
    //         }

    //         const slot = this.hotbarFrames[i];
    //         this.renderItemInHotbarSlot(slot, matchedItem);
    //     }
    // }
    private initializeHotbar() {
        const playerData = requestPlayerData.InvokeServer() as PlayerData;
        if (!playerData) return;

        const hotbarIds = playerData.hotbarItems;

        for (let i = 0; i < this.hotbarFrames.size(); i++) {
            const itemId = hotbarIds[i + 1]; // hotbar uses 1-based indexing
            let matchedItem: PlayerItemData | undefined;

            // Search through player's items to find the matching variant by ID
            for (const [, entry] of pairs(playerData.items)) {
                for (const [, variant] of pairs(entry.variants)) {
                    if (variant.id === itemId) {
                        matchedItem = variant;
                        break;
                    }
                }
                if (matchedItem) break;
            }

            this.hotbarItems[i] = matchedItem; // ✅ Store in this.hotbarItems
            const slot = this.hotbarFrames[i];
            this.renderItemInHotbarSlot(slot, matchedItem);
        }
    }

    private cancelDragAndReturnItem() {
        this.draggedItem = undefined;
        this.isDragging = false;
        this.dragIcon?.Destroy();
        this.dragIcon = undefined;
        this.dragMoveConnection?.Disconnect();
        this.dragMoveConnection = undefined;
    }

    private populateLayout(
        onClose: () => void,
    ): GuiElementDescriptor<"Frame"> {
        const buttonInstances: TextButton[] = [];

        function invClickEffect(
            button: TextButton | ImageButton,
            allButtons: (TextButton | ImageButton)[],
        ) {
            for (const other of allButtons) {
                if (other === button) {
                    other.BackgroundColor3 = Color3.fromRGB(255, 200, 150); // Highlighted
                } else {
                    other.BackgroundColor3 = Color3.fromRGB(150, 100, 85); // Dimmed
                }
            }
        }

        const attachEffects = (button: TextButton) => {
            buttonInstances.push(button);
            // button.MouseEnter.Connect(() => hoverEffect(button));
            // button.MouseLeave.Connect(() => unhoverEffect(button));
            button.Activated.Connect(() => invClickEffect(button, buttonInstances));
        };

        return {
            type: "Frame",
            name: "InventoryDisplay",
            properties: {
                AnchorPoint: new Vector2(0.5, 0.5),
                Position: UDim2.fromScale(0.5, 0.5),
                Size: UDim2.fromScale(0.6, 0.7),
                BackgroundTransparency: 0,
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
            },
            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                }),
                createFrame({
                    name: "SearchFrame",
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.66, 0.065),
                    size: UDim2.fromScale(0.28, 0.057),//0.235
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                        }),
                        createTextBox({
                            name: "SearchBox",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0.239, 0),
                            size: UDim2.fromScale(0.755, 1),
                            placeholderText: "Search",
                            textSize: 25,
                            textStrokeTransparency: 0,
                            textXAlignment: Enum.TextXAlignment.Right,
                            onMount: (textBox) => {
                                this.searchBoxRef = textBox;

                                textBox.GetPropertyChangedSignal("Text").Connect(() => {
                                    const searchText: string = textBox.Text;
                                    this.updateItems(this.getFilteredPlayerItems(this.itemFilter, searchText));
                                    if (this.searchBoxRef && this.searchImageRef) {
                                        if (searchText !== "" && !this.isSearchActive) {
                                            this.isSearchActive = true;
                                            this.searchImageRef.Image = "rbxassetid://87686940256852"; // 'X' icon
                                        } else if (searchText === "" && this.isSearchActive) {
                                            this.isSearchActive = false;
                                            this.searchImageRef.Image = "rbxassetid://99546542595933"; // Magnifying glass
                                        }
                                    }
                                });
                            },
                        }),
                        createImageButton({
                            name: "SearchImage",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.038, -0.043),
                            size: UDim2.fromScale(0.157, 1.087),
                            image: "rbxassetid://99546542595933",
                            onMount: (imageButton) => {
                                this.searchImageRef = imageButton;
                                imageButton.MouseButton1Click.Connect(() => {
                                    if (this.searchBoxRef && this.searchImageRef) {

                                        if (this.isSearchActive) {
                                            // Clear search
                                            this.searchBoxRef.Text = "";
                                            this.isSearchActive = false;
                                            this.searchImageRef.Image = "rbxassetid://99546542595933";
                                            this.updateItems(this.getFilteredPlayerItems(this.itemFilter, ""));
                                        } else {
                                            // Focus search box
                                            this.searchBoxRef.CaptureFocus();
                                        }
                                    }
                                });
                            },
                        }),

                    ],
                }),
                createTextButton({
                    name: "AllSelect",
                    text: "All",
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.074, 0.065),
                    size: UDim2.fromScale(0.13, 0.057),
                    onClick: () => this.updateItems(this.getFilteredPlayerItems("all")),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border,
                        }),
                    ],
                }),
                createTextButton({
                    name: "SeedSelect",
                    text: "Seeds",
                    backgroundColor: Color3.fromRGB(150, 100, 85),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.229, 0.065),
                    size: UDim2.fromScale(0.13, 0.057),
                    onClick: () => this.updateItems(this.getFilteredPlayerItems("seeds")),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border,
                        }),
                    ],
                }),
                createTextButton({
                    name: "CropSelect",
                    text: "Crops",
                    backgroundColor: Color3.fromRGB(150, 100, 85),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.385, 0.065),
                    size: UDim2.fromScale(0.13, 0.057),
                    onClick: () => this.updateItems(this.getFilteredPlayerItems("crops")),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border,
                        }),
                    ],
                }),
                createTextButton({
                    name: "Weapons",
                    text: "Weapons",
                    backgroundColor: Color3.fromRGB(150, 100, 85),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.541, 0.065),
                    size: UDim2.fromScale(0.13, 0.057),
                    onClick: () => this.updateItems(this.getFilteredPlayerItems("weapons")),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border,
                        }),
                    ],
                }),
                createFrame({
                    name: "InventoryItems",
                    anchorPoint: new Vector2(0.5, 0.5),
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.5, 0.45),
                    size: UDim2.fromScale(0.9, 0.6),
                    children: [
                        createUICorner({ radius: 8 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                        }),
                        createScrollingFrame({
                            name: "ItemsScroll",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0, 0),
                            size: UDim2.fromScale(0.995, 1),
                            scrollBarImageColor: Color3.fromRGB(130, 80, 0),
                            onMount: (instance) => {
                                this.itemGrid = instance as ScrollingFrame;
                            },
                        }),
                    ],
                }),
                createFrame({
                    name: "HotBarFrame",
                    anchorPoint: new Vector2(0.5, 0.5),
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.5, 0.88),
                    size: UDim2.fromScale(0.9, 0.189),
                    onMount: (instance) => {
                        this.hotbar = instance;
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
                }),
                createTextButton({
                    name: "Close",
                    position: UDim2.fromScale(0.937, -0.099),
                    size: UDim2.fromScale(0.102, 0.152),
                    anchorPoint: new Vector2(0, 0),
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    text: "",
                    onClick: () => this.closeInventory(),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border
                        }),
                        createImageLabel({
                            imageId: "rbxassetid://87686940256852",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.491, -0.247),
                            size: UDim2.fromScale(1.176, 1.176),
                        }),
                        createTextLabel({
                            text: "Close",
                            textStrokeTransparency: 0,
                            anchorPoint: new Vector2(0, 1),
                            position: UDim2.fromScale(0, 1)
                        }),

                    ],
                }),
            ],
        };
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
                        this.hotbarFrames.push(slot);

                        // Track item in slot
                        this.hotbarItems[i] = undefined;
                        slot.MouseButton1Click.Connect(() => {
                            const slotItem = this.hotbarItems[i];

                            if (this.draggedItem) {
                                const previousItem = this.hotbarItems[i];
                                this.hotbarItems[i] = this.draggedItem;
                                this.renderItemInHotbarSlot(slot, this.draggedItem);

                                if (previousItem && previousItem.id !== this.draggedItem.id) {
                                    if (this.draggedHotbarIndex !== undefined) {
                                        // ✅ Swapping between hotbar slots
                                        this.hotbarItems[this.draggedHotbarIndex] = previousItem;
                                        this.renderItemInHotbarSlot(this.hotbarFrames[this.draggedHotbarIndex], previousItem);
                                        this.cancelDragAndReturnItem();
                                    } else {
                                        // ✅ Dragged from inventory — start dragging displaced item
                                        this.setDragging(previousItem, true);
                                    }
                                } else {
                                    // ✅ No displaced item or same item — just finish drag
                                    this.cancelDragAndReturnItem();
                                }

                                this.draggedHotbarIndex = undefined;
                            } else if (slotItem) {
                                // ✅ Start dragging from this hotbar slot
                                this.hotbarItems[i] = undefined;
                                this.draggedHotbarIndex = i;

                                // Clear visuals
                                slot.GetChildren().forEach(child => {
                                    slot.BackgroundColor3 = Color3.fromRGB(255, 200, 150);
                                    if (child.IsA("ImageLabel") || child.IsA("TextLabel")) {
                                        child.Destroy();
                                    }
                                });

                                this.setDragging(slotItem, true);
                            }
                            // this.updateHotbarItems();
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
            )
        }

        return hotbar;
    }

    private isItemInHotbar(item: PlayerItemData): boolean {
        for (const hotbarItem of this.hotbarItems) {
            if (hotbarItem && hotbarItem.id === item.id) {
                return true;
            }
        }
        return false;
    }

    private getFilteredPlayerItems(
        filter: "all" | "seeds" | "crops" | "weapons",
        searchText?: string,
    ): PlayerItemData[] {
        this.itemFilter = filter;
        const matchedItems: PlayerItemData[] = [];
        const playerData = this.getPlayerData();

        // Build a set of hotbar item IDs for fast lookup
        const hotbarItems = this.hotbarItems as (PlayerItemData | undefined)[];
        // print("hotbar items: ", hotbarItems)
        const filteredHotbarItems: PlayerItemData[] = [];

        for (const item of hotbarItems) {
            if (item !== undefined) {
                filteredHotbarItems.push(item);
            }
        }

        const hotbarIds = new Set(filteredHotbarItems.map((item) => item.id));
        // print("filtered hotbar items: ", hotbarIds)


        for (const [, entry] of pairs(playerData.items)) {
            for (const [, variant] of pairs(entry.variants)) {
                if (!variant) continue;
                if (!variant.ownedQuantity || variant.ownedQuantity <= 0) continue;
                if (hotbarIds.has(variant.id)) continue; // 🔥 Skip if already in hotbar

                const nameMatch =
                    searchText === undefined ||
                    (variant.name.lower().find(searchText.lower())[0] !== undefined);

                const typeMatch = filter === "all" || variant.category === filter;

                if (nameMatch && typeMatch) {
                    matchedItems.push(variant);
                }
            }
        }

        return matchedItems;
    }

    public updateItems(items: PlayerItemData[]) {
        if (!this.itemGrid) return;
        this.itemGrid.ClearAllChildren();

        // Create and parent padding
        const paddingDescriptor = createUIPadding({
            paddingTop: new UDim(0, 10),
            paddingBottom: new UDim(0, 10),
            paddingLeft: new UDim(0, 10),
            paddingRight: new UDim(0, 10),
        });
        buildGuiComponent(paddingDescriptor, this.itemGrid);

        // Create and parent grid layout
        const gridDescriptor = createUIGridLayout({
            cellSize: UDim2.fromOffset(60, 60),
            cellPadding: UDim2.fromOffset(15, 15),
            fillDirectionMaxCells: 8,
            horizontalAlignment: Enum.HorizontalAlignment.Left,
        });
        buildGuiComponent(gridDescriptor, this.itemGrid);

        // Create item buttons
        for (const item of items) {
            if (this.isItemInHotbar(item)) continue;
            const frameDescriptor = createTextButton({
                name: item.id,
                backgroundColor: Color3.fromRGB(255, 180, 60),
                backgroundTransparency: 0,
                size: UDim2.fromScale(0.2, 0.1),
                onMount: (frameInstance) => {
                    const frame = frameInstance as TextButton;

                    // Attach drag logic to the image button
                    const imageButton = frame.FindFirstChild(item.name) as ImageButton;
                    if (imageButton) {
                        imageButton.MouseButton1Down.Connect(() => {
                            this.setDragging(item);
                            frame.Destroy(); // ✅ Destroy the frame when item is picked up
                        });
                    }
                },
                children: [
                    createUICorner({ radius: 8 }),
                    createUIstroke({
                        color: Color3.fromRGB(130, 80, 0),
                        thickness: 3,
                        applyStrokeMode: Enum.ApplyStrokeMode.Border,
                    }),
                    createImageButton({
                        name: item.name,
                        anchorPoint: new Vector2(0, 0),
                        position: UDim2.fromScale(0, 0),
                        size: UDim2.fromScale(1, 1),
                        image: item.image,
                        children: [
                            createTextLabel({
                                backgroundTransparency: 1,
                                position: UDim2.fromScale(0.276, 0.614),
                                size: UDim2.fromScale(0.717, 0.383),
                                text: `x ${item.ownedQuantity}`,
                                textScaled: true,
                                textStrokeTransparency: 0,
                            }),
                        ],
                    }),
                ],
            });


            buildGuiComponent(frameDescriptor, this.itemGrid);
        }
    }


    private addItemToInventory(item: PlayerItemData) {
        if (!this.itemGrid) return;

        // ✅ Unified filter check using category
        if (this.itemFilter !== "all" && item.category !== this.itemFilter) return;

        const frameDescriptor = createTextButton({
            name: item.id,
            backgroundColor: Color3.fromRGB(255, 180, 60),
            backgroundTransparency: 0,
            size: UDim2.fromScale(0.2, 0.1),
            onMount: (frameInstance) => {
                const frame = frameInstance as TextButton;

                const imageButton = frame.FindFirstChild(item.name) as ImageButton;
                if (imageButton) {
                    imageButton.MouseButton1Down.Connect(() => {
                        this.setDragging(item);
                        frame.Destroy();
                    });
                }
            },
            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                    applyStrokeMode: Enum.ApplyStrokeMode.Border,
                }),
                createImageButton({
                    name: item.name,
                    anchorPoint: new Vector2(0, 0),
                    position: UDim2.fromScale(0, 0),
                    size: UDim2.fromScale(1, 1),
                    image: item.image,
                    children: [
                        createTextLabel({
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0.276, 0.614),
                            size: UDim2.fromScale(0.717, 0.383),
                            text: `x ${item.ownedQuantity}`,
                            textScaled: true,
                            textStrokeTransparency: 0,
                        }),
                    ],
                }),
            ],
        });

        buildGuiComponent(frameDescriptor, this.itemGrid);
    }


    private startDragging(item: PlayerItemData) {
        this.draggedItem = item;
        this.isDragging = true;

        if (this.dragIcon) this.dragIcon.Destroy();

        this.dragIcon = new Instance("ImageLabel");
        this.dragIcon.Image = item.image;
        this.dragIcon.Size = UDim2.fromOffset(60, 60); // Fixed size for clarity
        this.dragIcon.AnchorPoint = new Vector2(1, 1); // Center on mouse
        this.dragIcon.BackgroundColor3 = Color3.fromRGB(255, 180, 60)
        this.dragIcon.BackgroundTransparency = 0;
        this.dragIcon.ZIndex = 100;
        this.dragIcon.ScaleType = Enum.ScaleType.Fit;
        this.dragIcon.SizeConstraint = Enum.SizeConstraint.RelativeXX;
        this.dragIcon.Parent = this.frame;

        const corner = new Instance("UICorner");
        corner.CornerRadius = new UDim(0, 8);
        corner.Parent = this.dragIcon;

        const stroke = new Instance("UIStroke");
        stroke.Color = Color3.fromRGB(130, 80, 0); // Warm brown tone
        stroke.Thickness = 3;
        stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
        stroke.Parent = this.dragIcon;

        const quantityLabel = new Instance("TextLabel");
        quantityLabel.Text = `x ${item.ownedQuantity}`;
        quantityLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
        quantityLabel.TextStrokeTransparency = 0;
        quantityLabel.BackgroundTransparency = 1;
        quantityLabel.AnchorPoint = new Vector2(1, 1); // Bottom-right corner
        quantityLabel.Position = UDim2.fromScale(1, 1); // Bottom-right of parent
        quantityLabel.Size = UDim2.fromScale(0.6, 0.4); // Adjust as needed
        quantityLabel.TextScaled = true;
        quantityLabel.Font = Enum.Font.FredokaOne;
        quantityLabel.ZIndex = this.dragIcon.ZIndex + 1;
        quantityLabel.Parent = this.dragIcon;

        const updatePosition = () => {
            const mousePos = game.GetService("UserInputService").GetMouseLocation();
            const framePos = this.frame.AbsolutePosition;
            const localPos = mousePos.sub(framePos);
            this.dragIcon!.Position = UDim2.fromOffset(localPos.X, localPos.Y);
        };

        updatePosition(); // Initial position

        this.dragMoveConnection = game.GetService("UserInputService").InputChanged.Connect((input) => {
            if (this.isDragging && input.UserInputType === Enum.UserInputType.MouseMovement) {
                updatePosition();
            }
        });
    }



    private tryPlaceDraggedItem(mousePosition: Vector2) {
        if (!this.isDragging || !this.draggedItem) return;

        let placed = false;

        // for (let i = 0; i < this.hotbarFrames.size(); i++) {
        //     const slot = this.hotbarFrames[i];
        //     const absPos = slot.AbsolutePosition;
        //     const absSize = slot.AbsoluteSize;

        //     const withinX = mousePosition.X >= absPos.X && mousePosition.X <= absPos.X + absSize.X;
        //     const withinY = mousePosition.Y >= absPos.Y && mousePosition.Y <= absPos.Y + absSize.Y;

        //     if (withinX && withinY) {
        //         const previousItem = this.hotbarItems[i];
        //         this.hotbarItems[i] = this.draggedItem;
        //         this.renderItemInHotbarSlot(slot, this.draggedItem);

        //         if (
        //             previousItem &&
        //             previousItem.id !== this.draggedItem.id
        //         ) {
        //             //this.addItemToInventory(previousItem);
        //         }

        //         placed = true;
        //         break;
        //     }
        // }

        // ✅ If not placed into hotbar, return to inventory
        // if (!placed) {
        //     this.addItemToInventory(this.draggedItem);
        // }

        if (!placed) {
            this.addItemToInventory(this.draggedItem);
        }

        this.cancelDragAndReturnItem();
    }




    // private placeItemInHotbar(index: number) {
    //     if (!this.draggedItem) return;

    //     const slot = this.hotbarFrames[index];
    //     const previousItem = this.hotbarItems[index];

    //     // Clear visuals from slot
    //     for (const child of slot.GetChildren()) {
    //         if (child.IsA("ImageLabel") || child.IsA("TextLabel")) {
    //             child.Destroy();
    //         }
    //     }

    //     // Update slot background
    //     slot.BackgroundColor3 = Color3.fromRGB(255, 180, 60);

    //     // Create new icon
    //     const icon = new Instance("ImageLabel");
    //     icon.Image = this.draggedItem.image;
    //     icon.Size = UDim2.fromScale(1, 1);
    //     icon.AnchorPoint = new Vector2(0.5, 0.5);
    //     icon.Position = UDim2.fromScale(0.5, 0.5);
    //     icon.BackgroundTransparency = 1;
    //     icon.Parent = slot;

    //     // Add quantity label
    //     const quantityLabel = new Instance("TextLabel");
    //     quantityLabel.Text = `x ${this.draggedItem.ownedQuantity}`;
    //     quantityLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
    //     quantityLabel.TextStrokeTransparency = 0;
    //     quantityLabel.BackgroundTransparency = 1;
    //     quantityLabel.AnchorPoint = new Vector2(1, 1);
    //     quantityLabel.Position = UDim2.fromScale(1, 1);
    //     quantityLabel.Size = UDim2.fromScale(0.6, 0.4);
    //     quantityLabel.TextScaled = true;
    //     quantityLabel.Font = Enum.Font.FredokaOne;
    //     quantityLabel.ZIndex = icon.ZIndex + 1;
    //     quantityLabel.Parent = icon;

    //     // Add stroke and corner
    //     const stroke = new Instance("UIStroke");
    //     stroke.Color = Color3.fromRGB(130, 80, 0);
    //     stroke.Thickness = 2;
    //     stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
    //     stroke.Parent = icon;

    //     const corner = new Instance("UICorner");
    //     corner.CornerRadius = new UDim(0, 8);
    //     corner.Parent = icon;

    //     // Update hotbar state
    //     this.hotbarItems[index] = this.draggedItem;

    //     // Return previous item to inventory
    //     if (previousItem) {
    //         this.addItemToInventory(previousItem);
    //     }

    //     // Clear drag state
    //     this.draggedItem = undefined;
    //     this.isDragging = false;
    //     this.dragIcon?.Destroy();
    //     this.dragIcon = undefined;
    //     this.dragMoveConnection?.Disconnect();
    //     this.dragMoveConnection = undefined;
    // }

    private renderItemInHotbarSlot(slot: TextButton, item: PlayerItemData | undefined) {
        // slot.ClearAllChildren();
        // Clear visuals from slot
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

        // const corner = new Instance("UICorner");
        // corner.CornerRadius = new UDim(0, 8);
        // corner.Parent = slot;

        // const stroke = new Instance("UIStroke");
        // stroke.Color = Color3.fromRGB(130, 80, 0);
        // stroke.Thickness = 2;
        // stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
        // stroke.Parent = slot;
    }
}

