import { ReplicatedStorage } from "@rbxts/services";
import { switchModel } from "./shopModelController";
import { GuiElements, KeyPathResult } from "./guiManager";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";

const shopRemoteEvent = ReplicatedStorage.WaitForChild("shopRemoteEvent") as RemoteEvent;
const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;
const requestShopPrice = ReplicatedStorage.WaitForChild("RequestShopPrice") as RemoteFunction;

export function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

function showSelected(instance: Instance, guiElements: GuiElements, previousClick: GuiObject | undefined) {
    if (previousClick === instance) return;
    if (instance.IsA("GuiObject")) {
        instance.BackgroundTransparency = 0;

        const unlockedText = getGui(guiElements.txtLabels, "ItemUnlocked") as TextLabel;
        const lockedText = getGui(guiElements.txtLabels, "ItemLocked") as TextLabel;
        const itemUnlocked = instance.GetAttribute("Unlocked") as boolean;
        print("itemUnlocked: ", itemUnlocked)
        if (unlockedText && lockedText) {
            if (itemUnlocked) {
                unlockedText.Visible = true;
                lockedText.Visible = false;
                print("unlocked text displayed")
            }
            else if (!itemUnlocked) {
                unlockedText.Visible = false;
                lockedText.Visible = true;
                print("locked text displayed")

            }
        }

        const instanceStroke = instance.FindFirstChild("UIStroke") as UIStroke;
        if (instanceStroke) instanceStroke.Enabled = true;

        for (const child of instance.GetChildren()) {
            if (child.IsA("ImageLabel")) {
                child.ImageColor3 = Color3.fromRGB(255, 255, 255); // bright white
            }
            if (child.IsA("TextLabel")) {
                child.TextColor3 = Color3.fromRGB(255, 255, 255); // bright white
            }
        }

        if (previousClick && previousClick.IsA("GuiObject")) {
            previousClick.BackgroundTransparency = 1;

            const previousStroke = previousClick.FindFirstChild("UIStroke") as UIStroke;
            if (previousStroke) previousStroke.Enabled = false;

            for (const child of previousClick.GetChildren()) {
                if (child.IsA("ImageLabel")) {
                    child.ImageColor3 = Color3.fromRGB(0, 0, 0); // muted gray
                }
                if (child.IsA("TextLabel")) {
                    child.TextColor3 = Color3.fromRGB(0, 0, 0); // muted gray
                }
            }
        }
        previousClick = instance;
        return previousClick;
    }
}

export function resolvePlayerData(playerData: PlayerData, key: string,): KeyPathResult {
    function search(obj: unknown, currentPath: string[] = []): KeyPathResult {
        if (typeOf(obj) !== "table") return { exists: false };

        for (const [k, value] of pairs(obj as Record<string, unknown>)) {
            const newPath = [...currentPath, k];

            if (k === key) {
                return {
                    exists: true,
                    path: newPath.join("."),
                    value,
                };
            }

            const result = search(value, newPath);
            if (result.exists) return result;
        }

        return { exists: false };
    }

    return search(playerData);
}

export function parseItemVariant(name: string): { base: string; variant: "L" | "U" | undefined } {
    const [base, variant] = name.match("^(.*)_([LU])$") as LuaTuple<[string, string]>;

    if (!base || !variant) return { base: name, variant: undefined };
    return { base, variant: variant as "L" | "U" };
}

function changePriceScroll(instance: Instance, guiElements: GuiElements, amount?: number) {
    const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
    const confirmTransaction = getGui(guiElements.txtButtons, "ConfirmTransaction");
    if (!priceScroll || !confirmTransaction) return;
    let currentAmount = tonumber(priceScroll.Text);
    if (!currentAmount) currentAmount = 0;
    if (amount) currentAmount += amount;
    if (!amount) {
        print("Amount not given")
        const playerData = requestPlayerData.InvokeServer() as PlayerData | undefined;
        if (!playerData) return;
        print("playerData retrieved")
        const transaction = confirmTransaction.GetAttribute("Transaction");
        if (currentItem) {
            print("CurrentItem: ", currentItem)
            const itemPrice = requestShopPrice.InvokeServer(currentItem, transaction) as number;
            if (itemPrice === 0) return;
            print("Item Price: ", itemPrice);
            print("Transaction type: ", transaction)
            if (transaction === "Buy") {
                const currency = resolvePlayerData(playerData, "currency");
                if (
                    currency &&
                    typeOf(currency) === "table" &&
                    "value" in currency &&
                    typeOf((currency as { value: unknown }).value) === "number"
                ) {
                    print("Setting buy amount");
                    currentAmount = math.floor((currency as { value: number }).value / itemPrice);
                }
            }
            else if (transaction === "Sell") {
                const item = resolvePlayerData(playerData, currentItem);
                if (
                    item &&
                    typeOf(item) === "table" &&
                    "value" in item &&
                    typeOf((item as { value: unknown }).value) === "number"
                ) {
                    print("Setting sell amount");
                    currentAmount = math.floor((item as { value: number }).value);
                }
            }
        }
    }
    priceScroll.Text = tostring(currentAmount);
}

let previousItem: GuiObject | undefined;
let previousBuySell: GuiObject | undefined;
let currentItem: string | undefined;
export const shopFunctions = {
    onSelectClicked(instance: Instance, guiElements: GuiElements) {
        currentItem = instance.GetAttribute("Item") as string;
        previousItem = showSelected(instance, guiElements, previousItem);
        switchModel(instance, guiElements);
    },
    onPurchaseSelectClicked(instance: Instance, guiElements: GuiElements) {
        previousBuySell = showSelected(instance, guiElements, previousItem);
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll") as TextBox;
        const confirmTransaction = getGui(guiElements.txtButtons, "ConfirmTransaction") as TextButton;
        const transaction = instance.GetAttribute("Transaction");
        if (transaction) confirmTransaction.SetAttribute("Transaction", transaction);
        if (priceScroll) priceScroll.Text = "";
    },
    onPlus1Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 1);
    },
    onPlus5Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 5);
    },
    onPlus10Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 10);
    },
    onPlus20Clicked(instance: Instance, guiElements: GuiElements) {
        print("Plus20 called")
        changePriceScroll(instance, guiElements, 20);
    },
    onPlusMaxClicked(instance: Instance, guiElements: GuiElements) {
        print("PlusMax called")
        changePriceScroll(instance, guiElements);
    },
    onClearClicked(instance: Instance, guiElements: GuiElements) {
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        if (!priceScroll) return;
        priceScroll.Text = "";
    },
    onSeedSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("Seed select clicked")
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const seedFrame = getGui(guiElements.scrollingFrame, "SeedFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        print(vipFrame, weaponFrame, seedFrame, cropFrame)
        if (vipFrame) vipFrame.Visible = false;
        if (seedFrame) seedFrame.Visible = true;
        if (weaponFrame) weaponFrame.Visible = false;
        if (cropFrame) cropFrame.Visible = false;
    },
    onWeaponSelectClicked(instance: Instance, guiElements: GuiElements) {
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const seedFrame = getGui(guiElements.scrollingFrame, "SeedFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (seedFrame) seedFrame.Visible = false;
        if (weaponFrame) weaponFrame.Visible = true;
        if (cropFrame) cropFrame.Visible = false;
    },
    onCropSelectClicked(instance: Instance, guiElements: GuiElements) {
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const seedFrame = getGui(guiElements.scrollingFrame, "SeedFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (seedFrame) seedFrame.Visible = false;
        if (weaponFrame) weaponFrame.Visible = false;
        if (cropFrame) cropFrame.Visible = true;
    },
    onVIPSelectClicked(instance: Instance, guiElements: GuiElements) {
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const seedFrame = getGui(guiElements.scrollingFrame, "SeedFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        if (vipFrame) vipFrame.Visible = true;
        if (seedFrame) seedFrame.Visible = false;
        if (weaponFrame) weaponFrame.Visible = false;
        if (cropFrame) cropFrame.Visible = false;
    },
    onBuyClicked(instance: Instance, guiElements: GuiElements) {
        print("Buy button clicked");
        shopRemoteEvent.FireServer("Buy", instance.GetAttribute("Item"));
    },
    onSellClicked(instance: Instance, guiElements: GuiElements) {
        print("Sell button clicked!");
    },
    onCloseClicked(instance: Instance, guiElements: GuiElements) {
        print("Close Button clicked!");
    },
    onRobuxBuy(instance: Instance, guiElements: GuiElements) {
        print("Buy with Robux clicked!");
    },
    onOpenBuy(instance: Instance, guiElements: GuiElements) {
        print("Open Buy Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = true;
        if (sellFrame) sellFrame.Visible = false;
    },
    onOpenSell(instance: Instance, guiElements: GuiElements) {
        print("Open Sell Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = true;
    },
    onOpenVIP(instance: Instance, guiElements: GuiElements) {
        print("Open VIP Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = true;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = false;
    },
}
