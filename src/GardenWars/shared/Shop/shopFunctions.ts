import { ReplicatedStorage } from "@rbxts/services";
import { switchModel } from "./shopModelController";
import { GuiElements } from "./guiManager";
import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { ITEM_IMAGES } from "./itemImages";
import { shopInfo } from "GardenWars/server/Shop/mainShopPrices";

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
        if (unlockedText && lockedText) {
            if (itemUnlocked) {
                unlockedText.Visible = true;
                lockedText.Visible = false;
            }
            else if (!itemUnlocked) {
                unlockedText.Visible = false;
                lockedText.Visible = true;

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



export function parseItemVariant(name: string): { base: string; variant: "L" | "U" | undefined } {
    const [base, variant] = name.match("^(.*)_([LU])$") as LuaTuple<[string, string]>;

    if (!base || !variant) return { base: name, variant: undefined };
    return { base, variant: variant as "L" | "U" };
}

function changePriceScroll(instance: Instance, guiElements: GuiElements, amount?: number) {
    const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
    const confirmTransactionCredits = getGui(guiElements.txtButtons, "ConfirmTransactionCredits");
    const confirmTransactionValor = getGui(guiElements.txtButtons, "ConfirmTransactionValor");
    const transactionCreditsPriceLabel = confirmTransactionCredits?.FindFirstChild("Price") as TextLabel;
    const transactionValorPriceLabel = confirmTransactionValor?.FindFirstChild("Price") as TextLabel;

    if (!confirmTransactionCredits || !confirmTransactionValor || !transactionCreditsPriceLabel || !transactionValorPriceLabel) return;
    if (!priceScroll) return;
    let currentAmount = tonumber(priceScroll.Text);
    if (!currentAmount) currentAmount = 0;
    if (amount) currentAmount += amount;
    const playerData = requestPlayerData.InvokeServer() as PlayerData | undefined;
    if (!playerData) return;
    const transaction = priceScroll.GetAttribute("Transaction");

    let totalCreditsCost = 0;
    let totalValorCost = 0;
    if (currentItem) {
        const itemPriceCredits = requestShopPrice.InvokeServer(currentItem, transaction, "credits") as number;
        const itemPriceValor = requestShopPrice.InvokeServer(currentItem, transaction, "valor") as number;

        if (transaction === "Buy") {
            const creditsData = resolvePlayerData(playerData, "credits");
            const valorData = resolvePlayerData(playerData, "valor");

            const creditsBalance = (creditsData as { value: number }).value;
            const maxCreditsAmount = math.floor(creditsBalance / itemPriceCredits);

            const valorBalance = (valorData as { value: number }).value;
            const maxValorAmount = math.floor(valorBalance / itemPriceValor);

            if (
                creditsData &&
                typeOf(creditsData) === "table" &&
                "value" in creditsData &&
                typeOf((creditsData as { value: unknown }).value) === "number"
            ) {

                if (amount) totalCreditsCost = currentAmount * itemPriceCredits
                else if (!amount && maxCreditsAmount >= maxValorAmount) {
                    currentAmount = maxCreditsAmount;
                    totalCreditsCost = maxCreditsAmount * itemPriceCredits;
                    totalValorCost = maxCreditsAmount * itemPriceValor;
                }


                // transactionCreditsPriceLabel.Text = tostring(maxCreditsAmount * itemPriceCredits);
            }

            if (
                valorData &&
                typeOf(valorData) === "table" &&
                "value" in valorData &&
                typeOf((valorData as { value: unknown }).value) === "number"
            ) {

                if (amount) totalValorCost = currentAmount * itemPriceValor
                else if (!amount && maxValorAmount > maxCreditsAmount) {
                    currentAmount = maxCreditsAmount;
                    totalCreditsCost = maxValorAmount * itemPriceCredits;
                    totalValorCost = maxValorAmount * itemPriceValor;
                }
                // transactionValorPriceLabel.Text = tostring(maxValorAmount * itemPriceCredits);
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
                if (amount) {
                    totalCreditsCost = currentAmount * itemPriceCredits;
                    totalValorCost = currentAmount * itemPriceValor;
                }
                else if (!amount) {
                    currentAmount = math.floor((item as { value: number }).value);
                    totalCreditsCost = currentAmount * itemPriceCredits;
                    totalValorCost = currentAmount * itemPriceValor;
                }

            }
        }
    }
    priceScroll.Text = tostring(currentAmount);

    transactionCreditsPriceLabel.Text = tostring(totalCreditsCost);
    transactionValorPriceLabel.Text = tostring(totalValorCost);


}

function setConfirmTransaction(instance: Instance, guiElements: GuiElements) {
    const confirmTransactionCredits = getGui(guiElements.txtButtons, "ConfirmTransactionCredits");
    const confirmTransactionValor = getGui(guiElements.txtButtons, "ConfirmTransactionValor");
    const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
    if (!confirmTransactionCredits || !confirmTransactionValor || !priceScroll) return;
    const currentAmount = priceScroll.Text
}

let previousItem: GuiObject | undefined;
let previousBuySell: GuiObject | undefined;
let currentItem: string | undefined;
export const shopFunctions = {
    onSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("Select Clicked");
        currentItem = instance.GetAttribute("Item") as string;
        previousItem = showSelected(instance, guiElements, previousItem);
        switchModel(instance, guiElements);

        const selectedItemImageLabel = getGui(guiElements.imgLabels, "SelectedItemImageLabel");
        const selectedItemTextLabel = getGui(guiElements.txtLabels, "SelectedItemTextLabel");
        const selectedItemCreditsLabel = getGui(guiElements.txtLabels, "SelectedItemCreditsLabel");
        const selectedItemValorLabel = getGui(guiElements.txtLabels, "SelectedItemValorLabel");
        if (!selectedItemImageLabel || !selectedItemTextLabel || !selectedItemCreditsLabel || !selectedItemValorLabel) return;
        const selectedItem = instance.GetAttribute("Item") as string;
        if (selectedItem) selectedItemTextLabel.Text = selectedItem;

        const selectedImage = ITEM_IMAGES[selectedItem as keyof shopInfo];
        if (selectedImage) selectedItemImageLabel.Image = selectedImage;

        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        const transaction = priceScroll?.GetAttribute("Transaction");
        if (transaction) {
            const selectedPriceCredits = requestShopPrice.InvokeServer(currentItem, transaction, "credits") as number;
            const selectedPriceValor = requestShopPrice.InvokeServer(currentItem, transaction, 'valor') as number;
            if (selectedPriceCredits && selectedPriceValor) {
                selectedItemCreditsLabel.Text = tostring(selectedPriceCredits);
                selectedItemValorLabel.Text = tostring(selectedPriceValor);
            }
        }

    },
    onPurchaseSelectClicked(instance: Instance, guiElements: GuiElements) {

    },
    onMyItemSelectClicked(instance: Instance, guiElements: GuiElements) {


    },
    onPlus1Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 1);
        setConfirmTransaction(instance, guiElements);
    },
    onPlus5Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 5);
        setConfirmTransaction(instance, guiElements);
    },
    onPlus10Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 10);
        setConfirmTransaction(instance, guiElements);
    },
    onPlus20Clicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements, 20);
        setConfirmTransaction(instance, guiElements);
    },
    onPlusMaxClicked(instance: Instance, guiElements: GuiElements) {
        changePriceScroll(instance, guiElements);
        setConfirmTransaction(instance, guiElements);
    },
    onClearClicked(instance: Instance, guiElements: GuiElements) {
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        if (!priceScroll) return;
        priceScroll.Text = "";
    },
    onSeedSelectClicked(instance: Instance, guiElements: GuiElements) {
        const cropSelect = getGui(guiElements.txtButtons, "CropSelect");
        if (cropSelect) cropSelect.BackgroundTransparency = 0.2;
        if (instance.IsA("GuiObject")) {
            instance.BackgroundTransparency = .55;
        }

        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const seedFrame = getGui(guiElements.scrollingFrame, "SeedFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
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
        const seedSelect = getGui(guiElements.txtButtons, "SeedSelect");
        if (seedSelect) seedSelect.BackgroundTransparency = 0.2;
        if (instance.IsA("GuiObject")) {
            instance.BackgroundTransparency = .55;
        }

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
    onTransactionClicked(instance: Instance, guiElements: GuiElements) {
        print("Transaction button clicked");
        const transaction = instance.GetAttribute("Transaction");
        const currencyType = instance.GetAttribute("CurrencyType");
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        const itemAmount = tonumber(priceScroll?.Text);
        if (!itemAmount) return;
        shopRemoteEvent.FireServer(transaction, currentItem, currencyType, itemAmount);
    },
    onCloseClicked(instance: Instance, guiElements: GuiElements) {
        print("Close Button clicked!");
    },
    onRobuxBuy(instance: Instance, guiElements: GuiElements) {
        print("Buy with Robux clicked!");
    },
    onOpenBuy(instance: Instance, guiElements: GuiElements) {
        print("Open Buy Store!");
        const selectSell = getGui(guiElements.txtButtons, "OpenSell");
        if (selectSell) selectSell.BackgroundTransparency = 0.2;
        if (instance.IsA("GuiObject")) {
            instance.BackgroundTransparency = .55;
        }

        // const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        // if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = true;
        if (sellFrame) sellFrame.Visible = false;

        const confirmTranscationCredits = getGui(guiElements.txtButtons, "ConfirmTransactionCredits");
        const confirmTranscationValor = getGui(guiElements.txtButtons, "ConfirmTransactionValor");
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        if (confirmTranscationCredits && confirmTranscationValor && priceScroll) {
            confirmTranscationCredits.SetAttribute("Transaction", "Buy");
            confirmTranscationValor.SetAttribute("Transaction", "Buy");
            priceScroll.SetAttribute("Transaction", "Buy");
        }

        const selectedItemImageLabel = getGui(guiElements.imgLabels, "SelectedItemImageLabel");
        const selectedItemTextLabel = getGui(guiElements.txtLabels, "SelectedItemTextLabel");
        const selectedItemCreditsLabel = getGui(guiElements.txtLabels, "SelectedItemCreditsLabel");
        const selectedItemValorLabel = getGui(guiElements.txtLabels, "SelectedItemValorLabel");
        if (!selectedItemImageLabel || !selectedItemTextLabel || !selectedItemCreditsLabel || !selectedItemValorLabel) return;
        const selectedItem = instance.SetAttribute("Item", "");
        selectedItemTextLabel.Text = "Select an Item";
        selectedItemImageLabel.Image = "";
        selectedItemCreditsLabel.Text = "";
        selectedItemValorLabel.Text = "";

    },
    onOpenSell(instance: Instance, guiElements: GuiElements) {
        const selectBuy = getGui(guiElements.txtButtons, "OpenBuy");
        if (selectBuy) selectBuy.BackgroundTransparency = 0.2;
        if (instance.IsA("GuiObject")) {
            instance.BackgroundTransparency = .55;
        }

        // const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        // if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = true;

        const confirmTranscationCredits = getGui(guiElements.txtButtons, "ConfirmTransactionCredits");
        const confirmTranscationValor = getGui(guiElements.txtButtons, "ConfirmTransactionValor");
        const priceScroll = getGui(guiElements.txtBox, "PriceScroll");
        if (confirmTranscationCredits && confirmTranscationValor && priceScroll) {
            confirmTranscationCredits.SetAttribute("Transaction", "Sell");
            confirmTranscationValor.SetAttribute("Transaction", "Sell");
            priceScroll.SetAttribute("Transaction", "Sell");
        }

        const selectedItemImageLabel = getGui(guiElements.imgLabels, "SelectedItemImageLabel");
        const selectedItemTextLabel = getGui(guiElements.txtLabels, "SelectedItemTextLabel");
        const selectedItemCreditsLabel = getGui(guiElements.txtLabels, "SelectedItemCreditsLabel");
        const selectedItemValorLabel = getGui(guiElements.txtLabels, "SelectedItemValorLabel");
        if (!selectedItemImageLabel || !selectedItemTextLabel || !selectedItemCreditsLabel || !selectedItemValorLabel) return;
        const selectedItem = instance.SetAttribute("Item", "");
        selectedItemTextLabel.Text = "Select an Item";
        selectedItemImageLabel.Image = "";
        selectedItemCreditsLabel.Text = "";
        selectedItemValorLabel.Text = "";
    },
    onOpenVIP(instance: Instance, guiElements: GuiElements) {
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = true;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = false;
    },
}
