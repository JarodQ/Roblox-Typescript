import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import {
    createFrame,
    createUICorner,
    createUIstroke,
    createUIGradient,
    createTextLabel,
    createTextButton,
    createTextBox,
    createImageLabel,
} from "../GuiPresets";
import { hoverEffect, unhoverEffect, clickEffect } from "../GuiEffects";
import { ShopGui } from "../ShopGui";
import { ItemData } from "Common/shared/ItemData";
import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";

export class ItemInfoFrame {
    private frame: Frame;
    private shopGui: ShopGui;
    private playerData: PlayerData;
    private quantityBox: TextBox | undefined;
    private selectedItem: ItemData | undefined;
    private itemNameLabel: TextLabel | undefined;
    private itemImageLabel: ImageLabel | undefined;
    private creditsAmountLabel: TextLabel | undefined;
    private valorAmountLabel: TextLabel | undefined;
    private creditsPriceLabel: TextLabel | undefined;
    private valorPriceLabel: TextLabel | undefined;
    private itemDescLabel: TextLabel | undefined;

    constructor(
        parent: ScreenGui,
        getSelectedItem: () => ItemData | undefined,
        playerData: PlayerData,
        shopGui: ShopGui,
    ) {
        this.shopGui = shopGui;
        this.playerData = playerData;
        const layout = this.populateItemInfoLayout(
            (amount) => this.adjustQuantity(amount),
            () => this.setMaxQuantity(),
            (currency) => this.purchase(currency, playerData, shopGui),
            () => this.clearQuantity()
        );

        this.frame = buildGuiComponent(layout, parent) as Frame;
    }

    private isItemData(item: ItemData): item is ItemData {
        return "prices" in item;
    }

    public updateItem(item: ItemData | undefined, mode: "buy" | "sell") {
        this.selectedItem = item;

        //Reset Transaction info upon selection
        if (this.quantityBox) this.quantityBox.Text = "";
        this.updateTotalPrices();

        if (!this.itemNameLabel || !this.itemDescLabel || !this.itemImageLabel || !this.creditsAmountLabel || !this.valorAmountLabel) return;
        if (item && this.isItemData(item)) {
            const price = item.prices[mode];
            this.itemNameLabel.Text = item.name;
            this.itemDescLabel.Text = item.description;
            this.itemImageLabel.Image = item.image;
            this.creditsAmountLabel.Text = price.credits !== undefined ? `${price.credits}` : "-";
            this.valorAmountLabel.Text = price.valor !== undefined ? `${price.valor}` : "-";
        }
        else {
            this.itemNameLabel.Text = "";
            this.itemDescLabel.Text = "";
            this.itemImageLabel.Image = "";
            this.creditsAmountLabel.Text = ""
            this.creditsAmountLabel.Text = "";
            this.valorAmountLabel.Text = "";
        }


    }

    private adjustQuantity(amount: number) {
        if (!this.selectedItem || !this.quantityBox) return;
        const current = tonumber(this.quantityBox.Text) ?? 0;
        this.quantityBox.Text = tostring(current + amount);
        this.updateTotalPrices();
    }

    private setMaxQuantity() {
        if (!this.selectedItem || !this.quantityBox) return;

        const mode = this.shopGui.getMode();
        const playerData = this.shopGui.getPlayerData();

        let maxQuantity = 0;

        if (mode === "buy") {
            const creditData = resolvePlayerData(playerData, "credits");
            const valorData = resolvePlayerData(playerData, "valor");

            const creditPrice = this.selectedItem.prices.buy.credits;
            const valorPrice = this.selectedItem.prices.buy.valor;

            const creditMax = creditData.exists && creditPrice !== undefined
                ? math.floor((creditData.value as number) / creditPrice)
                : 0;

            const valorMax = valorData.exists && valorPrice !== undefined
                ? math.floor((valorData.value as number) / valorPrice)
                : 0;

            maxQuantity = math.max(creditMax, valorMax);
        } else if (mode === "sell") {
            // Search for owned quantity in playerData
            for (const [_, entry] of pairs(playerData.items)) {
                for (const [_, variant] of pairs(entry.variants)) {
                    if (variant.id === this.selectedItem.id) {
                        maxQuantity = variant.ownedQuantity;
                        break;
                    }
                }
            }
        }

        this.quantityBox.Text = tostring(maxQuantity);
        this.updateTotalPrices();
    }

    private clearQuantity() {
        if (!this.selectedItem || !this.quantityBox) return;
        this.quantityBox.Text = "";
        this.updateTotalPrices();
    }

    private updateTotalPrices() {
        if (!this.selectedItem || !this.creditsPriceLabel || !this.valorPriceLabel || !this.quantityBox) return;

        const quantity = tonumber(this.quantityBox.Text) ?? 0;
        const creditPrice = this.selectedItem.prices.buy.credits;
        const valorPrice = this.selectedItem.prices.buy.valor;

        this.creditsPriceLabel.Text = creditPrice !== undefined
            ? `${creditPrice * quantity}`
            : "-";

        this.valorPriceLabel.Text = valorPrice !== undefined
            ? `${valorPrice * quantity}`
            : "-";
    }

    private purchase(currency: "credits" | "valor", playerData: PlayerData, shopGui: ShopGui) {
        if (!this.selectedItem || !this.quantityBox) return;
        const quantity = tonumber(this.quantityBox.Text) ?? 0;
        shopGui.handlePurchase(quantity, currency);
        this.updateTotalPrices();
    }


    private populateItemInfoLayout(
        onAdjust: (amount: number) => void,
        onMax: () => void,
        onPurchase: (currency: "credits" | "valor") => void,
        clearQuantity: () => void,
    ): GuiElementDescriptor<"Frame"> {
        const buttonInstances: TextButton[] = [];

        const attachEffects = (button: TextButton) => {
            buttonInstances.push(button);
            button.MouseEnter.Connect(() => hoverEffect(button));
            button.MouseLeave.Connect(() => unhoverEffect(button));
            button.Activated.Connect(() => clickEffect(button, buttonInstances));
        };

        return {
            type: "Frame",
            name: "ItemInfoFrame",
            properties: {
                BackgroundColor3: new Color3(0, 0, 0),
                BackgroundTransparency: 0.4,
                Position: UDim2.fromScale(0.693, 0.194),
                Size: UDim2.fromScale(0.254, 0.752),
            },
            children: [
                createUICorner({ radius: 8 }),
                createFrame({
                    name: "Info",
                    position: UDim2.fromScale(0, 0),
                    size: UDim2.fromScale(1, .532),
                    backgroundTransparency: 1,
                    children: [
                        createFrame({
                            name: "Credits",
                            anchorPoint: new Vector2(0.5, 0.5),
                            position: UDim2.fromScale(0.612, 0.356),
                            size: UDim2.fromScale(0.438, 0.157),
                            backgroundTransparency: 0.3,
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({ thickness: 1.8 }),
                                createTextLabel({
                                    name: "SelectedCredits",
                                    backgroundTransparency: 1,
                                    position: UDim2.fromScale(0.375, 0.018),
                                    size: UDim2.fromScale(0.571, 0.982),
                                    font: Enum.Font.FredokaOne,
                                    textColor: new Color3(0, 200, 0),
                                    text: "10.1k",
                                    textSize: 45,
                                    textStrokeTransparency: 0,
                                    onMount: (label) => {
                                        this.creditsAmountLabel = label;
                                    },
                                }),
                            ],
                        }),
                        createFrame({
                            name: "Valor",
                            anchorPoint: new Vector2(0.5, 0.5),
                            position: UDim2.fromScale(0.612, 0.554),
                            size: UDim2.fromScale(0.438, 0.157),
                            backgroundTransparency: 0.3,
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({ thickness: 1.8 }),
                                createTextLabel({
                                    name: "SelectedValor",
                                    backgroundTransparency: 1,
                                    position: UDim2.fromScale(0.375, 0.018),
                                    size: UDim2.fromScale(0.571, 0.982),
                                    font: Enum.Font.FredokaOne,
                                    textColor: new Color3(255, 200, 0),
                                    text: "10.1k",
                                    textSize: 45,
                                    textStrokeTransparency: 0,
                                    onMount: (label) => {
                                        this.valorAmountLabel = label;
                                    },
                                }),
                            ],
                        }),
                        createFrame({
                            name: "Item",
                            anchorPoint: new Vector2(0.5, 0.5),
                            backgroundColor: Color3.fromRGB(255, 255, 255),
                            backgroundTransparency: 0.7,
                            position: UDim2.fromScale(0.192, 0.455),
                            size: UDim2.fromScale(0.28, 0.32),
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({ applyStrokeMode: Enum.ApplyStrokeMode.Border, thickness: 6 }),
                                createFrame({
                                    name: "ImageFrame",
                                    anchorPoint: new Vector2(0.5, 0.5),
                                    backgroundTransparency: 0.3,
                                    position: UDim2.fromScale(0.5, 0.5),
                                    size: UDim2.fromScale(0.889, 0.889),
                                    children: [
                                        createUICorner({ radius: 8 }),
                                        createImageLabel({
                                            name: "SelectedImage",
                                            imageId: "",
                                            position: UDim2.fromScale(0, -.1),
                                            size: UDim2.fromScale(1, 1),
                                            onMount: (label) => {
                                                this.itemImageLabel = label;
                                            },
                                        }),
                                        createTextLabel({
                                            name: "amount",
                                            position: UDim2.fromScale(0.46, 0.74),
                                            size: UDim2.fromScale(0.54, 0.26),
                                            text: "",
                                        })
                                    ]
                                })
                            ],
                        }),
                        createImageLabel({
                            name: "Separator",
                            imageId: "",
                            backgroundTransparency: .5,
                            position: UDim2.fromScale(.018, 0.187),
                            size: UDim2.fromScale(0.954, 0.036),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createImageLabel({
                            name: "Separator",
                            imageId: "",
                            backgroundTransparency: .5,
                            position: UDim2.fromScale(.018, 0.907),
                            size: UDim2.fromScale(0.954, 0.036),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextLabel({
                            name: "SelectedItem",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.494, 0.022),
                            size: UDim2.fromScale(0.925, 0.178),
                            font: Enum.Font.FredokaOne,
                            text: "Item Name",
                            textSize: 40,
                            textScaled: true,
                            onMount: (label) => {
                                this.itemNameLabel = label;
                            },

                        }),
                        createTextLabel({
                            name: "Description",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.018, 0.682),
                            size: UDim2.fromScale(0.9, 0.165),
                            font: Enum.Font.FredokaOne,
                            text: "Placeholder description",
                            textSize: 21,
                            textScaled: true,
                            onMount: (label) => {
                                this.itemDescLabel = label;
                            },
                        })
                    ],
                }),
                createFrame({
                    name: "TransactionFrame",
                    position: UDim2.fromScale(0, 0.505),
                    size: UDim2.fromScale(1, 0.495),
                    backgroundTransparency: 1,
                    children: [
                        createTextBox({
                            name: "QuantityBox",
                            backgroundTransparency: 0.5,
                            position: UDim2.fromScale(0.037, 0.066),
                            size: UDim2.fromScale(0.683, 0.212),
                            font: Enum.Font.FredokaOne,
                            placeholderText: "Enter Amount",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 35,
                            textStrokeTransparency: 0,
                            onMount: (textBox) => {
                                this.quantityBox = textBox;

                                // ✅ Enforce numeric input and update prices
                                textBox.GetPropertyChangedSignal("Text").Connect(() => {
                                    const raw = textBox.Text;
                                    const numeric = raw.gsub("%D", "")[0]; // Remove non-digit characters
                                    if (raw !== numeric) {
                                        textBox.Text = numeric;
                                    }
                                    this.updateTotalPrices();
                                });
                            },
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "Clear",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.755, 0.064),
                            size: UDim2.fromScale(0.201, 0.212),
                            text: "CLEAR",
                            textColor: Color3.fromRGB(255, 0, 0),
                            textSize: 20,
                            onClick: () => clearQuantity(),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "Plus1",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.035, 0.324),
                            size: UDim2.fromScale(0.129, 0.169),
                            text: "+1",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 20,
                            onClick: () => onAdjust(1),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "Plus5",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.197, 0.324),
                            size: UDim2.fromScale(0.129, 0.169),
                            text: "+5",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 20,
                            onClick: () => onAdjust(5),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "Plus10",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.346, 0.324),
                            size: UDim2.fromScale(0.129, 0.169),
                            text: "+10",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 20,
                            onClick: () => onAdjust(10),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "Plus20",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.507, 0.324),
                            size: UDim2.fromScale(0.129, 0.169),
                            text: "+20",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 20,
                            onClick: () => onAdjust(20),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "PlusMax",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.672, 0.324),
                            size: UDim2.fromScale(0.155, 0.169),
                            text: "Max",
                            textColor: Color3.fromRGB(0, 255, 0),
                            textSize: 20,
                            onClick: () => onMax(),
                            children: [
                                createUICorner({ radius: 8 })
                            ]
                        }),
                        createTextButton({
                            name: "ConfirmCredits",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.034, 0.541),
                            size: UDim2.fromScale(0.647, 0.186),
                            text: "",
                            backgroundColor: Color3.fromRGB(0, 255, 0),
                            backgroundTransparency: .5,
                            onClick: () => onPurchase('credits'),
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({
                                    applyStrokeMode: Enum.ApplyStrokeMode.Border,
                                    thickness: 1.5,
                                }),
                                createTextLabel({
                                    name: "Price",
                                    anchorPoint: new Vector2(0, 0),
                                    position: UDim2.fromScale(0.36, 0.018),
                                    size: UDim2.fromScale(0.586, 0.982),
                                    font: Enum.Font.FredokaOne,
                                    text: "10.1k",
                                    textColor: Color3.fromRGB(0, 200, 0),
                                    textSize: 45,
                                    textStrokeTransparency: 0,
                                    onMount: (label) => {
                                        this.creditsPriceLabel = label;
                                    },
                                })
                            ]
                        }),
                        createTextButton({
                            name: "ConfirmValor",
                            anchorPoint: new Vector2(0, 0),
                            position: UDim2.fromScale(0.034, 0.765),
                            size: UDim2.fromScale(0.647, 0.186),
                            text: "",
                            backgroundColor: Color3.fromRGB(255, 200, 0),
                            backgroundTransparency: .5,
                            onClick: () => onPurchase('valor'),
                            children: [
                                createUICorner({ radius: 8 }),
                                createUIstroke({
                                    applyStrokeMode: Enum.ApplyStrokeMode.Border,
                                    thickness: 1.5,
                                }),
                                createTextLabel({
                                    name: "Price",
                                    anchorPoint: new Vector2(0, 0),
                                    position: UDim2.fromScale(0.36, 0.018),
                                    size: UDim2.fromScale(0.586, 0.982),
                                    font: Enum.Font.FredokaOne,
                                    text: "10.1k",
                                    textColor: Color3.fromRGB(255, 200, 0),
                                    textSize: 45,
                                    textStrokeTransparency: 0,
                                    onMount: (label) => {
                                        this.valorPriceLabel = label;
                                    },
                                })
                            ]
                        }),
                    ],
                })
            ],
        };
    }
}
